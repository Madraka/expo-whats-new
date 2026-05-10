import { resolveCurrentRelease } from '../releaseResolver';

describe('resolveCurrentRelease', () => {
  it('returns the newest release matching platform and audience', () => {
    const release = resolveCurrentRelease(
      [
        { version: '1.0.0', platform: ['ios'], features: [{ title: 'iOS only' }] },
        { version: '1.1.0', platform: ['android'], features: [{ title: 'Android only' }] },
        { version: '1.2.0', audience: ['beta'], features: [{ title: 'Beta only' }] },
      ],
      {
        platform: 'ios',
        audience: 'stable',
      }
    );

    expect(release?.version).toBe('1.0.0');
  });

  it('does not match audience-targeted releases when no host audience is provided', () => {
    const release = resolveCurrentRelease(
      [
        { version: '1.0.0', features: [{ title: 'Stable' }] },
        { version: '1.1.0', audience: ['beta'], features: [{ title: 'Beta only' }] },
      ],
      {
        platform: 'ios',
      }
    );

    expect(release?.version).toBe('1.0.0');
  });

  it('lets host-owned experiment providers select same-version variants by audience', () => {
    const release = resolveCurrentRelease(
      [
        { id: 'onboarding-a', version: '2.0.0', audience: 'variant-a', features: [{ title: 'Short copy' }] },
        { id: 'onboarding-b', version: '2.0.0', audience: 'variant-b', features: [{ title: 'Guided copy' }] },
      ],
      {
        audience: 'variant-b',
      }
    );

    expect(release?.id).toBe('onboarding-b');
    expect(release?.features[0]?.title).toBe('Guided copy');
  });

  it('matches locale by language fallback', () => {
    const release = resolveCurrentRelease(
      [
        { version: '1.0.0', locale: 'en', features: [{ title: 'English' }] },
        { version: '1.1.0', locale: 'tr', features: [{ title: 'Turkish' }] },
      ],
      {
        locale: 'tr-TR',
      }
    );

    expect(release?.version).toBe('1.1.0');
  });

  it('filters releases by app version', () => {
    const release = resolveCurrentRelease(
      [
        { version: '1.0.0', maxAppVersion: '1.9.9', features: [{ title: 'Old app' }] },
        { version: '2.0.0', minAppVersion: '2.0.0', features: [{ title: 'New app' }] },
      ],
      {
        appVersion: '1.5.0',
      }
    );

    expect(release?.version).toBe('1.0.0');
  });
});
