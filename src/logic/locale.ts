import type { WhatsNewRelease } from '../ExpoWhatsNew.types';

export function normalizeLocale(locale?: string | null) {
  return locale?.trim().replace(/_/g, '-').toLowerCase() || null;
}

export function getLocaleCandidates(locale?: string | null, fallbackLocale?: string | null) {
  const candidates: string[] = [];

  for (const value of [locale, fallbackLocale]) {
    const normalized = normalizeLocale(value);

    if (!normalized) {
      continue;
    }

    candidates.push(normalized);

    const language = normalized.split('-')[0];

    if (language && language !== normalized) {
      candidates.push(language);
    }
  }

  return Array.from(new Set(candidates));
}

export function matchesLocale(value: string | string[] | undefined, locale?: string, fallbackLocale?: string) {
  if (!value) {
    return true;
  }

  const releaseLocales = (Array.isArray(value) ? value : [value]).reduce<string[]>((items, item) => {
    const normalized = normalizeLocale(item);

    if (normalized) {
      items.push(normalized);
    }

    return items;
  }, []);
  const candidates = getLocaleCandidates(locale, fallbackLocale);

  if (candidates.length === 0) {
    return true;
  }

  return releaseLocales.some((item) => candidates.includes(item));
}

export function localizeRelease(release: WhatsNewRelease, locale?: string, fallbackLocale?: string): WhatsNewRelease {
  if (!release.localizations) {
    return release;
  }

  const localizationKey = getLocaleCandidates(locale, fallbackLocale).find((candidate) => release.localizations?.[candidate]);
  const localization = localizationKey ? release.localizations[localizationKey] : null;

  if (!localization) {
    return release;
  }

  return {
    ...release,
    title: localization.title ?? release.title,
    subtitle: localization.subtitle ?? release.subtitle,
    features: localization.features ?? release.features,
    acknowledgement: localization.acknowledgement
      ? {
          ...release.acknowledgement,
          ...localization.acknowledgement,
        }
      : release.acknowledgement,
  };
}
