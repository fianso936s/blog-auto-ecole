#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo '== Le Repère Permis | audit Meta iOS 1.5.2 =='
node tests/private-videos.static.mjs
node tests/private-live.static.mjs
node tests/meta-build-readiness.static.mjs
ruby -c apps/mobile/ios/Podfile
ruby -c apps/mobile/ios/scripts/link-meta-spm.rb
ruby -c apps/mobile/modules/repere-meta/ios/RepereMeta.podspec
if command -v swiftc >/dev/null; then
 swiftc -frontend -parse apps/mobile/modules/repere-meta/ios/RepereMetaModule.swift
 swiftc -frontend -parse apps/mobile/modules/repere-meta/ios/RepereHEVCContinuousWriter.swift
 echo 'SWIFT SOURCE PARSE: OK (ceci ne valide PAS les imports iOS)'
fi
if ! command -v xcodebuild >/dev/null || ! command -v pod >/dev/null; then
 echo 'BLOCKED: Xcode / CocoaPods requis sur macOS pour vérifier le build Swift et TestFlight.'
 exit 2
fi
if ! command -v npm >/dev/null; then echo 'BLOCKED: Node/npm requis';exit 2;fi
npm ci
npm run check
(cd apps/mobile/ios && pod install)
echo 'STATIC + NPM + PODS: OK. Vérifier ensuite xcodebuild et lunettes physiques.'
