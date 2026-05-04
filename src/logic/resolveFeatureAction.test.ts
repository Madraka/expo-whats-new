import { resolveFeatureAction } from './resolveFeatureAction';

const release = {
  version: '1.0.0',
  features: [{ title: 'Feature' }],
};

describe('resolveFeatureAction', () => {
  it('resolves missing actions as none', () => {
    expect(resolveFeatureAction({ title: 'Feature' }, release)).toEqual({ type: 'none' });
  });

  it('resolves url actions before custom actions', () => {
    expect(
      resolveFeatureAction(
        {
          title: 'Feature',
          action: {
            label: 'Open',
            url: 'https://example.com',
            screen: 'Details',
          },
        },
        release
      )
    ).toEqual({
      type: 'url',
      url: 'https://example.com',
    });
  });

  it('resolves non-url actions as custom app actions', () => {
    const feature = {
      title: 'Feature',
      action: {
        label: 'Open screen',
        screen: 'Details',
      },
    };

    expect(resolveFeatureAction(feature, release)).toEqual({
      type: 'custom',
      feature,
      release,
    });
  });
});
