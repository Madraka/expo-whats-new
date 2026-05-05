import type { WhatsNewAcknowledgementStatus, WhatsNewRelease, WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';

export type StoredAcknowledgement = {
  version: string;
  releaseId?: string;
  status: WhatsNewAcknowledgementStatus;
  updatedAt: string;
};

export function getAcknowledgementMode(release: WhatsNewRelease) {
  return release.acknowledgement?.mode ?? (release.kind === 'policy' || release.kind === 'consent' ? 'accepted' : 'seen');
}

export function isRequiredRelease(release: WhatsNewRelease) {
  return release.acknowledgement?.required === true || release.kind === 'policy' || release.kind === 'consent';
}

export function getAcceptLabel(release: WhatsNewRelease, fallback: string) {
  return release.acknowledgement?.acceptLabel ?? (getAcknowledgementMode(release) === 'accepted' ? 'Continue' : fallback);
}

export function parseStoredAcknowledgement(value: string | null): StoredAcknowledgement | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredAcknowledgement>;

    if (parsed.version && parsed.status) {
      return {
        version: parsed.version,
        releaseId: parsed.releaseId,
        status: parsed.status,
        updatedAt: parsed.updatedAt ?? '',
      };
    }
  } catch {
    return {
      version: value,
      status: 'seen',
      updatedAt: '',
    };
  }

  return null;
}

export function isReleaseAcknowledged(release: WhatsNewRelease, stored: StoredAcknowledgement | null) {
  if (stored?.version !== release.version) {
    return false;
  }

  if (release.id && stored.releaseId && stored.releaseId !== release.id) {
    return false;
  }

  return getAcknowledgementMode(release) === 'accepted' ? stored.status === 'accepted' : stored.status !== 'declined';
}

export async function setReleaseAcknowledgement(
  storage: WhatsNewStorageAdapter,
  storageKey: string,
  release: WhatsNewRelease,
  status: WhatsNewAcknowledgementStatus
) {
  await storage.setItem(
    storageKey,
    JSON.stringify({
      version: release.version,
      releaseId: release.id,
      status,
      updatedAt: new Date().toISOString(),
    } satisfies StoredAcknowledgement)
  );
}
