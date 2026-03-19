#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
PLUGIN_SRC="${SKILL_DIR}/plugin/qmd-memory"

OPENCLAW_DIR="${OPENCLAW_DIR:-${HOME}/.openclaw}"
OPENCLAW_CONFIG="${OPENCLAW_CONFIG:-${OPENCLAW_DIR}/openclaw.json}"
OPENCLAW_EXTENSIONS_DIR="${OPENCLAW_EXTENSIONS_DIR:-${OPENCLAW_DIR}/extensions}"
PLUGIN_DST="${OPENCLAW_EXTENSIONS_DIR}/qmd-memory"
QMD_INDEX="${QMD_INDEX:-openclaw-memory}"
MEMORY_ROOT_DIR="${MEMORY_ROOT_DIR:-${OPENCLAW_DIR}/workspace/memory}"

log() {
  printf '[openclaw-qmd-memory] %s\n' "$1"
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

ensure_qmd() {
  if command -v qmd >/dev/null 2>&1; then
    log "QMD already installed"
    return
  fi
  need_cmd npm
  log "Installing QMD via npm"
  npm install -g @tobilu/qmd
}

copy_plugin() {
  mkdir -p "${OPENCLAW_EXTENSIONS_DIR}"
  rm -rf "${PLUGIN_DST}"
  cp -R "${PLUGIN_SRC}" "${PLUGIN_DST}"
  log "Copied plugin to ${PLUGIN_DST}"
}

ensure_collection() {
  local path="$1"
  local name="$2"
  local context="$3"

  mkdir -p "${path}"

  if ! qmd --index "${QMD_INDEX}" collection show "${name}" >/dev/null 2>&1; then
    qmd --index "${QMD_INDEX}" collection add "${path}" --name "${name}" --mask "**/*.md"
    log "Added QMD collection ${name}"
  else
    log "QMD collection ${name} already exists"
  fi

  qmd --index "${QMD_INDEX}" context rm "qmd://${name}" >/dev/null 2>&1 || true
  qmd --index "${QMD_INDEX}" context rm "qmd://${name}/" >/dev/null 2>&1 || true
  qmd --index "${QMD_INDEX}" context add "qmd://${name}" "${context}"
  log "Configured context for ${name}"
}

configure_index() {
  ensure_collection "${OPENCLAW_DIR}/workspace/memory" "workspace-memory" "OpenClaw 主工作区的日记式记忆、会话状态、提醒和 insight，总体上最重要。"
  ensure_collection "${OPENCLAW_DIR}/workspace-coordinator/memory" "coordinator-memory" "协调型子智能体的过程记忆和阶段记录。"
  ensure_collection "${OPENCLAW_DIR}/workspace-peer/memory" "peer-memory" "同伴型子智能体的补充记忆和协作记录。"
  ensure_collection "${OPENCLAW_DIR}/shared-memory" "shared-memory" "跨会话共享知识和稳定背景信息。"
  qmd --index "${QMD_INDEX}" update
  qmd --index "${QMD_INDEX}" embed
  log "QMD index ${QMD_INDEX} updated and embedded"
}

configure_openclaw() {
  need_cmd node
  node "${SCRIPT_DIR}/configure-openclaw.mjs" \
    --config "${OPENCLAW_CONFIG}" \
    --memory-root "${MEMORY_ROOT_DIR}" \
    --index "${QMD_INDEX}"
  log "Patched ${OPENCLAW_CONFIG}"
}

restart_gateway() {
  if ! command -v openclaw >/dev/null 2>&1; then
    log "openclaw CLI not found; skipping gateway restart"
    return
  fi

  if openclaw gateway restart >/dev/null 2>&1; then
    log "Gateway restarted"
    return
  fi

  log "Gateway restart skipped or unsupported; restart it manually if needed"
}

main() {
  need_cmd cp
  ensure_qmd
  copy_plugin
  configure_index
  configure_openclaw
  restart_gateway
  log "Install complete"
  log "Next: bash ${SCRIPT_DIR}/verify.sh"
}

main "$@"

