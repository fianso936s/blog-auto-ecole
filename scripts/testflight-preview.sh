#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/prepare-release.mjs
npm run typecheck
npm test
npm run build:api
npm run build:ios:js
cd apps/mobile
npx eas-cli whoami
# Manual internal preview before submitting to TestFlight; no automatic App Store release.
npx eas-cli build --platform ios --profile preview
