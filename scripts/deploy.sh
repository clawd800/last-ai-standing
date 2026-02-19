#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# ─── Version Bump ─────────────────────────────────────────────────────

cd cli
NEW_VERSION=$(npm version patch --no-git-tag-version | tr -d 'v')
echo "📦 CLI version: $NEW_VERSION"
cd "$ROOT"

# Sync version to SKILL.md
sed -i '' "s/^version: .*/version: $NEW_VERSION/" agent-skill/SKILL.md
echo "📝 SKILL.md version: $NEW_VERSION"

# ─── Build & Test ─────────────────────────────────────────────────────

echo "🔨 Building CLI..."
cd cli && npm run build
echo "🧪 Running tests..."
npx vitest run --reporter=dot
cd "$ROOT"

# ─── Publish CLI to npm ───────────────────────────────────────────────

echo "🚀 Publishing CLI to npm..."
cd cli && npm publish
cd "$ROOT"

# ─── Publish skill to ClawHub ─────────────────────────────────────────

echo "🚀 Publishing skill to ClawHub..."
npx clawhub publish agent-skill --slug last-ai-standing --version "$NEW_VERSION"

# ─── Deploy web to gh-pages ───────────────────────────────────────────

echo "🌐 Deploying web..."
cd web && bash scripts/deploy.sh
cd "$ROOT"

# ─── Commit & Push ────────────────────────────────────────────────────

git add -A
git commit -m "release: v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push && git push --tags

echo ""
echo "✅ Released v$NEW_VERSION"
echo "   npm: https://www.npmjs.com/package/last-ai-standing-cli"
echo "   ClawHub: https://clawhub.ai/skills/last-ai-standing"
echo "   Web: https://lastaistanding.com"
