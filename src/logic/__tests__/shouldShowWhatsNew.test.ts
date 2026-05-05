import { createMemoryStorage } from '../../storage/memoryStorage';
import { shouldShowWhatsNew } from '../shouldShowWhatsNew';

const releases = [
  {
    version: '1.0.0',
    features: [{ title: 'Initial release' }],
  },
  {
    version: '1.1.0',
    features: [{ title: 'Better release notes' }],
  },
];

describe('shouldShowWhatsNew', () => {
  it('shows the newest unseen release once per release', async () => {
    const storage = createMemoryStorage();
    const firstResult = await shouldShowWhatsNew({ releases, storage });

    expect(firstResult.shouldShow).toBe(true);
    expect(firstResult.release?.version).toBe('1.1.0');

    await storage.setItem('expo-whats-new:seen-release', '1.1.0');

    const secondResult = await shouldShowWhatsNew({ releases, storage });

    expect(secondResult.shouldShow).toBe(false);
    expect(secondResult.release?.version).toBe('1.1.0');
  });

  it('does not auto-show in manual mode', async () => {
    const result = await shouldShowWhatsNew({
      releases,
      storage: createMemoryStorage(),
      displayPolicy: 'manual',
    });

    expect(result.shouldShow).toBe(false);
    expect(result.release?.version).toBe('1.1.0');
  });

  it('shows policy releases until they are accepted', async () => {
    const storage = createMemoryStorage();
    const policyReleases = [
      {
        version: '2.0.0',
        kind: 'policy' as const,
        title: 'Updated Terms',
        features: [{ title: 'Terms changed' }],
      },
    ];

    await storage.setItem(
      'expo-whats-new:seen-release',
      JSON.stringify({
        version: '2.0.0',
        status: 'seen',
        updatedAt: '2026-05-05T00:00:00.000Z',
      })
    );

    await expect(shouldShowWhatsNew({ releases: policyReleases, storage })).resolves.toMatchObject({
      shouldShow: true,
    });

    await storage.setItem(
      'expo-whats-new:seen-release',
      JSON.stringify({
        version: '2.0.0',
        status: 'accepted',
        updatedAt: '2026-05-05T00:00:00.000Z',
      })
    );

    await expect(shouldShowWhatsNew({ releases: policyReleases, storage })).resolves.toMatchObject({
      shouldShow: false,
    });
  });
});
