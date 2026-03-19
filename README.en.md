[![中文](https://img.shields.io/badge/README-中文-blue)](./README.md)
[![License](https://img.shields.io/badge/license-MIT-black)](./LICENSE)

# OpenClaw QMD Memory

A local-first memory upgrade skill for OpenClaw.

It improves OpenClaw memory without downgrading OpenClaw and without replacing the native `memory-core` path. The package adds:

- QMD-based local semantic recall
- automatic capture of high-signal conversations into markdown memory
- dedupe, tiering, expiry, and archive governance

## Why This Exists

Long-term agent memory usually gets unstable for three reasons:

- weak `capture`
- opaque `store`
- low-quality `recall`

This repository focuses on making those three parts practical, inspectable, and shareable.

## Features

- Keeps native OpenClaw `memory-core` enabled
- Uses QMD `vsearch` for markdown memory recall
- Captures high-signal user and assistant turns after sessions
- Writes governed markdown memories
- Applies fingerprint dedupe, `hot/warm/cold` tiering, TTL expiry, and archive sweep
- Includes install and verification scripts

## Install

```bash
bash scripts/install.sh
```

Verify:

```bash
bash scripts/verify.sh
```

## Usage

After install:

```bash
qmd --index openclaw-memory status
qmd --index openclaw-memory vsearch "recent session state and plans" -n 3 --json
openclaw plugins list
```

## Structure

```text
openclaw-qmd-memory/
├── SKILL.md
├── agents/openai.yaml
├── plugin/qmd-memory/
├── scripts/
└── references/
```

## License

MIT

