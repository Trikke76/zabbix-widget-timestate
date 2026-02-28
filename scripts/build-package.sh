#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed." >&2
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip is required but not installed." >&2
  exit 1
fi

MODULE_ID="$(jq -r '.id' manifest.json)"
VERSION="$(jq -r '.version' manifest.json)"

if [[ -z "$MODULE_ID" || "$MODULE_ID" == "null" ]]; then
  echo "manifest.json missing 'id'" >&2
  exit 1
fi

if [[ -z "$VERSION" || "$VERSION" == "null" ]]; then
  echo "manifest.json missing 'version'" >&2
  exit 1
fi

PKG_ROOT="dist/${MODULE_ID}"
PKG_NAME="${MODULE_ID}-zabbix-v${VERSION}.zip"

rm -rf "dist/${MODULE_ID}" "dist/${PKG_NAME}"
mkdir -p "$PKG_ROOT"

rsync -a ./ "$PKG_ROOT/" \
  --exclude '.git' \
  --exclude '.github' \
  --exclude 'dist' \
  --exclude '.DS_Store' \
  --exclude '.gitignore' \
  --exclude '*.zip'

(
  cd dist
  zip -r "$PKG_NAME" "$MODULE_ID" >/dev/null
)

echo "Built: dist/${PKG_NAME}"
