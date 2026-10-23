#!/usr/bin/env bash
# Submit a verified iOS store-distribution build to INTERNAL TestFlight only.
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/prepare-release.mjs
node --test tests/*.static.mjs
npm run typecheck
npm test
npm run build:api
npm run build:ios:js
cd apps/mobile
npx eas-cli whoami
# Expo's --auto-submit sends to TestFlight; it does not release to the public App Store.
npx eas-cli build --platform ios --profile production --auto-submit
