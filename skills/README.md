# expo-whats-new Skills

This package includes optional Codex/agent skills for teams that want package-aware assistance.

## Included Skills

- `expo-whats-new-consumer`: for apps integrating `expo-whats-new`.
- `expo-whats-new-maintainer`: for contributors changing this package.

## Install

Install into the default Codex skills directory:

```sh
npm run skills:install
```

Install into a custom skills directory:

```sh
npm run skills:install -- --target "$HOME/.agents/skills"
```

The script copies the folders under `skills/` into the target directory. Source of truth remains in this repository.

## Validate

Check skill structure, metadata, docs, and install behavior:

```sh
npm run skills:validate
```

## Claude Code

Claude Code can use the repo-level `CLAUDE.md` file directly as project memory. No install step is required for Claude.

After opening Claude Code in this repository, use `/memory` to confirm the loaded project memory if needed.

## Manual Install

```sh
mkdir -p "$HOME/.codex/skills"
cp -R skills/expo-whats-new-consumer "$HOME/.codex/skills/"
cp -R skills/expo-whats-new-maintainer "$HOME/.codex/skills/"
```
