# expo-whats-new Example

This Expo Router app demonstrates the package in a real host-app boundary: native tab navigation, native sheet presentation, release acknowledgements, remote/custom sources, localized payloads, and host-rendered media.

The example imports the local package source through Metro and TypeScript path aliases, so changes in `../src` are reflected while developing the package.

## Prerequisites

- Node.js and npm
- Expo Go on a physical device, or Xcode/Android Studio for simulator builds

Install dependencies from the repository root and the example app when needed:

```sh
npm install
cd example
npm install
```

## Run With Expo Go

Expo Go is useful for quick JS/UI checks because `expo-whats-new` includes a JavaScript fallback when the native module is not available.

```sh
cd example
npm run start
```

Then scan the QR code with Expo Go, or press `i`/`a` in the Expo CLI to open a simulator if available.

In Expo Go, native app-info and native storage are not provided by this local module. The example still runs through the fallback path, but acknowledgement state is memory-backed and can reset when the JS runtime reloads.

## Run As A Development Build

Use a development build when validating the native Expo module implementation, durable native storage, app version/build information, or platform-specific native sheet behavior.

```sh
cd example
npm run ios
```

or:

```sh
cd example
npm run android
```

These commands compile the example with the local `expo-whats-new` native module autolinked from the repository root.

## Web

```sh
cd example
npm run web
```

The web target uses the package web module and browser storage fallback.
Example media and feature icons use SF Symbols on Apple platforms and text fallbacks on Android and web.

## What To Test

- `Gallery`: current release resolution, reset/refresh, and manual presentation.
- `Integrations`: remote source, cache-backed source behavior, and all scenario entries.
- `Release Notes`: once-per-release sheet flow.
- `Policy Acknowledgement`: required acknowledgement with a continue action.
- `Consent Prompt`: accept/decline callback behavior.
- `Feature Actions`: URL and host-navigation action descriptors.
- `Interactive Guide`: step-based guide with host-rendered media.
- `Announcement`: lightweight once-seen event.
- `Remote Source`: simulated CDN response with localization and cache.
- `Manual Mode`: route-driven presentation without auto-opening.

## Verification

Run the focused typecheck after changing example routes, navigation, or local package contracts:

```sh
cd example
npx tsc --noEmit
```

From the repository root, use the package-level checks when behavior or schema changes are involved:

```sh
npm test -- --watch=false
npm run test:core
npm run test:react
npm run build
npm run lint
npm run doctor:example
```

If Metro is already running on port `8082`, verify iOS bundling after route/example changes:

```sh
curl -f 'http://localhost:8082/index.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes' -o /tmp/expo-whats-new-ios.bundle
```

## Development Notes

- Keep navigation, native sheet route placement, icons, media renderers, locale discovery, analytics, and app data clients in the example app.
- Keep the package core free of Expo Router, icon packs, animation renderers, Supabase, SQLite, localization, and analytics dependencies.
- Remote/custom release payloads must stay serializable; use descriptors such as `media.assetId`, `media.type`, `symbol`, and action descriptors instead of React nodes or callbacks.
- If package source edits are not reflected in the app, restart Metro with a clean cache: `npx expo start -c`.
