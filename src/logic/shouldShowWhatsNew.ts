import type { ShouldShowWhatsNewOptions, ShouldShowWhatsNewResult } from '../ExpoWhatsNew.types';
import { resolveCurrentRelease } from './releaseResolver';
import { isReleaseAcknowledged, parseStoredAcknowledgement } from '../storage/acknowledgementStorage';

export const DEFAULT_STORAGE_KEY = 'expo-whats-new:seen-release';

export async function shouldShowWhatsNew(options: ShouldShowWhatsNewOptions): Promise<ShouldShowWhatsNewResult> {
  const displayPolicy = options.displayPolicy ?? 'once-per-release';
  const release = resolveCurrentRelease(options.releases, {
    platform: options.platform,
    locale: options.locale,
    audience: options.audience,
  });

  if (!release) {
    return { shouldShow: false, release: null };
  }

  if (displayPolicy === 'always') {
    return { shouldShow: true, release };
  }

  if (displayPolicy === 'manual') {
    return { shouldShow: false, release };
  }

  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const storedAcknowledgement = parseStoredAcknowledgement(await options.storage.getItem(storageKey));

  return {
    shouldShow: !isReleaseAcknowledged(release, storedAcknowledgement),
    release,
  };
}
