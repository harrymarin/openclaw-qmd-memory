#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

QMD_INDEX="${QMD_INDEX:-openclaw-memory}"
PLUGIN_DIR="${OPENCLAW_EXTENSIONS_DIR:-${HOME}/.openclaw/extensions}/qmd-memory"

log() {
  printf '[openclaw-qmd-memory] %s\n' "$1"
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

main() {
  need_cmd node
  need_cmd qmd

  node --test \
    "${SKILL_DIR}/plugin/qmd-memory/helpers.test.mjs" \
    "${SKILL_DIR}/plugin/qmd-memory/capture-governance.test.mjs"

  test -f "${PLUGIN_DIR}/index.js"
  test -f "${PLUGIN_DIR}/openclaw.plugin.json"
  log "Plugin files present at ${PLUGIN_DIR}"

  qmd --index "${QMD_INDEX}" status
  qmd --index "${QMD_INDEX}" vsearch "最近的会话状态和计划" -n 3 --json || true

  if command -v openclaw >/dev/null 2>&1; then
    openclaw plugins list || true
  fi

  log "Verification complete"
}

main "$@"

