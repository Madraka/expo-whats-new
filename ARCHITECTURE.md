# expo-whats-new Architecture

`expo-whats-new` is a JS-first universal Expo package for showing product release notes inside Expo and React Native apps.

The package should feel like an Expo-quality product package: typed API, clear platform behavior, deterministic storage, testable core logic, and a small native surface.

## Product Boundary

The package owns:

- Release note schema and selection logic
- Policy, consent, and acknowledgement events
- Display policies such as once per release
- Remote payload validation, cache envelopes, and localization hydration
- Storage adapter contracts
- React Provider and hook APIs
- Default React Native UI components
- Web behavior through localStorage-compatible adapters
- Native capabilities through Expo Modules API
- Static and remote release sources

The package does not own:

- App analytics SDKs
- Navigation libraries
- Host locale discovery such as `expo-localization`
- Expo Router route definitions
- Legal copy authoring or compliance decisions
- Remote config vendors
- Native modal presentation
- Heavy native UI

## Layer Model

```txt
src/
  index.ts
  headless.ts
  ExpoWhatsNew.types.ts
  ExpoWhatsNewModule.ts
  ExpoWhatsNewModule.web.ts
  logic/
    releaseResolver.ts
    resolveFeatureAction.ts
    shouldShowWhatsNew.ts
    targeting.ts
    versionComparator.ts
  storage/
    acknowledgementStorage.ts
    createDefaultStorage.ts
    memoryStorage.ts
    nativeStorage.ts
    webStorage.ts
  react/
    WhatsNewContext.ts
    WhatsNewDoneButton.tsx
    WhatsNewInline.tsx
    WhatsNewModal.tsx
    WhatsNewProvider.tsx
    WhatsNewScreen.tsx
    useWhatsNew.ts
  theme/
    defaultTheme.ts
    resolveTheme.ts
  source/
    remoteReleaseSchema.ts
    resolveReleaseSource.ts
```

## Public API

Primary React API:

```tsx
<WhatsNewProvider releases={releases} autoShow>
  <App />
  <WhatsNewModal />
</WhatsNewProvider>
```

Router-integrated apps should keep navigation in the app layer:

```tsx
<WhatsNewProvider autoShow onAutoShow={() => router.push('/whats-new')}>
  <Stack />
</WhatsNewProvider>
```

Native toolbar buttons are exposed as router-agnostic React components. Apps can mount them in Expo Router `headerRight`, React Navigation `headerRight`, or any native-stack equivalent:

```tsx
<Stack.Screen
  options={{
    headerRight: () => <WhatsNewDoneButton onDone={() => router.back()} />,
  }}
/>
<WhatsNewScreen showDoneButton={false} />
```

Apple-style required event sheets use the same package state but keep the native presentation in the app route. The route owns `presentation: 'formSheet'`, detents, and gesture policy; the package owns the event surface, feature rows, acknowledgement CTA, and required-dismiss behavior for the package fallback modal:

```tsx
<Stack.Screen
  name="whats-new"
  options={{
    headerShown: false,
    gestureEnabled: false,
    presentation: 'formSheet',
    sheetAllowedDetents: [0.92],
  }}
/>
<WhatsNewScreen variant="event-sheet" onDone={() => router.back()} />
```

Hook API:

```ts
const {
  visible,
  show,
  hide,
  markSeen,
  reset,
  currentRelease,
  hasUnseenRelease,
} = useWhatsNew();
```

Headless API:

```ts
const result = await shouldShowWhatsNew({
  releases,
  storage,
  displayPolicy: 'once-per-release',
});
```

## Native Surface

Native code should stay minimal for v1.

Target API:

```ts
type AppInfo = {
  platform: 'ios' | 'android' | 'web';
  version: string | null;
  buildNumber: string | null;
};

getAppInfo(): Promise<AppInfo>;
getItemAsync(key: string): Promise<string | null>;
setItemAsync(key: string, value: string): Promise<void>;
removeItemAsync(key: string): Promise<void>;
```

UI and product logic stay in TypeScript. Native code owns app info and platform persistence. This keeps Expo Go compatibility realistic while giving development builds and bare apps durable storage.

