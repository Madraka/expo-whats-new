# Changelog

## Unreleased

No unreleased changes.

## 0.1.4 - 2026-05-12

### Fixed

- Fixed an iOS native build failure in `ExpoWhatsNewModule.getAppInfo()` when app version metadata is unavailable. The module now returns a typed app info dictionary that can safely carry `null` values for `version` and `buildNumber` without Swift inferring an incompatible string-only dictionary.

### Notes

- Android native app info behavior is unchanged in this release.

## 0.1.3 - 2026-05-08

### Changed

- Hardened Expo Router native sheet examples with route anchors, duplicate-open guards, and failure-safe route presentation.
- Exported `isRequiredRelease` so host apps can align native sheet gesture dismissal with required `policy`, `consent`, and acknowledgement flows.
- Improved `event-sheet` layout so header and release content share one vertical scroll flow while the CTA footer remains fixed.
- Allowed optional native sheet gesture dismissal in the example app while keeping required releases non-dismissible and marking optional gesture dismissals as seen.
- Expanded React, web, and example route tests for event-sheet layout, required fallback modal dismissal, decline completion, guarded sheet routing, web module storage, web release targeting, and web fallback modal dismissal.
- Added cross-platform fallbacks for example SF Symbol media/icons so Android and web examples do not depend on Apple-only symbol rendering.

## 0.1.2

### Changed

- Hardened release targeting so audience-specific releases do not match unless the host app provides a matching audience.
- Added URL scheme guarding for feature actions, with `allowedUrlSchemes` for app-owned deep links.
- Improved acknowledgement migration so older single-release entries are preserved when writing the newer map format.
- Made web storage resilient to blocked, sandboxed, quota-limited, or throwing `localStorage` environments by falling back to memory storage.
- Surfaced async `onAutoShow` and action handling failures through provider error state instead of leaving unhandled promise failures.
- Added React Provider/hook behavior tests and domain-oriented `__tests__` folders for logic, source, storage, and react tests.
- Updated example dependency health, test scripts, docs, and package audit overrides.

### Notes

- This is the recommended stable `0.1.x` baseline for early adopters.
- Audience targeting is now fail-closed by design. Apps using audience-specific releases must pass `audience` to `WhatsNewProvider` or headless APIs.

## 0.1.1

### Changed

- Added package release automation, publish checks, and CI-friendly preparation behavior.
- Added npm README badges and package preview image.
- Split app integration, architecture, release, and agent-skill guidance into dedicated docs.
- Added Expo Doctor validation for the example app.

## 0.1.0

Initial public release preparation.

### New Features

- Typed Expo/React Native What's New release model.
- Provider, hook, modal, screen, inline, and headless APIs.
- Remote and custom release sources with validation, cache envelopes, stale fallback, and locale fallback.
- Required acknowledgement flows for policy, consent, and required releases.
- Apple-style event sheet variant and guide presentation support.
- App-owned icon and media extension points for Lottie, Rive, video, images, and custom renderers.
- Example Expo app with native tabs and scenario-driven presentation.
- Optional Codex skills and Claude project memory for agent-assisted integration and maintenance.

### Notes

- Core intentionally does not depend on Expo Router, Lottie, Rive, Supabase, SQLite, localization, analytics, or icon libraries.
- Host apps own native sheet routing, locale discovery, media playback, icons, analytics, auth, audience logic, and database clients.
