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

  it('loads cached remote releases when the network request fails', async () => {
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
});
