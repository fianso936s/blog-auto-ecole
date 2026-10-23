#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:uniformity
npm run build:ios
cd apps/mobile
npx eas-cli build --platform ios --profile production --auto-submit
