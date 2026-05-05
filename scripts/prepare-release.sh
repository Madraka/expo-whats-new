#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: scripts/prepare-release.sh <patch|0.1.x>" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_ARG="$1"

cd "$ROOT_DIR"

if [[ "$VERSION_ARG" == "patch" ]]; then
  :
elif [[ "$VERSION_ARG" =~ ^0\.1\.[0-9]+$ ]]; then
  :
else
  echo "Release versions are locked to 0.1.x. Use 'patch' for the next patch or an exact 0.1.x version." >&2
  exit 1
fi

npm version "$VERSION_ARG" --no-git-tag-version

VERSION="$(node -p "require('./package.json').version")"

if [[ ! "$VERSION" =~ ^0\.1\.[0-9]+$ ]]; then
  echo "Prepared version must stay in the 0.1.x line unless release policy is changed manually: $VERSION" >&2
  exit 1
fi

node <<'NODE'
const fs = require('fs');
const version = require('./package.json').version;
const buildGradlePath = 'android/build.gradle';
let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

buildGradle = buildGradle
  .replace(/^version = '.*'$/m, `version = '${version}'`)
  .replace(/versionName ".*"/, `versionName "${version}"`);

fs.writeFileSync(buildGradlePath, buildGradle);
NODE

echo "Prepared expo-whats-new@$VERSION"
