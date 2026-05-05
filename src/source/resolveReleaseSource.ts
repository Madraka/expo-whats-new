import type { WhatsNewRelease, WhatsNewReleaseSource, WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';
import { localizeRelease } from '../logic/locale';
import {
  formatRemoteReleaseIssues,
  remoteReleaseCacheEnvelopeSchema,
  remoteReleasePayloadSchema,
} from './remoteReleaseSchema';

export const DEFAULT_REMOTE_CACHE_KEY_PREFIX = 'expo-whats-new:remote-cache';

type ResolveReleaseSourceOptions = {
  source?: WhatsNewReleaseSource;
  releases?: WhatsNewRelease[];
  storage?: WhatsNewStorageAdapter;
  storageKeyPrefix?: string;
  locale?: string;
  fallbackLocale?: string;
};

function parseRemotePayload(payload: unknown): WhatsNewRelease[] {
  const result = remoteReleasePayloadSchema.safeParse(payload);

  if (!result.success) {
    throw new Error(`Invalid remote whats-new payload: ${formatRemoteReleaseIssues(result.error)}`);
  }

  return Array.isArray(result.data) ? result.data : result.data.releases;
}

async function fetchRemotePayload(source: Extract<WhatsNewReleaseSource, { type: 'remote' }>) {
  const controller = typeof AbortController !== 'undefined' && source.timeoutMs ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), source.timeoutMs) : null;

  if (source.fetcher) {
    try {
      return await source.fetcher(source.url, { headers: source.headers, signal: controller?.signal });
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  try {
    const response = await fetch(source.url, { headers: source.headers, signal: controller?.signal });

    if (!response.ok) {
      throw new Error(`Failed to load whats-new releases from ${source.url}: ${response.status}`);
    }

    return response.json();
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

function applyLocalization(releases: WhatsNewRelease[], locale?: string, fallbackLocale?: string) {
  return releases.map((release) => localizeRelease(release, locale, fallbackLocale));
}

function createCacheEnvelope(releases: WhatsNewRelease[], cacheTtlMs?: number) {
  const fetchedAt = new Date();

  return {
    schemaVersion: 1 as const,
    fetchedAt: fetchedAt.toISOString(),
    expiresAt: cacheTtlMs ? new Date(fetchedAt.getTime() + cacheTtlMs).toISOString() : undefined,
    releases,
  };
}

function parseCachedReleases(value: string): WhatsNewRelease[] {
  const parsed = JSON.parse(value) as unknown;
  const envelope = remoteReleaseCacheEnvelopeSchema.safeParse(parsed);

  if (envelope.success) {
    return envelope.data.releases;
  }

  return parseRemotePayload(parsed);
}

export async function resolveReleaseSource({
  source,
  releases,
  storage,
  storageKeyPrefix = DEFAULT_REMOTE_CACHE_KEY_PREFIX,
  locale,
  fallbackLocale,
}: ResolveReleaseSourceOptions): Promise<WhatsNewRelease[]> {
  if (!source) {
    return applyLocalization(releases ?? [], locale, fallbackLocale);
  }

  if (source.type === 'static') {
    return applyLocalization(source.releases, locale, fallbackLocale);
  }

  const cacheKey = `${storageKeyPrefix}:${source.cacheKey ?? source.url}`;

  try {
    const payload = await fetchRemotePayload(source);
    const remoteReleases = parseRemotePayload(payload);

    if (source.cache !== false && storage) {
      await storage.setItem(cacheKey, JSON.stringify(createCacheEnvelope(remoteReleases, source.cacheTtlMs)));
    }

    return applyLocalization(remoteReleases, locale, fallbackLocale);
  } catch (error) {
    if (source.cache !== false && storage) {
      const cachedValue = await storage.getItem(cacheKey);

      if (cachedValue) {
        return applyLocalization(parseCachedReleases(cachedValue), locale, fallbackLocale);
      }
    }

    throw error;
  }
}
