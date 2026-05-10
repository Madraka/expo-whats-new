# App Integration Guide

This guide is for application developers integrating `expo-whats-new` into an Expo or React Native app.

## App Boundary

`expo-whats-new` owns release validation, targeting, acknowledgement state, cache behavior, locale fallback, and composable UI contracts.

Your app owns:

- native navigation and sheet routes
- locale discovery, usually through `expo-localization`
- icons and symbol rendering
- media playback, including Lottie, Rive, images, video, and custom native views
- analytics
- auth and audience filtering
- Supabase, SQLite, filesystem, or feature-flag clients

Remote JSON should stay serializable. Store descriptors such as `media.assetId`, `media.type`, and `symbol`; do not store React nodes, callbacks, imported media modules, or binary payloads.

## Basic Usage

```tsx
import {
  WhatsNewModal,
  WhatsNewProvider,
  type WhatsNewRelease,
} from 'expo-whats-new';

const releases: WhatsNewRelease[] = [
  {
    version: '1.2.0',
    title: 'What is new in 1.2',
    subtitle: 'A cleaner release experience for Expo apps.',
    features: [
      {
        title: 'Smart release targeting',
        description: 'Show release notes once per version with deterministic storage.',
      },
      {
        title: 'Composable UI',
        description: 'Use the provider, hook, modal, inline view, screen, or headless logic.',
      },
    ],
  },
];

export default function App() {
  return (
    <WhatsNewProvider releases={releases} autoShow>
      <Root />
      <WhatsNewModal />
    </WhatsNewProvider>
  );
}
```

## Hook API

```tsx
import { useWhatsNew } from 'expo-whats-new';

function SettingsScreen() {
  const {
    currentRelease,
    error,
    hasUnseenRelease,
    refresh,
    show,
    status,
    markSeen,
    reset,
  } = useWhatsNew();

  // Render your own controls with the state above.
}
```

## Remote Releases

```tsx
<WhatsNewProvider
  source={{
    type: 'remote',
    url: 'https://cdn.example.com/whats-new.json',
    cache: true,
    cacheTtlMs: 1000 * 60 * 60,
    requestPolicy: 'cache-first',
    timeoutMs: 8000,
  }}
  locale="tr-TR"
  fallbackLocale="en"
  appVersion="2.1.0"
  autoShow
>
  <Root />
  <WhatsNewModal />
</WhatsNewProvider>
```

Remote payloads are validated at the package boundary before they reach UI. Payloads can be either an array:

```json
[
  {
    "version": "1.2.0",
    "title": "What is new",
    "features": [{ "title": "New dashboard" }]
  }
]
```

or an object with a `releases` array:

```json
{
  "schemaVersion": 1,
  "releases": [
    {
      "version": "1.2.0",
      "title": "What is new",
      "features": [{ "title": "New dashboard" }]
    }
  ]
}
```

For localized remote content, keep one release identity and put translated copy under `localizations`. This keeps acknowledgement state tied to the same release while allowing host apps to pass the active Expo locale.

```json
{
  "schemaVersion": 1,
  "releases": [
    {
      "id": "critical-alerts-intro",
      "version": "2.1.0",
      "kind": "policy",
      "platform": ["ios"],
      "features": [{ "title": "Sound the Alarm" }],
      "acknowledgement": {
        "mode": "accepted",
        "required": true
      },
      "localizations": {
        "en": {
          "title": "Welcome to Critical Alerts",
          "features": [
            {
              "title": "Sound the Alarm",
              "description": "Mark a reminder as critical so an alarm plays when it is due."
            }
          ],
          "acknowledgement": { "acceptLabel": "Continue" }
        },
        "tr": {
          "title": "Acil Anımsatıcılar’a Hoş Geldiniz",
          "features": [
            {
              "title": "Alarm Çalsın",
              "description": "Bir anımsatıcıyı acil olarak işaretleyin."
            }
          ],
          "acknowledgement": { "acceptLabel": "Sürdür" }
        }
      }
    }
  ]
}
```

The core package does not depend on `expo-localization`. Resolve the locale in your app and pass it in:

```tsx
import { getLocales } from 'expo-localization';

const locale = getLocales()[0]?.languageTag ?? 'en-US';

<WhatsNewProvider
  source={{ type: 'remote', url: 'https://cdn.example.com/whats-new.json' }}
  locale={locale}
  fallbackLocale="en"
>
  <Root />
</WhatsNewProvider>
```

Locale matching normalizes tags and falls back by language, so `tr-TR` can match a `tr` localization. The provider reads native app version and platform when the Expo module is available; web, Expo Go, SSR-like shells, and custom version systems can pass `appVersion` and `platform` explicitly. Web apps should pass `appVersion` when using `minAppVersion` or `maxAppVersion`, because browsers do not expose a native bundle version.

