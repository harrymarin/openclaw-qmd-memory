# Architecture

## Goal

Upgrade OpenClaw memory without replacing the native `memory-core` path.

## Flow

1. `before_prompt_build`
   The `qmd-memory` plugin runs a QMD recall command and injects compact historical snippets into the prompt.

2. `agent_end`
   The plugin scans the final user and assistant turns, extracts high-signal statements, and turns them into memory candidates.

3. `governance`
   Candidates are deduped by fingerprint, assigned `hot`, `warm`, or `cold`, written as markdown, and archived after expiry.

4. `qmd update` and `qmd embed`
   Fresh markdown memory becomes searchable in later sessions.

## Layers

- `capture`: `capture.js`
- `store + governance`: `governance.js`
- `recall + tools`: `index.js`
- `format helpers`: `helpers.js`

## Why This Layout

- Local-first and inspectable
- Safe fallback because `memory-core` stays enabled
- Easy to back up because memory remains markdown + JSON
- Easy to share because the plugin is plain Node ESM

