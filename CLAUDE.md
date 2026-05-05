# Claude Project Memory

This repository ships `expo-whats-new`, an Expo/React Native package for typed What's New releases, required acknowledgement flows, remote/custom release sources, localized content, guide presentations, and app-owned native presentation.

Read these files first:

- @AGENTS.md
- @README.md
- @docs/app-integration.md
- @ARCHITECTURE.md
- @skills/README.md
- @package.json

## Claude-Specific Guidance

- Treat `AGENTS.md` as the source of truth for repo architecture boundaries and verification commands.
- Keep package runtime code independent from Claude, Codex, MCP, and agent-specific APIs.
- Keep agent skills under `skills/`; do not install or update global machine-local memories unless the user explicitly asks.
- Use `npm run skills:install` only when the user wants to activate the bundled Codex skills locally.
- Use GitHub Actions for normal version bumps, tags, and npm publishing. Do not rely on manual `npm publish` as the default release path.
- Keep automated releases on the `0.1.x` line unless the user explicitly changes the release policy.
- Treat npm as the primary package registry and GitHub Releases as the public release-notes surface; do not introduce GitHub Packages by default.
- Run Expo Doctor for example app health when changing Expo, Expo Router, example dependencies, app config, or CI.
- For Claude Code project memory, this `CLAUDE.md` is enough. Verify loaded memories with `/memory` inside Claude Code when needed.
