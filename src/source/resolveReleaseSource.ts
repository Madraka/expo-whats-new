import type { WhatsNewRelease, WhatsNewReleaseSource, WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';

export const DEFAULT_REMOTE_CACHE_KEY_PREFIX = 'expo-whats-new:remote-cache';

type ResolveReleaseSourceOptions = {
  source?: WhatsNewReleaseSource;
  releases?: WhatsNewRelease[];
  storage?: WhatsNewStorageAdapter;
  storageKeyPrefix?: string;
};

function parseRemotePayload(payload: unknown): WhatsNewRelease[] {
  if (Array.isArray(payload)) {
    return payload as WhatsNewRelease[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'releases' in payload &&
    Array.isArray((payload as { releases?: unknown }).releases)
  ) {
    return (payload as { releases: WhatsNewRelease[] }).releases;
  }

  throw new Error('Remote whats-new source must be an array or an object with a releases array.');
}

async function fetchRemotePayload(source: Extract<WhatsNewReleaseSource, { type: 'remote' }>) {
  if (source.fetcher) {
    return source.fetcher(source.url, { headers: source.headers });
  }

  const response = await fetch(source.url, { headers: source.headers });

  if (!response.ok) {
    throw new Error(`Failed to load whats-new releases from ${source.url}: ${response.status}`);
  }

  return response.json();
}

export async function resolveReleaseSource({
  source,
  releases,
  storage,
  storageKeyPrefix = DEFAULT_REMOTE_CACHE_KEY_PREFIX,
}: ResolveReleaseSourceOptions): Promise<WhatsNewRelease[]> {
  if (!source) {
    return releases ?? [];
  }

  if (source.type === 'static') {
    return source.releases;
  }

  const cacheKey = `${storageKeyPrefix}:${source.url}`;

  try {
    const payload = await fetchRemotePayload(source);
    const remoteReleases = parseRemotePayload(payload);

    if (source.cache !== false && storage) {
      await storage.setItem(cacheKey, JSON.stringify(remoteReleases));
    }

    return remoteReleases;
  } catch (error) {
    if (source.cache !== false && storage) {
      const cachedValue = await storage.getItem(cacheKey);

      if (cachedValue) {
        return JSON.parse(cachedValue) as WhatsNewRelease[];
      }
    }

    throw error;
  }
}
