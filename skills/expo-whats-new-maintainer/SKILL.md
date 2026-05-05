---
name: expo-whats-new-maintainer
description: Use when modifying the expo-whats-new package itself, including core schema, source resolution, acknowledgement storage, native module boundaries, event-sheet UI, guide or media contracts, example app behavior, tests, docs, and production checklist.
---

# expo-whats-new Maintainer

Use this skill when changing the package internals or example app.

## Core Boundaries

- Core may depend on small validation/runtime utilities such as `zod` when needed.
- Core must not depend on Expo Router, Lottie, Rive, Supabase, SQLite, Expo Localization, analytics SDKs, or icon libraries.
- Host apps own native navigation, native sheets, media playback, icons, analytics, locale detection, auth, audience rules, and database clients.
- Remote data must remain serializable. Schema fields should be descriptors, not component instances.

## Change Checklist

For schema or source changes:

- Update TypeScript public types.
- Update the Zod remote schema.
- Add or adjust focused tests.
- Update README and ARCHITECTURE when public behavior changes.
- Preserve cache envelopes, stale fallback, corrupt cache cleanup, and `custom` source support.

For acknowledgement changes:

- Keep identity as `release.id ?? release.version`.
- Preserve compatibility with old version-only acknowledgement entries.
- Keep required acknowledgement behavior deterministic for policy, consent, and required releases.

For UI changes:

- Core can render content variants such as card, guide, and event-sheet.
- Host apps decide native sheet, modal, screen, tab, and route presentation.
- Keep `renderMedia` and icon customization as app-provided extension points.
- Do not hardcode app-specific Turkish or English copy in core UI.

For example app changes:

- Native tabs should remain polished and route labels must not leak `(tabs)` into back UI.
- Automatic sheets should open only after entering the matching detail route.
- Manual re-open after acknowledgement should still work.
- Flatten styles passed to NativeTabs Slot children.
- Keep showcase CTA language internally consistent.

## Verification

Use the full set for behavior, schema, source, UI, docs, or example changes:

```sh
npm test -- --watch=false
npm run build
npm run lint
(cd example && npx tsc --noEmit)
```

If Metro is already running and example routing changed, verify iOS bundling:

```sh
curl -f 'http://localhost:8082/index.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes' -o /tmp/expo-whats-new-ios.bundle
```
