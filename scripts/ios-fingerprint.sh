#!/bin/sh
# Generates Stallion's native fingerprint into the built resource bundle.
# Failures write "unknown" and exit 0 so the app build still succeeds.
set +e

START_DIR=$(cd "${PODS_ROOT}/../.." 2>/dev/null && pwd)
APP_ROOT="${START_DIR}"
CURSOR="${START_DIR}"
HOPS=0
while [ -n "${CURSOR}" ] && [ "${CURSOR}" != "/" ] && [ "${HOPS}" -lt 8 ]; do
  if [ -f "${CURSOR}/package.json" ]; then
    APP_ROOT="${CURSOR}"
    break
  fi
  NEXT=$(dirname "${CURSOR}")
  if [ "${NEXT}" = "${CURSOR}" ]; then
    break
  fi
  CURSOR="${NEXT}"
  HOPS=$((HOPS + 1))
done

IOS_DIR=$(cd "${PODS_ROOT}/.." 2>/dev/null && pwd)
SDK_ROOT="${PODS_TARGET_SRCROOT}"
# CocoaPods builds the bundle inside the pod product dir and the app
# copies that directory. PODS_CONFIGURATION_BUILD_DIR is the parent
# (Debug-iphonesimulator), so writing there never reaches the app.
OUT_DIR="${CONFIGURATION_BUILD_DIR}/StallionFingerprint.bundle"
OUT_FILE="${OUT_DIR}/stallion_fingerprint.txt"

write_value() {
  if [ -z "${CONFIGURATION_BUILD_DIR}" ]; then
    echo "warning: Stallion native fingerprint has no CONFIGURATION_BUILD_DIR. Embedding unknown." >&2
    return 0
  fi
  mkdir -p "${OUT_DIR}" 2>/dev/null
  if [ ! -d "${OUT_DIR}" ]; then
    echo "warning: Stallion could not create ${OUT_DIR}. Native fingerprint will be unknown." >&2
    return 0
  fi
  if ! printf '%s\n' "$1" > "${OUT_FILE}" 2>/dev/null; then
    echo "warning: Stallion could not write ${OUT_FILE}. Native fingerprint will be unknown." >&2
  fi
}

if [ -f "${IOS_DIR}/.xcode.env" ]; then
  . "${IOS_DIR}/.xcode.env"
fi
if [ -f "${IOS_DIR}/.xcode.env.local" ]; then
  . "${IOS_DIR}/.xcode.env.local"
fi
set +e

if [ "${STALLION_FINGERPRINT_SKIP}" = "1" ]; then
  echo "Stallion: STALLION_FINGERPRINT_SKIP=1, embedding skipped"
  write_value "skipped"
  exit 0
fi

if [ -z "${NODE_BINARY}" ]; then
  NODE_BINARY=$(command -v node 2>/dev/null)
fi
if [ -z "${NODE_BINARY}" ]; then
  NODE_BINARY="node"
fi

FP_SCRIPT="${SDK_ROOT}/scripts/fingerprint.js"
if [ ! -f "${FP_SCRIPT}" ]; then
  echo "warning: Stallion native fingerprint script not found at ${FP_SCRIPT}. Embedding unknown." >&2
  write_value "unknown"
  exit 0
fi

ERR_FILE="${TMPDIR:-/tmp}/stallion-native-fingerprint.$$.err"
HASH=$("${NODE_BINARY}" "${FP_SCRIPT}" "${APP_ROOT}" 2>"${ERR_FILE}")
STATUS=$?

if [ -s "${ERR_FILE}" ]; then
  cat "${ERR_FILE}" >&2
fi
rm -f "${ERR_FILE}" 2>/dev/null

if [ "${STATUS}" -ne 0 ] || [ -z "${HASH}" ]; then
  echo "warning: Stallion native fingerprint failed. Embedding unknown." >&2
  write_value "unknown"
  exit 0
fi

HASH=$(printf '%s\n' "${HASH}" | tr -d '\r' | sed -n '1p' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
if [ -z "${HASH}" ]; then
  echo "warning: Stallion native fingerprint returned an empty hash. Embedding unknown." >&2
  write_value "unknown"
  exit 0
fi

write_value "${HASH}"
exit 0
