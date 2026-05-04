import type { PlatformTarget, WhatsNewRelease } from '../ExpoWhatsNew.types';
import { compareVersions } from './versionComparator';

function includesTarget(value: string | string[] | undefined, target: string | string[] | undefined) {
  if (!value || !target) {
    return true;
  }

  const values = Array.isArray(value) ? value : [value];
  const targets = Array.isArray(target) ? target : [target];

  return values.some((item) => targets.includes(item));
}

export function matchesReleaseTarget(
  release: WhatsNewRelease,
  options: {
    platform?: PlatformTarget;
    locale?: string;
    audience?: string | string[];
    appVersion?: string | null;
  }
) {
  if (release.platform && options.platform && !release.platform.includes(options.platform)) {
    return false;
  }

  if (!includesTarget(release.locale, options.locale)) {
    return false;
  }

  if (!includesTarget(release.audience, options.audience)) {
    return false;
  }

  if (options.appVersion && release.minAppVersion && compareVersions(options.appVersion, release.minAppVersion) < 0) {
    return false;
  }

  if (options.appVersion && release.maxAppVersion && compareVersions(options.appVersion, release.maxAppVersion) > 0) {
    return false;
  }

  return true;
}
