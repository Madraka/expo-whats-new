import { createMemoryStorage } from '../storage/memoryStorage';
import { resolveReleaseSource } from './resolveReleaseSource';

const releases = [
  {
    version: '1.0.0',
    features: [{ title: 'Initial release' }],
  },
];

describe('resolveReleaseSource', () => {
  it('returns static releases', async () => {
    await expect(resolveReleaseSource({ source: { type: 'static', releases } })).resolves.toEqual(releases);
  });

  it('loads remote releases from an array payload', async () => {
    const result = await resolveReleaseSource({
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        fetcher: async () => releases,
      },
    });

    expect(result).toEqual(releases);
  });

  it('loads releases from custom sources such as Supabase or SQLite adapters', async () => {
    const loader = jest.fn(async () => ({
      releases,
    }));

    const result = await resolveReleaseSource({
      source: {
        type: 'custom',
        key: 'supabase:whats_new_events',
        loader,
      },
    });

    expect(result).toEqual(releases);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('uses cache-first policy for custom sources', async () => {
    const cachedReleases = [{ version: '1.0.0', features: [{ title: 'SQLite cached' }] }];
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:sqlite:release_events': JSON.stringify({
        schemaVersion: 1,
        fetchedAt: '2026-05-05T00:00:00.000Z',
        expiresAt: '2999-05-05T00:00:00.000Z',
        releases: cachedReleases,
      }),
    });
    const loader = jest.fn(async () => releases);

    const result = await resolveReleaseSource({
      storage,
      source: {
        type: 'custom',
        key: 'sqlite:release_events',
        requestPolicy: 'cache-first',
        loader,
      },
    });

    expect(result).toEqual(cachedReleases);
    expect(loader).not.toHaveBeenCalled();
  });

  it('loads cached remote releases when the network request fails', async () => {
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:https://example.com/releases.json': JSON.stringify({
        schemaVersion: 1,
        fetchedAt: '2026-05-05T00:00:00.000Z',
        releases,
      }),
    });

    const result = await resolveReleaseSource({
      storage,
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        fetcher: async () => {
          throw new Error('offline');
        },
      },
    });

    expect(result).toEqual(releases);
  });

  it('keeps backward compatibility with old array cache entries', async () => {
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:https://example.com/releases.json': JSON.stringify(releases),
    });

    const result = await resolveReleaseSource({
      storage,
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        fetcher: async () => {
          throw new Error('offline');
        },
      },
    });

    expect(result).toEqual(releases);
  });

  it('uses fresh cache before network with cache-first policy', async () => {
    const cachedReleases = [{ version: '1.0.0', features: [{ title: 'Cached' }] }];
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:https://example.com/releases.json': JSON.stringify({
        schemaVersion: 1,
        fetchedAt: '2026-05-05T00:00:00.000Z',
        expiresAt: '2999-05-05T00:00:00.000Z',
        releases: cachedReleases,
      }),
    });
    const fetcher = jest.fn(async () => releases);

    const result = await resolveReleaseSource({
      storage,
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        requestPolicy: 'cache-first',
        fetcher,
      },
    });

    expect(result).toEqual(cachedReleases);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('refreshes expired cache with cache-first policy', async () => {
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:https://example.com/releases.json': JSON.stringify({
        schemaVersion: 1,
        fetchedAt: '2026-05-05T00:00:00.000Z',
        expiresAt: '2000-05-05T00:00:00.000Z',
        releases: [{ version: '1.0.0', features: [{ title: 'Expired' }] }],
      }),
    });
    const fetcher = jest.fn(async () => releases);

    const result = await resolveReleaseSource({
      storage,
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        requestPolicy: 'cache-first',
        fetcher,
      },
    });

    expect(result).toEqual(releases);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('falls back to stale expired cache when refresh fails', async () => {
    const cachedReleases = [{ version: '1.0.0', features: [{ title: 'Stale' }] }];
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:https://example.com/releases.json': JSON.stringify({
        schemaVersion: 1,
        fetchedAt: '2026-05-05T00:00:00.000Z',
        expiresAt: '2000-05-05T00:00:00.000Z',
        releases: cachedReleases,
      }),
    });

    const result = await resolveReleaseSource({
      storage,
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        requestPolicy: 'cache-first',
        fetcher: async () => {
          throw new Error('offline');
        },
      },
    });

    expect(result).toEqual(cachedReleases);
  });

  it('removes corrupt cache and continues with network', async () => {
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:https://example.com/releases.json': '{bad-json',
    });

    const result = await resolveReleaseSource({
      storage,
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        requestPolicy: 'cache-first',
        fetcher: async () => releases,
      },
    });

    expect(result).toEqual(releases);
    expect(await storage.getItem('expo-whats-new:remote-cache:https://example.com/releases.json')).toContain('schemaVersion');
  });

  it('does not mask network errors with corrupt cache fallback', async () => {
    const storage = createMemoryStorage({
      'expo-whats-new:remote-cache:https://example.com/releases.json': '{bad-json',
    });

    await expect(
      resolveReleaseSource({
        storage,
        source: {
          type: 'remote',
          url: 'https://example.com/releases.json',
          fetcher: async () => {
            throw new Error('offline');
          },
        },
      })
    ).rejects.toThrow('offline');

    await expect(storage.getItem('expo-whats-new:remote-cache:https://example.com/releases.json')).resolves.toBeNull();
  });

  it('supports object payloads with a releases array', async () => {
    const result = await resolveReleaseSource({
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        fetcher: async () => ({ releases }),
      },
    });

    expect(result).toEqual(releases);
  });

  it('rejects invalid remote release payloads before they reach UI', async () => {
    await expect(
      resolveReleaseSource({
        source: {
          type: 'remote',
          url: 'https://example.com/releases.json',
          fetcher: async () => ({ releases: [{ version: '1.0.0', features: [] }] }),
        },
      })
    ).rejects.toThrow('Invalid remote whats-new payload');
  });

  it('hydrates localized release content with language fallback', async () => {
    const result = await resolveReleaseSource({
      locale: 'tr-TR',
      fallbackLocale: 'en',
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        fetcher: async () => ({
          releases: [
            {
              version: '1.0.0',
              title: 'Default title',
              features: [{ title: 'Default feature' }],
              acknowledgement: { mode: 'accepted', acceptLabel: 'Continue' },
              localizations: {
                tr: {
                  title: 'Turkce baslik',
                  features: [{ title: 'Turkce ozellik', description: 'Aciklama' }],
                  acknowledgement: { acceptLabel: 'Surdur' },
                },
              },
            },
          ],
        }),
      },
    });

    expect(result[0]).toMatchObject({
      title: 'Turkce baslik',
      acknowledgement: { acceptLabel: 'Surdur' },
      features: [{ title: 'Turkce ozellik', description: 'Aciklama' }],
    });
  });

  it('accepts guide presentation payloads with media descriptors', async () => {
    const result = await resolveReleaseSource({
      source: {
        type: 'remote',
        url: 'https://example.com/releases.json',
        fetcher: async () => ({
          releases: [
            {
              id: 'guide',
              version: '1.0.0',
              presentation: 'guide',
              features: [{ title: 'Guide fallback' }],
              steps: [
                {
                  title: 'Animated step',
                  description: 'Rendered by the host app.',
                  media: {
                    type: 'lottie',
                    assetId: 'onboarding-step',
                    aspectRatio: 1.6,
                    autoplay: true,
                    loop: true,
                  },
                },
              ],
            },
          ],
        }),
      },
    });

    expect(result[0]).toMatchObject({
      presentation: 'guide',
      steps: [
        {
          media: {
            type: 'lottie',
            assetId: 'onboarding-step',
          },
        },
      ],
    });
  });
});