Remote cache entries are stored with metadata (`schemaVersion`, `fetchedAt`, `expiresAt`, `releases`) and older array-only cache entries remain readable. The default remote policy is `network-first`: fetch fresh data and fall back to cache on failure. Use `requestPolicy: 'cache-first'` with `cacheTtlMs` to return fresh cached content before hitting the network; expired cache refreshes from the network and still acts as a stale offline fallback. If one URL returns different payloads for different headers, locales, audiences, auth state, tenants, or companies, provide a stable `cacheKey` that includes that app-owned partition. Do not rely on query tokens as cache identity.

## Supabase, SQLite, And Custom Sources

Remote releases do not have to come from HTTP. Use `type: 'custom'` for Supabase, SQLite, local files, feature-flag SDKs, or any other source that can return the same JSON payload shape. Custom sources still use the same validation, localization, cache, and acknowledgement flow.

```tsx
<WhatsNewProvider
  source={{
    type: 'custom',
    key: 'supabase:whats_new_events',
    cache: true,
    cacheKey: 'company-a:whats-new',
    requestPolicy: 'cache-first',
    loader: async () => {
      const { data, error } = await supabase
        .from('whats_new_events')
        .select('payload')
        .eq('enabled', true)
        .single();

      if (error) {
        throw error;
      }

      return data.payload;
    },
  }}
>
  <Root />
</WhatsNewProvider>
```

For SQLite, return the stored JSON object or `{ releases }` from the loader. The package intentionally does not import Supabase or SQLite clients.

## A/B Testing And Experiment Providers

`expo-whats-new` is experiment-ready, but it is not an A/B testing platform. Keep bucket assignment, analytics SDKs, conversion reporting, and remote-config providers in the host app. Pass the resolved experiment variant into `audience`, return the matching release payload through a static, remote, or custom source, and include the variant in `cacheKey` when one backend URL can return different payloads.

This keeps the package deterministic while letting apps use PostHog, GrowthBook, LaunchDarkly, Firebase Remote Config, Supabase, or an in-house provider without adding those dependencies to the package core.

```tsx
const variant = experimentProvider.getVariant('new-onboarding-copy');

<WhatsNewProvider
  audience={variant}
  source={{
    type: 'custom',
    key: 'experiments:new-onboarding-copy',
    cache: true,
    cacheKey: `new-onboarding-copy:${user.id}:${variant}`,
    loader: async () => experimentProvider.loadWhatsNewPayload('new-onboarding-copy'),
  }}
  analytics={{
    onShow: (release) => analytics.track('whats_new_shown', { releaseId: release.id, variant }),
    onAccept: (release) => analytics.track('whats_new_accepted', { releaseId: release.id, variant }),
    onActionPress: (feature, release) =>
      analytics.track('whats_new_action_pressed', {
        action: feature.action?.label,
        releaseId: release.id,
        variant,
      }),
  }}
>
  <Root />
</WhatsNewProvider>
```

Variant releases should use stable `id` values even when they share the same app `version`. Acknowledgement identity is `release.id ?? release.version`, so one variant can be marked seen without accidentally hiding another same-version variant.

```json
{
  "releases": [
    {
      "id": "new-onboarding-a",
      "version": "2.0.0",
      "audience": "variant-a",
      "title": "Discover the new workspace",
      "features": [{ "title": "Short copy" }]
    },
    {
      "id": "new-onboarding-b",
      "version": "2.0.0",
      "audience": "variant-b",
      "title": "Set up your new workspace",
      "features": [{ "title": "Guided copy" }]
    }
  ]
}
```

Avoid experiments for required policy, consent, legal, security, or App Store review-critical screens. Those flows should stay explicit and stable.

## Interactive Guides And Media

Use `presentation: 'guide'` for step-based onboarding, Telegram-style walkthroughs, and rich feature education. The core package only owns the structure and acknowledgement flow. Animation renderers such as Lottie, Rive, video, or custom native views stay in the host app through `renderMedia`.

```ts
const releases = [
  {
    id: 'critical-alerts-guide',
    version: '2.1.0',
    presentation: 'guide',
    title: 'Critical Alerts',
    features: [{ title: 'Critical Alerts' }],
    steps: [
      {
        title: 'Sound the alarm',
        description: 'Mark important reminders so they play an alarm.',
        media: {
          type: 'lottie',
          assetId: 'critical-alerts-step',
          aspectRatio: 1.6,
          autoplay: true,
          loop: true,
          accessibilityLabel: 'Critical alert animation',
        },
      },
    ],
    acknowledgement: {
      mode: 'accepted',
      required: true,
      acceptLabel: 'Continue',
    },
  },
];
```

