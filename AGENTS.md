# expo-whats-new Agent Guide

Use this file as the first repo-local context when changing this package.

## Architecture Boundaries

- Core owns release validation, release targeting, acknowledgement state, source resolution, cache envelopes, locale fallback, and composable presentation contracts.
- Host apps own navigation, native sheet route placement, locale discovery, icons, media renderers, analytics, auth, audiences, and Supabase/SQLite clients.
- Do not add Expo Router, Lottie, Rive, Supabase, SQLite, localization, analytics, or icon packages as core dependencies.
- Remote JSON must stay serializable. Use descriptors such as `media.assetId`, `media.kind`, and `symbol`; never store React nodes, binary media, callbacks, or platform component instances in JSON.
- Additive schema changes must update TypeScript types, the Zod remote schema, README, ARCHITECTURE, and focused tests.

## Source And Data Rules

- Validate remote/custom payloads before they reach UI.
- Keep cache entries as metadata envelopes and preserve stale fallback behavior.
- Remove corrupt cache entries instead of retrying bad data forever.
- Keep `custom` sources compatible with app-managed Supabase, SQLite, filesystem, or local database loaders.
- Acknowledgement identity is `release.id ?? release.version`; keep backward compatibility with older version-only acknowledgement entries.

## UI And Example Rules

- Core can render list, guide, and event-sheet content, but host apps decide whether that appears in a native sheet, modal, screen, tab, or route.
- Example app should show native Expo Router tab usage and natural detail-route auto presentation.
- Do not auto-open a scenario sheet before the user enters the scenario route.
- Manual re-open is allowed after acknowledgement.
- Avoid leaking internal route labels such as `(tabs)` into native back UI.
- Do not pass array styles to NativeTabs Slot children; flatten styles before passing them to routed children.
- Keep CTA language consistent within each showcased scenario.

## Verification

Run the smallest relevant set, and use the full set for behavior/schema/example changes:

```sh
npm test -- --watch=false
npm run build
npm run lint
(cd example && npx tsc --noEmit)
```

If Metro is running for the example app, verify iOS bundling when route/example code changed:

```sh
curl -f 'http://localhost:8082/index.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes' -o /tmp/expo-whats-new-ios.bundle
```
