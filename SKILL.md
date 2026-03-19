---
name: openclaw-qmd-memory
description: Use when the user wants OpenClaw upgraded with local QMD-backed memory recall, automatic high-signal markdown capture, and governed memory tiering without downgrading OpenClaw.
---

# OpenClaw QMD Memory

## Overview

Install a local-first memory upgrade for OpenClaw that keeps the native `memory-core` in place while adding:

- QMD semantic recall for markdown memory
- automatic high-signal conversation capture
- governed markdown memory with dedupe, tiering, expiry, and archive sweep

Prefer this skill when the user wants a practical memory system that is easy to inspect, easy to back up, and safe to run on modern OpenClaw builds without enabling the higher-risk OpenViking takeover path.

This skill is install-first, verify-second. Do not stop at configuration edits or file copies. The work is not complete until runtime verification succeeds.

## What This Skill Installs

- A local OpenClaw plugin: `qmd-memory`
- A named QMD index: `openclaw-memory`
- Default markdown collections for:
  - `~/.openclaw/workspace/memory`
  - `~/.openclaw/workspace-coordinator/memory`
  - `~/.openclaw/workspace-peer/memory`
  - `~/.openclaw/shared-memory`
- Plugin config that enables:
  - `autoRecall`
  - `autoCapture`
  - `governanceEnabled`
  - `updateIndexAfterWrite`

## Quick Start

Run the installer:

```bash
bash scripts/install.sh
```

Then verify:

```bash
bash scripts/verify.sh
```

## Workflow

1. Install QMD if it is missing.
   The installer will use `npm install -g @tobilu/qmd`.

2. Copy the packaged `qmd-memory` plugin into `~/.openclaw/extensions/qmd-memory`.

3. Ensure `openclaw-memory` collections and human-written collection contexts exist.

4. Patch `~/.openclaw/openclaw.json` to allow and enable the plugin.

5. Run `qmd update` and `qmd embed` for the named index.

6. Restart the OpenClaw gateway if the service command is available.

7. Run the verification script and confirm the plugin is loaded.

## Required Completion Path

For a successful run, all of the following are REQUIRED unless the user explicitly asks to stop early:

- QMD is installed or confirmed available
- the `qmd-memory` plugin is present in the expected OpenClaw extensions path
- `openclaw.json` is patched correctly
- the QMD index exists and is updated
- verification is run after installation
- the result is reported with concrete evidence, not assumption

Do not treat the install as complete if verification has not been run.
Do not treat the memory upgrade as complete if the plugin is copied but not confirmed loadable.

## Defaults

- QMD index: `openclaw-memory`
- Recall mode: `vsearch`
- Max recall results: `4`
- Minimum score: `0.35`
- Snippet limit: `280`
- Memory root: `~/.openclaw/workspace/memory`

These defaults are conservative and optimized for stability on local machines.

## Commands

Install:

```bash
bash scripts/install.sh
```

Verify:

```bash
bash scripts/verify.sh
```

Manual recall smoke test:

```bash
qmd --index openclaw-memory vsearch "最近的会话状态和计划" -n 3 --json
```

## File Layout

### plugin/

- `plugin/qmd-memory/`: packaged OpenClaw plugin source

### scripts/

- `scripts/install.sh`: idempotent installer
- `scripts/configure-openclaw.mjs`: safe JSON patcher for `openclaw.json`
- `scripts/verify.sh`: smoke tests and status checks

### references/

- `references/architecture.md`: memory flow and component responsibilities
- `references/verification.md`: what a successful install should look like

## Guardrails

- Do not disable `memory-core` unless the user explicitly asks for a deeper memory swap.
- Do not enable OpenViking as the main context engine on versions with known compatibility risk.
- Do not describe this as “perfect memory”. It is a stronger recall and governance layer, not magic.
- Do not skip verification after install.
- Do not claim success from configuration edits alone.
- Do not stop at "files are in place" without runtime confirmation.

## Completion Standard

Before claiming the memory upgrade is complete, confirm:

- install steps finished without blocking errors
- plugin path is correct
- index path is correct
- verification script ran
- plugin load or recall path is confirmed by output
- any remaining risks are stated explicitly