```tsx
<WhatsNewScreen
  variant="event-sheet"
  renderMedia={({ media }) => {
    if (media.type === 'lottie' && media.assetId === 'critical-alerts-step') {
      return <CriticalAlertsLottie />;
    }

    return null;
  }}
/>
```

Remote JSON should send media descriptors such as `assetId`, not arbitrary React nodes. This keeps the package renderer-agnostic and lets each app decide whether to use Lottie, Rive, static posters, video, or reduced-motion fallbacks.

## Expo Router Native Modal Routes

The package does not depend on Expo Router. Keep navigation in your app and use `onAutoShow` to route an unseen release into a native-stack modal or sheet.

```tsx
import { Stack } from 'expo-router';
import { WhatsNewProvider } from 'expo-whats-new';
import { openWhatsNewSheet } from '../lib/whats-new-route';

export const unstable_settings = {
  anchor: 'index',
};

export default function Layout() {
  return (
    <WhatsNewProvider
      releases={releases}
      autoShow
      onAutoShow={openWhatsNewSheet}
    >
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="whats-new"
          options={{
            presentation: 'modal',
            title: "What's New",
          }}
        />
      </Stack>
    </WhatsNewProvider>
  );
}
```

Use an anchor for modal routes that can be opened from a deep link. Without an anchor, the modal can replace the background route and lose navigation context.

```tsx
// app/whats-new.tsx
import { useEffect } from 'react';
import { WhatsNewScreen } from 'expo-whats-new';
import { router } from 'expo-router';
import { markWhatsNewSheetDismissed, markWhatsNewSheetPresented } from '../lib/whats-new-route';

export default function WhatsNewRoute() {
  useEffect(() => {
    markWhatsNewSheetPresented();

    return markWhatsNewSheetDismissed;
  }, []);

  return <WhatsNewScreen onDone={() => router.back()} />;
}
```

Guard manual opens in the host app so rapid taps or repeated automatic triggers do not stack duplicate sheets:

```ts
// lib/whats-new-route.ts
import { router } from 'expo-router';

let isWhatsNewSheetPresented = false;

export function openWhatsNewSheet() {
  if (isWhatsNewSheetPresented) {
    return false;
  }

  isWhatsNewSheetPresented = true;

  try {
    router.push('/whats-new');
    return true;
  } catch (error) {
    isWhatsNewSheetPresented = false;
    throw error;
  }
}

export function markWhatsNewSheetPresented() {
  isWhatsNewSheetPresented = true;
}

export function markWhatsNewSheetDismissed() {
  isWhatsNewSheetPresented = false;
}
```

If `onAutoShow` is not provided, `autoShow` opens the package's own `WhatsNewModal`.

For native toolbar buttons, put the action in the route header and hide the in-content button:

```tsx
// app/whats-new.tsx
import { Stack, router } from 'expo-router';
import { WhatsNewDoneButton, WhatsNewScreen } from 'expo-whats-new';

export default function WhatsNewRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: "What's New",
          headerRight: () => <WhatsNewDoneButton onDone={() => router.back()} />,
        }}
      />
      <WhatsNewScreen showDoneButton={false} />
    </>
  );
}
```

For sheet-style presentation, configure the route in your app's stack:

```tsx
<Stack.Screen
  name="whats-new"
  options={{
    presentation: 'formSheet',
    title: "What's New",
  }}
/>
```

For an Apple-style event sheet with a fixed bottom Continue button, hide the native header and render the content with the `event-sheet` variant. Use `isRequiredRelease` when your route needs to keep required `policy`, `consent`, or acknowledgement events non-dismissible while allowing optional release notes to use native swipe dismissal:

```tsx
<Stack.Screen
  name="whats-new"
  options={{
    contentStyle: { backgroundColor: 'transparent' },
    headerShown: false,
    presentation: 'formSheet',
    sheetAllowedDetents: [0.92],
    title: '',
  }}
/>
```

```tsx
// app/whats-new.tsx
import { Stack, router } from 'expo-router';
import { WhatsNewScreen, isRequiredRelease, useWhatsNew } from 'expo-whats-new';

export default function WhatsNewRoute() {
  const { currentRelease } = useWhatsNew();
  const canGestureDismiss = currentRelease ? !isRequiredRelease(currentRelease) : true;

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: canGestureDismiss,
          sheetGrabberVisible: canGestureDismiss,
        }}
      />
      <WhatsNewScreen doneLabel="Continue" onDone={() => router.back()} variant="event-sheet" />
    </>
  );
}
```

When optional sheets allow native gesture dismissal, decide whether dismissal means "seen" in your product. The example app treats optional gesture dismissal as seen while keeping required releases non-dismissible; CTA completion still uses `WhatsNewScreen`'s acknowledgement flow.

