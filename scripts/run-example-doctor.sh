#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_NODE_MODULES="$ROOT_DIR/node_modules"
HIDDEN_NODE_MODULES="$ROOT_DIR/.node_modules.expo-doctor"
MOVED_ROOT_NODE_MODULES=0

restore_root_node_modules() {
  if [[ "$MOVED_ROOT_NODE_MODULES" -eq 1 ]]; then
    rm -rf "$ROOT_NODE_MODULES"
    mv "$HIDDEN_NODE_MODULES" "$ROOT_NODE_MODULES"
  fi
}

trap restore_root_node_modules EXIT

if [[ -d "$ROOT_NODE_MODULES" ]]; then
  if [[ -e "$HIDDEN_NODE_MODULES" ]]; then
    echo "Refusing to run: $HIDDEN_NODE_MODULES already exists" >&2
    exit 1
  fi

  mv "$ROOT_NODE_MODULES" "$HIDDEN_NODE_MODULES"
  MOVED_ROOT_NODE_MODULES=1
fi

cd "$ROOT_DIR/example"
npx expo-doctor
