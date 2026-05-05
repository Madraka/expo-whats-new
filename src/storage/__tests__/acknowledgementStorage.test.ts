import { createMemoryStorage } from '../memoryStorage';
import {
  isReleaseAcknowledged,
  parseStoredAcknowledgement,
  setReleaseAcknowledgement,
} from '../acknowledgementStorage';

describe('acknowledgementStorage', () => {
  it('stores release id alongside version for stable acknowledgement identity', async () => {
    const storage = createMemoryStorage();

    await setReleaseAcknowledgement(
      storage,
      'test:key',
      {
        id: 'terms-2026-05',
        version: '2026.05',
        features: [{ title: 'Terms' }],
      },
      'seen'
    );

    expect(parseStoredAcknowledgement(await storage.getItem('test:key'))).toMatchObject({
      schemaVersion: 1,
      releases: {
        'terms-2026-05': {
          releaseId: 'terms-2026-05',
          version: '2026.05',
          status: 'seen',
        },
      },
    });
  });

  it('preserves multiple acknowledgements under the same storage key', async () => {
    const storage = createMemoryStorage();

    await setReleaseAcknowledgement(storage, 'test:key', { id: 'release-a', version: '1.0.0', features: [{ title: 'A' }] }, 'seen');
    await setReleaseAcknowledgement(storage, 'test:key', { id: 'release-b', version: '1.0.0', features: [{ title: 'B' }] }, 'accepted');

    const stored = parseStoredAcknowledgement(await storage.getItem('test:key'));

    expect(
      isReleaseAcknowledged({ id: 'release-a', version: '1.0.0', features: [{ title: 'A' }] }, stored)
    ).toBe(true);
    expect(
      isReleaseAcknowledged({ id: 'release-b', version: '1.0.0', features: [{ title: 'B' }] }, stored)
    ).toBe(true);
    expect(
      isReleaseAcknowledged({ id: 'release-c', version: '1.0.0', features: [{ title: 'C' }] }, stored)
    ).toBe(false);
  });

  it('does not acknowledge a release with a different stored release id', () => {
    expect(
      isReleaseAcknowledged(
        {
          id: 'new-policy',
          version: '2026.05',
          features: [{ title: 'New policy' }],
        },
        {
          schemaVersion: 1,
          releases: {
            'old-policy': {
              releaseId: 'old-policy',
              version: '2026.05',
              status: 'seen',
              updatedAt: '2026-05-05T00:00:00.000Z',
            },
          },
        }
      )
    ).toBe(false);
  });

  it('keeps old version-only acknowledgement entries readable', () => {
    expect(
      isReleaseAcknowledged(
        {
          id: 'new-policy',
          version: '2026.05',
          features: [{ title: 'New policy' }],
        },
        {
          version: '2026.05',
          status: 'seen',
          updatedAt: '2026-05-05T00:00:00.000Z',
        }
      )
    ).toBe(true);
  });

  it('migrates old single acknowledgement entries without losing them', async () => {
    const storage = createMemoryStorage({
      'test:key': JSON.stringify({
        version: '1.0.0',
        status: 'seen',
        updatedAt: '2026-05-05T00:00:00.000Z',
      }),
    });

    await setReleaseAcknowledgement(storage, 'test:key', { version: '1.1.0', features: [{ title: 'New' }] }, 'seen');

    const stored = parseStoredAcknowledgement(await storage.getItem('test:key'));

    expect(
      isReleaseAcknowledged({ version: '1.0.0', features: [{ title: 'Old' }] }, stored)
    ).toBe(true);
    expect(
      isReleaseAcknowledged({ version: '1.1.0', features: [{ title: 'New' }] }, stored)
    ).toBe(true);
  });
});