The `event-sheet` surface keeps its title, subtitle, and release content inside one vertical scroll flow, with only the bottom CTA area fixed. Do not wrap it in another vertical `ScrollView`; let the route own native sheet presentation while the package owns the sheet's internal scroll layout.

`WhatsNewScreen` does not own app safe-area policy. In a native-stack route, use the stack header, `contentInsetAdjustmentBehavior`, or an app-level `react-native-safe-area-context` wrapper where your app needs explicit insets.

The package modal can use the same surface without Expo Router:

```tsx
<WhatsNewProvider releases={releases} autoShow>
  <Root />
  <WhatsNewModal hardwareAccelerated statusBarTranslucent variant="event-sheet" />
</WhatsNewProvider>
```

Required `policy`, `consent`, or `acknowledgement.required` releases cannot be dismissed from the package modal by tapping the backdrop; they must be accepted through the primary action.
The fallback modal also keeps `allowSwipeDismissal` disabled for required releases, even if the host enables swipe dismissal for optional releases.

## Feature Actions

Feature actions can open URLs automatically:

```ts
const releases = [
  {
    version: '1.2.0',
    features: [
      {
        title: 'New docs',
        action: {
          label: 'Open docs',
          url: 'https://docs.expo.dev',
        },
      },
    ],
  },
];
```

URL actions are scheme-guarded before they reach React Native `Linking`. The default allowed schemes are `https`, `http`, `mailto`, and `tel`. For app-owned deep links, pass the scheme explicitly:

```tsx
<WhatsNewProvider releases={releases} allowedUrlSchemes={['https', 'myapp']}>
  <Root />
</WhatsNewProvider>
```

For app navigation, provide `onActionPress` and keep routing in your app:

```tsx
<WhatsNewProvider
  releases={releases}
  onActionPress={(feature) => {
    if (feature.action?.screen) {
      router.push(feature.action.screen);
    }
  }}
>
  <Root />
</WhatsNewProvider>
```

## Policy And Consent Events

Use `kind: 'policy'` or `kind: 'consent'` for Apple-style continue screens, policy acknowledgements, and required user instructions. These releases are shown until the user accepts them.

```ts
const releases = [
  {
    kind: 'policy',
    version: '2026.05.terms',
    title: 'Updated Terms',
    subtitle: 'Please review the latest terms before continuing.',
    acknowledgement: {
      mode: 'accepted',
      required: true,
      acceptLabel: 'Continue',
    },
    features: [
      {
        title: 'Terms and privacy updates',
        description: 'We clarified account and data handling language.',
      },
    ],
  },
];
```

```tsx
<WhatsNewProvider
  releases={releases}
  autoShow
  onAccept={(release) => {
    analytics.track('policy_accepted', { version: release.version });
  }}
>
  <Root />
  <WhatsNewModal />
</WhatsNewProvider>
```

## Headless API

```ts
import { createMemoryStorage, shouldShowWhatsNew } from 'expo-whats-new/headless';

const result = await shouldShowWhatsNew({
  releases,
  storage: createMemoryStorage(),
  displayPolicy: 'once-per-release',
});
```

## Native Capability

```ts
import { ExpoWhatsNew } from 'expo-whats-new';

const appInfo = await ExpoWhatsNew.getAppInfo();
```

The native module exposes:

- `getAppInfo()`
- `getItemAsync(key)`
- `setItemAsync(key, value)`
- `removeItemAsync(key)`

`getAppInfo()` returns:

```ts
type AppInfo = {
  platform: 'ios' | 'android' | 'web';
  version: string | null;
  buildNumber: string | null;
};
```

In Expo Go, custom native modules are not available unless they are included in the Expo Go binary. This package keeps the product logic in TypeScript and uses an optional native module, so the release-note layer can still run with fallback app info and memory storage.

## Storage

By default:

- Web uses `localStorage` with a memory fallback. If `localStorage` is unavailable, blocked, sandboxed, over quota, or throws during access, the adapter falls back to memory storage instead of breaking the release flow.
- The package fallback `WhatsNewModal` also works on Expo web through React Native Web. Required releases keep backdrop and swipe dismissal disabled; optional releases can be dismissed by the fallback backdrop when the host uses the package modal instead of an app-owned route.
- Native development builds and bare apps use platform storage:
  - iOS: `UserDefaults`
  - Android: `SharedPreferences`
- Expo Go falls back to in-memory storage when the custom native module is unavailable.

To override persistence, pass your own adapter:

```tsx
<WhatsNewProvider releases={releases} storage={myStorageAdapter} autoShow>
  <Root />
  <WhatsNewModal />
</WhatsNewProvider>
```

Adapter contract:

```ts
type WhatsNewStorageAdapter = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};
```
