#!/usr/bin/env bash
set -euo pipefail

if command -v expo-module >/dev/null 2>&1; then
  expo-module prepare
else
  echo "Skipping expo-module prepare: expo-module binary is not available in this install context."
fi
