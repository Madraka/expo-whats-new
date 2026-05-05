# expo-whats-new

Universal Expo package for showing typed "What's New" release notes in Expo and React Native apps.

The package is JS-first and Expo Module compatible. It can run with a graceful JavaScript fallback in Expo Go, and it exposes a native capability layer for development builds and bare React Native apps.

## Install

```sh
npm install expo-whats-new
```

## Usage

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
        description: 'Use the provider, hook, modal, inline view, or headless logic.',
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

Remote payloads are validated at the package boundary before they reach the UI. They can be either an array:

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

The core package does not depend on `expo-localization`. In Expo apps, resolve the locale in the host app and pass it in:

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

Locale matching normalizes tags and falls back by language, so `tr-TR` can match a `tr` localization. The provider reads native app version and platform when the Expo module is available; web, Expo Go, SSR-like shells, and custom version systems can pass `appVersion` and `platform` explicitly. Remote cache entries are stored with metadata (`schemaVersion`, `fetchedAt`, `expiresAt`, `releases`) and older array-only cache entries remain readable. The default remote policy is `network-first`: fetch fresh data and fall back to cache on failure. Use `requestPolicy: 'cache-first'` with `cacheTtlMs` to return fresh cached content before hitting the network; expired cache refreshes from the network and still acts as a stale offline fallback. If one URL returns different payloads for different headers or audiences, provide a stable `cacheKey`.

## Expo Router Native Modal Routes

The package does not depend on Expo Router. Keep navigation in your app and use `onAutoShow` to route an unseen release into a native-stack modal or sheet.

```tsx
import { Stack, router } from 'expo-router';
import { WhatsNewProvider } from 'expo-whats-new';

export default function Layout() {
  return (
    <WhatsNewProvider
      releases={releases}
      autoShow
      onAutoShow={() => router.push('/whats-new')}
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

```tsx
// app/whats-new.tsx
import { WhatsNewScreen } from 'expo-whats-new';
import { router } from 'expo-router';

export default function WhatsNewRoute() {
  return <WhatsNewScreen onDone={() => router.back()} />;
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

For an Apple-style required event sheet with a fixed bottom Continue button, hide the native header and render the content with the `event-sheet` variant:

```tsx
<Stack.Screen
  name="whats-new"
  options={{
    contentStyle: { backgroundColor: 'transparent' },
    gestureEnabled: false,
    headerShown: false,
    presentation: 'formSheet',
    sheetAllowedDetents: [0.92],
    sheetGrabberVisible: false,
    title: '',
  }}
/>
```

```tsx
// app/whats-new.tsx
import { router } from 'expo-router';
import { WhatsNewScreen } from 'expo-whats-new';

export default function WhatsNewRoute() {
  return <WhatsNewScreen doneLabel="Continue" onDone={() => router.back()} variant="event-sheet" />;
}
```

The package modal can use the same surface without Expo Router:

```tsx
<WhatsNewProvider releases={releases} autoShow>
  <Root />
  <WhatsNewModal variant="event-sheet" />
</WhatsNewProvider>
```

Required `policy`, `consent`, or `acknowledgement.required` releases cannot be dismissed from the package modal by tapping the backdrop; they must be accepted through the primary action.

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

- Web uses `localStorage` with a memory fallback.
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

## Development

The example app uses this package as a local dependency:

```json
{
  "dependencies": {
    "expo-whats-new": "file:.."
  }
}
```

Metro and TypeScript are configured to point at the local source while developing.

```sh
npm run build
npm run test -- --watch=false
npm run lint
```
