import { createMemoryStorage } from './memoryStorage';
import {
  isReleaseAcknowledged,
  parseStoredAcknowledgement,
  setReleaseAcknowledgement,
} from './acknowledgementStorage';

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
      releaseId: 'terms-2026-05',
      version: '2026.05',
      status: 'seen',
    });
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
          releaseId: 'old-policy',
          version: '2026.05',
          status: 'seen',
          updatedAt: '2026-05-05T00:00:00.000Z',
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
});
