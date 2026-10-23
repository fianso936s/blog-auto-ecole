#!/bin/sh
set -eu

# Xcode stages the same Meta binary provenance twice for the app + local pod.
# Keep one copy in BuildProductsPath for the archive, and retain the identical
# duplicate in intermediates. Framework binaries and code signatures stay intact.
# Related upstream archive collision: facebook/meta-wearables-dat-ios#253.
for product in MWDATCore MWDATCamera; do
  binary="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}/${product}.framework/${product}"
  if [ ! -s "$binary" ]; then
    echo "error: Meta framework missing from app bundle: $product" >&2
    exit 1
  fi
  duplicate="${CONFIGURATION_BUILD_DIR}/${product}.xcframework-ios.signature"
  retained="${CONFIGURATION_BUILD_DIR}/RepereMeta/${product}.xcframework-ios.signature"
  if [ -e "$duplicate" ] && [ -e "$retained" ]; then
    if [ -d "$duplicate" ] && [ -d "$retained" ]; then
      diff -qr "$duplicate" "$retained" >/dev/null
    else
      cmp -s "$duplicate" "$retained"
    fi
    # A mismatch fails the build rather than discarding distinct provenance.
    mkdir -p "${DERIVED_FILE_DIR}"
    saved="$(mktemp -d "${DERIVED_FILE_DIR}/repere-meta-provenance.XXXXXX")"
    mv "$duplicate" "$saved/"
    echo "[RepereMeta] Retained one archive provenance entry for $product"
  fi
done
