export { shouldShowWhatsNew } from './logic/shouldShowWhatsNew';
export { resolveCurrentRelease } from './logic/releaseResolver';
export { resolveFeatureAction } from './logic/resolveFeatureAction';
export type { ResolveFeatureActionOptions, ResolvedFeatureAction } from './logic/resolveFeatureAction';
export { compareVersions } from './logic/versionComparator';
export { resolveReleaseSource } from './source/resolveReleaseSource';
export { createDefaultStorage } from './storage/createDefaultStorage';
export { createMemoryStorage } from './storage/memoryStorage';
export { createNativeStorage } from './storage/nativeStorage';
export type {
  DisplayPolicy,
  ShouldShowWhatsNewOptions,
  ShouldShowWhatsNewResult,
  WhatsNewRelease,
  WhatsNewReleaseSource,
  WhatsNewStorageAdapter,
} from './ExpoWhatsNew.types';
