import type { PlatformTarget, WhatsNewRelease } from '../ExpoWhatsNew.types';
import { matchesReleaseTarget } from './targeting';
import { compareVersions } from './versionComparator';

export function resolveCurrentRelease(
  releases: WhatsNewRelease[],
  options: {
    platform?: PlatformTarget;
    locale?: string;
    fallbackLocale?: string;
    audience?: string | string[];
    appVersion?: string | null;
  } = {}
) {
  return [...releases]
    .filter((release) => matchesReleaseTarget(release, options))
    .sort((left, right) => compareVersions(right.version, left.version))[0] ?? null;
}
