import type { WhatsNewFeature, WhatsNewRelease } from '../ExpoWhatsNew.types';

export type ResolvedFeatureAction =
  | {
      type: 'none';
    }
  | {
      type: 'url';
      url: string;
    }
  | {
      type: 'custom';
      feature: WhatsNewFeature;
      release: WhatsNewRelease;
    };

export function resolveFeatureAction(feature: WhatsNewFeature, release: WhatsNewRelease): ResolvedFeatureAction {
  if (!feature.action) {
    return { type: 'none' };
  }

  if (feature.action.url) {
    return {
      type: 'url',
      url: feature.action.url,
    };
  }

  return {
    type: 'custom',
    feature,
    release,
  };
}
