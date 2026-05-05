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
  types.ts
  native/
    ExpoWhatsNewModule.ts
  logic/
    releaseResolver.ts
    shouldShowWhatsNew.ts
    versionComparator.ts
    targeting.ts
  storage/
    StorageAdapter.ts
    createDefaultStorage.ts
    memoryStorage.ts
    webStorage.ts
  react/
    WhatsNewProvider.tsx
    useWhatsNew.ts
    WhatsNewModal.tsx
    WhatsNewScreen.tsx
    WhatsNewInline.tsx
  theme/
    defaultTheme.ts
    resolveTheme.ts
  analytics/
    AnalyticsAdapter.ts
  source/
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

- Web: `localStorage`, with memory fallback
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

Older array-only cache entries are still readable. When a remote URL returns different release JSON by locale, audience, or authorization headers, the host app should provide `source.cacheKey` so cached payloads cannot cross streams.

## Release Schema

```ts
export type WhatsNewRelease = {
  version: string;
  id?: string;
  title?: string;
  subtitle?: string;
  date?: string;
  features: WhatsNewFeature[];
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

## Delivery Phases

### v0.1 Core

- Replace scaffold demo API with package API
- Add typed release schema
- Add storage adapter contract
- Add native storage through UserDefaults and SharedPreferences
- Add release resolver and display policy logic
- Add Provider, hook, and modal
- Add focused unit tests
- Update example app to demonstrate first-launch and reset flows

### v0.2 Product

- Add fullscreen and inline variants
- Add analytics callbacks
- Add platform and locale targeting
- Add remote JSON source support
- Add cache behavior for remote releases

### v1.0 Package Quality

- Stable exports
- Config plugin if native configuration becomes necessary
- Complete README and API docs
- CI for typecheck, lint, test, build
- iOS, Android, and Web example verification
