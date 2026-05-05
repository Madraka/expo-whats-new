#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/skills"
TARGET_DIR="${CODEX_HOME:-$HOME/.codex}/skills"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      if [[ $# -lt 2 ]]; then
        echo "Missing value for --target" >&2
        exit 1
      fi
      TARGET_DIR="$2"
      shift 2
      ;;
    --help|-h)
      cat <<'USAGE'
Install expo-whats-new Codex skills.

Usage:
  scripts/install-codex-skills.sh [--target PATH]

Defaults:
  target = $CODEX_HOME/skills, or ~/.codex/skills when CODEX_HOME is unset
USAGE
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Skills source directory not found: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$TARGET_DIR"

for skill in expo-whats-new-consumer expo-whats-new-maintainer; do
  if [[ ! -f "$SOURCE_DIR/$skill/SKILL.md" ]]; then
    echo "Skill is missing SKILL.md: $skill" >&2
    exit 1
  fi

  rm -rf "$TARGET_DIR/$skill"
  cp -R "$SOURCE_DIR/$skill" "$TARGET_DIR/$skill"
  echo "Installed $skill -> $TARGET_DIR/$skill"
done
