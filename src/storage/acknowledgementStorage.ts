import type { WhatsNewAcknowledgementStatus, WhatsNewRelease, WhatsNewStorageAdapter } from '../ExpoWhatsNew.types';

export type StoredAcknowledgement = {
  version: string;
  releaseId?: string;
  status: WhatsNewAcknowledgementStatus;
  updatedAt: string;
};

export type StoredAcknowledgementMap = {
  schemaVersion: 1;
  releases: Record<string, StoredAcknowledgement>;
};

export type StoredAcknowledgementState = StoredAcknowledgement | StoredAcknowledgementMap;

function getReleaseIdentity(release: WhatsNewRelease) {
  return release.id ?? release.version;
}

function isAcknowledgement(value: Partial<StoredAcknowledgement>): value is StoredAcknowledgement {
  return Boolean(value.version && value.status);
}

function isAcknowledgementMap(value: Partial<StoredAcknowledgementMap>): value is StoredAcknowledgementMap {
  return value.schemaVersion === 1 && Boolean(value.releases && typeof value.releases === 'object');
}

export function getAcknowledgementMode(release: WhatsNewRelease) {
  return release.acknowledgement?.mode ?? (release.kind === 'policy' || release.kind === 'consent' ? 'accepted' : 'seen');
}

export function isRequiredRelease(release: WhatsNewRelease) {
  return release.acknowledgement?.required === true || release.kind === 'policy' || release.kind === 'consent';
}

export function getAcceptLabel(release: WhatsNewRelease, fallback: string) {
  return release.acknowledgement?.acceptLabel ?? (getAcknowledgementMode(release) === 'accepted' ? 'Continue' : fallback);
}

export function parseStoredAcknowledgement(value: string | null): StoredAcknowledgementState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredAcknowledgementMap> & Partial<StoredAcknowledgement>;

    if (isAcknowledgementMap(parsed)) {
      return parsed;
    }

    if (isAcknowledgement(parsed)) {
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

function getStoredReleaseAcknowledgement(release: WhatsNewRelease, stored: StoredAcknowledgementState | null) {
  if (!stored) {
    return null;
  }

  if ('releases' in stored) {
    return stored.releases[getReleaseIdentity(release)] ?? null;
  }

  return stored;
}

export function isReleaseAcknowledged(release: WhatsNewRelease, stored: StoredAcknowledgementState | null) {
  const storedRelease = getStoredReleaseAcknowledgement(release, stored);

  if (storedRelease?.version !== release.version) {
    return false;
  }

  if (release.id && storedRelease.releaseId && storedRelease.releaseId !== release.id) {
    return false;
  }

  return getAcknowledgementMode(release) === 'accepted' ? storedRelease.status === 'accepted' : storedRelease.status !== 'declined';
}

export async function setReleaseAcknowledgement(
  storage: WhatsNewStorageAdapter,
  storageKey: string,
  release: WhatsNewRelease,
  status: WhatsNewAcknowledgementStatus
) {
  const storedState = parseStoredAcknowledgement(await storage.getItem(storageKey));
  const releases = 'releases' in (storedState ?? {}) ? { ...(storedState as StoredAcknowledgementMap).releases } : {};
  const releaseIdentity = getReleaseIdentity(release);

  releases[releaseIdentity] = {
    version: release.version,
    releaseId: release.id,
    status,
    updatedAt: new Date().toISOString(),
  };

  await storage.setItem(
    storageKey,
    JSON.stringify({
      schemaVersion: 1,
      releases,
    } satisfies StoredAcknowledgementMap)
  );
}
