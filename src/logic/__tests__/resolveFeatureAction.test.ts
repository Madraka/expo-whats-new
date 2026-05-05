import { resolveFeatureAction } from '../resolveFeatureAction';

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

  it('blocks urls with schemes that are not explicitly allowed', () => {
    expect(
      resolveFeatureAction(
        {
          title: 'Feature',
          action: {
            label: 'Open',
            url: 'javascript:alert(1)',
          },
        },
        release
      )
    ).toEqual({ type: 'none' });
  });

  it('allows host app schemes when configured', () => {
    expect(
      resolveFeatureAction(
        {
          title: 'Feature',
          action: {
            label: 'Open',
            url: 'myapp://release/1',
          },
        },
        release,
        { allowedUrlSchemes: ['myapp'] }
      )
    ).toEqual({
      type: 'url',
      url: 'myapp://release/1',
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
