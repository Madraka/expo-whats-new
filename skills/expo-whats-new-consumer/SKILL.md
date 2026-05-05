---
name: expo-whats-new-consumer
description: Use when adding or integrating expo-whats-new into an Expo or React Native app, including release notes, required policy or consent sheets, remote JSON, Supabase or SQLite custom sources, locale fallback, native Expo Router sheets, guide presentations, and renderMedia for Lottie, Rive, video, images, or custom media.
---

# expo-whats-new Consumer

Use this skill when integrating the package into an app that consumes `expo-whats-new`.

## Install

Prefer Expo CLI in Expo apps:

```sh
npx expo install expo-whats-new
```

Use direct npm install in non-Expo package manager flows or bare React Native projects:

```sh
npm install expo-whats-new
```

## Fixed Boundaries

- Core owns validation, targeting, acknowledgement, cache, locale fallback, and composable UI contracts.
- Host apps own native navigation, sheet routes, icons, media playback, locale discovery, analytics, auth, audience selection, and database clients.
- Keep Supabase, SQLite, Lottie, Rive, Expo Router, localization, analytics, and icon libraries in the host app.

## Integration Workflow

1. Place `WhatsNewProvider` near the app root so release state and acknowledgement checks are stable across routes.
2. Keep native presentation in the host app. For Expo Router, route `onAutoShow` to an app-owned screen or native sheet such as `/whats-new`.
3. Use app-owned locale detection, usually `expo-localization`, and pass `locale` plus `fallbackLocale` into the provider.
4. Use remote JSON for serializable release data only. Keep React nodes, Lottie JSON imports, Rive instances, video components, callbacks, and navigation functions outside JSON.
5. For Supabase, SQLite, filesystem, or another database, use `source: { type: 'custom', key, loader }`. The package should receive normalized release data, not own your database client.
6. Use `cacheKey`, `timeoutMs`, and the package cache policy intentionally when loading remote or custom sources.
7. Use `renderMedia` for app-owned media rendering. Map `media.type` and `media.assetId` to Lottie, Rive, video, image, or custom components in the app.
8. For icons, prefer app-owned `symbol` descriptors and map them to React nodes before passing local/static releases into core. Do not expect core to bundle icon libraries.
9. Let automatic presentation happen only from the route where it is meaningful. Manual re-open can always route to the whats-new screen after acknowledgement.

## Recommended Patterns

- Required policy or consent: use required acknowledgement metadata and present it in an app-owned native sheet route.
- Apple-style event sheet: set `variant: 'event-sheet'` in release content and keep CTA labels localized in release localizations.
- Interactive guide: use `presentation: 'guide'`, `steps`, and optional media descriptors; implement actual animation playback with `renderMedia`.
- Remote content: validate and normalize at the source boundary; store only stable ids, versions, localized copy, targeting metadata, and media descriptors.

## Avoid

- Adding Supabase, SQLite, Lottie, Rive, Expo Router, or icon dependencies to the package for an app-specific integration.
- Putting `ReactNode`, functions, imported media modules, or binary payloads into remote JSON.
- Showing a sheet before the user reaches the screen that should trigger it.
- Mixing CTA languages inside one scenario.
