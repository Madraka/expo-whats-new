# Changelog

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
