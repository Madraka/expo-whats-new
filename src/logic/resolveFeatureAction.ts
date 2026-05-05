import type { WhatsNewFeature, WhatsNewRelease } from '../ExpoWhatsNew.types';

export const DEFAULT_ALLOWED_URL_SCHEMES = ['https', 'http', 'mailto', 'tel'];

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

export type ResolveFeatureActionOptions = {
  allowedUrlSchemes?: string[];
};

function getUrlScheme(url: string) {
  return url.trim().match(/^([a-z][a-z0-9+.-]*):/i)?.[1].toLowerCase() ?? null;
}

function isAllowedUrl(url: string, allowedUrlSchemes: string[]) {
  const scheme = getUrlScheme(url);

  if (!scheme) {
    return false;
  }

  return allowedUrlSchemes.map((allowedScheme) => allowedScheme.toLowerCase()).includes(scheme);
}

export function resolveFeatureAction(
  feature: WhatsNewFeature,
  release: WhatsNewRelease,
  options: ResolveFeatureActionOptions = {}
): ResolvedFeatureAction {
  if (!feature.action) {
    return { type: 'none' };
  }

  if (feature.action.url) {
    if (!isAllowedUrl(feature.action.url, options.allowedUrlSchemes ?? DEFAULT_ALLOWED_URL_SCHEMES)) {
      return { type: 'none' };
    }

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
