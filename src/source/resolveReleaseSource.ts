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

function createAbortController(timeoutMs?: number) {
  const controller = typeof AbortController !== 'undefined' && timeoutMs ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;

  return { controller, timeout };
}

async function fetchRemotePayload(source: Extract<WhatsNewReleaseSource, { type: 'remote' }>) {
  const { controller, timeout } = createAbortController(source.timeoutMs);

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

async function loadCustomPayload(source: Extract<WhatsNewReleaseSource, { type: 'custom' }>) {
  const { controller, timeout } = createAbortController(source.timeoutMs);

  try {
    return await source.loader({ signal: controller?.signal });
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

function parseCachedEntry(value: string): { releases: WhatsNewRelease[]; expiresAt?: string } {
  const parsed = JSON.parse(value) as unknown;
  const envelope = remoteReleaseCacheEnvelopeSchema.safeParse(parsed);

  if (envelope.success) {
    return {
      releases: envelope.data.releases,
      expiresAt: envelope.data.expiresAt,
    };
  }

  return {
    releases: parseRemotePayload(parsed),
  };
}

async function readCachedEntry(storage: WhatsNewStorageAdapter | undefined, cacheKey: string) {
  const cachedValue = await storage?.getItem(cacheKey);

  if (!cachedValue) {
    return null;
  }

  try {
    return parseCachedEntry(cachedValue);
  } catch {
    await storage?.removeItem(cacheKey);
    return null;
  }
}

function isCacheFresh(entry: { expiresAt?: string }) {
  if (!entry.expiresAt) {
    return true;
  }

  return new Date(entry.expiresAt).getTime() > Date.now();
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

  const cacheIdentity = source.cacheKey ?? (source.type === 'remote' ? source.url : source.key);
  const cacheKey = `${storageKeyPrefix}:${cacheIdentity}`;
  const shouldUseCache = source.cache !== false && storage;

  if (source.requestPolicy === 'cache-first' && shouldUseCache) {
    const cachedEntry = await readCachedEntry(storage, cacheKey);

    if (cachedEntry && isCacheFresh(cachedEntry)) {
      return applyLocalization(cachedEntry.releases, locale, fallbackLocale);
    }
  }

  try {
    const payload = source.type === 'remote' ? await fetchRemotePayload(source) : await loadCustomPayload(source);
    const remoteReleases = parseRemotePayload(payload);

    if (shouldUseCache) {
      await storage.setItem(cacheKey, JSON.stringify(createCacheEnvelope(remoteReleases, source.cacheTtlMs)));
    }

    return applyLocalization(remoteReleases, locale, fallbackLocale);
  } catch (error) {
    if (shouldUseCache) {
      const cachedEntry = await readCachedEntry(storage, cacheKey);

      if (cachedEntry) {
        return applyLocalization(cachedEntry.releases, locale, fallbackLocale);
      }
    }

    throw error;
  }
}
