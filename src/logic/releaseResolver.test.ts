import { resolveCurrentRelease } from './releaseResolver';

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
});
