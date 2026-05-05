#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$ROOT_DIR/skills"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

required_skills=(
  "expo-whats-new-consumer"
  "expo-whats-new-maintainer"
)

fail() {
  echo "skills validation failed: $*" >&2
  exit 1
}

for skill in "${required_skills[@]}"; do
  skill_dir="$SKILLS_DIR/$skill"
  skill_file="$skill_dir/SKILL.md"
  metadata_file="$skill_dir/agents/openai.yaml"

  [[ -d "$skill_dir" ]] || fail "missing skill directory: $skill"
  [[ -f "$skill_file" ]] || fail "missing SKILL.md: $skill"
  [[ -f "$metadata_file" ]] || fail "missing agents/openai.yaml: $skill"

  grep -q "^---$" "$skill_file" || fail "missing frontmatter fence: $skill"
  grep -q "^name: $skill$" "$skill_file" || fail "frontmatter name mismatch: $skill"
  grep -q "^description: .\\{80,\\}" "$skill_file" || fail "description should be explicit and discoverable: $skill"
  grep -q "Core" "$skill_file" || fail "missing core boundary wording: $skill"
  grep -q "Host apps" "$skill_file" || fail "missing host app boundary wording: $skill"
  grep -q "Supabase" "$skill_file" || fail "missing database boundary wording: $skill"
  grep -q "Lottie" "$skill_file" || fail "missing media boundary wording: $skill"
  grep -Fq "default_prompt:" "$metadata_file" || fail "missing default_prompt: $skill"
  grep -Fq "\$$skill" "$metadata_file" || fail "default_prompt must mention \$$skill: $skill"
done

grep -q "docs/app-integration.md" "$ROOT_DIR/README.md" || fail "README must link app integration guide"
if grep -Eq "CLAUDE.md|npm run skills:install|NPM_TOKEN|GitHub Actions" "$ROOT_DIR/README.md"; then
  fail "README should stay app-facing and must not include maintainer, agent, or release operations"
fi
grep -q "npm run skills:install" "$SKILLS_DIR/README.md" || fail "skills README must mention install command"
grep -q "CLAUDE.md" "$SKILLS_DIR/README.md" || fail "skills README must mention Claude project memory"
grep -q "@AGENTS.md" "$ROOT_DIR/CLAUDE.md" || fail "CLAUDE.md must import AGENTS.md"

bash -n "$ROOT_DIR/scripts/install-codex-skills.sh"
"$ROOT_DIR/scripts/install-codex-skills.sh" --target "$TMP_DIR" >/dev/null

for skill in "${required_skills[@]}"; do
  [[ -f "$TMP_DIR/$skill/SKILL.md" ]] || fail "install did not copy $skill"
  [[ -f "$TMP_DIR/$skill/agents/openai.yaml" ]] || fail "install did not copy metadata for $skill"
done

echo "skills validation ok"