## Storage Strategy

All storage access goes through this contract:

```ts
export interface WhatsNewStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

Default behavior:

- Web: `localStorage`, with memory fallback when browser storage is unavailable or throws
- iOS development builds / bare: `UserDefaults`
- Android development builds / bare: `SharedPreferences`
- Expo Go: memory fallback when the custom native module is unavailable
- Custom: user-provided adapter

Remote cache entries use a metadata envelope:

```ts
type RemoteCacheEnvelope = {
  schemaVersion: 1;
  fetchedAt: string;
  expiresAt?: string;
  releases: WhatsNewRelease[];
};
```

Older array-only cache entries are still readable. When a remote URL returns different release JSON by locale, audience, authorization headers, auth state, tenant, or company, the host app should provide `source.cacheKey` so cached payloads cannot cross streams. Query tokens should not be treated as a stable cache identity.

Remote sources default to `network-first`: fetch the latest payload and fall back to cache if the request or validation fails. `requestPolicy: 'cache-first'` uses fresh cache before network, treats expired cache as refreshable, and still allows stale cache as an offline fallback.

Not every source is HTTP. `WhatsNewReleaseSource` also supports `type: 'custom'` for Supabase, SQLite, local JSON, feature-flag SDKs, or any app-owned repository. Custom loaders return unknown JSON and still pass through the same validation, localization, cache envelope, and targeting pipeline. The package does not import database clients.

## Release Schema

```ts
export type WhatsNewRelease = {
  version: string;
  id?: string;
  kind?: WhatsNewReleaseKind;
  title?: string;
  subtitle?: string;
  date?: string;
  presentation?: WhatsNewPresentation;
  features: WhatsNewFeature[];
  steps?: WhatsNewGuideStep[];
  acknowledgement?: WhatsNewAcknowledgement;
  minAppVersion?: string;
  maxAppVersion?: string;
  platform?: PlatformTarget[];
  locale?: string | string[];
  localizations?: Record<string, WhatsNewReleaseLocalization>;
  audience?: string | string[];
  metadata?: Record<string, unknown>;
};
```

Remote JSON is validated before use. `localizations` are hydrated after payload resolution and before release targeting. Locale matching normalizes BCP-47 tags and falls back by language, so a host-provided `tr-TR` locale can use a `tr` localization. The package does not import `expo-localization`; Expo apps pass `locale` and `fallbackLocale` into the provider.

The provider reads native app version and platform through the Expo module when available. Host apps can override both with `appVersion` and `platform`, which is important for web, Expo Go fallback behavior, white-label shells, or apps that source display version from their own runtime config.

Guide presentations use `presentation: 'guide'`, `steps`, media descriptors, and the `renderMedia` slot. The core package does not depend on Lottie, Rive, video, or icon libraries. Remote JSON carries stable media metadata such as `assetId`; host apps map those descriptors to trusted renderers and reduced-motion fallbacks.

Feature URL actions are guarded by allowed URL schemes before they reach React Native `Linking`. The default list covers `https`, `http`, `mailto`, and `tel`; host apps that need app-owned deep links pass `allowedUrlSchemes` or handle navigation through `onActionPress`.

## Delivery Phases

### v0.1 Core

- Typed release schema, remote schema validation, and cache envelopes
- Static, remote, and custom release sources
- Locale, platform, app-version, and fail-closed audience targeting
- Acknowledgement storage with version-only migration compatibility
- Provider, hook, modal, screen, inline, event-sheet, guide, and headless APIs
- URL scheme guarding for feature actions
- Native storage through UserDefaults and SharedPreferences, web storage with resilient memory fallback
- Focused logic/source/storage/react unit tests and an Expo Doctor-clean example app

### v0.2 Product

- Broaden example app scenarios and interactive guide showcases
- Add higher-level docs and API reference tables
- Add package size/API surface checks
- Add optional end-to-end example app smoke tests

### v1.0 Package Quality

- Stable exports
- Config plugin if native configuration becomes necessary
- Complete README and API docs
- CI for typecheck, lint, test, build
- iOS, Android, and Web example verification
