[![English](https://img.shields.io/badge/English-Current-green)](./README.en.md)
[![中文](https://img.shields.io/badge/中文-点击查看-blue)](./README.md)
[![Install](https://img.shields.io/badge/Install-Guide-orange)](#install)
[![Structure](https://img.shields.io/badge/Structure-Architecture-purple)](#repository-structure)
[![Release](https://img.shields.io/github/v/release/harrymarin/openclaw-qmd-memory?style=flat-square)](https://github.com/harrymarin/openclaw-qmd-memory/releases)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](./LICENSE)

# OpenClaw QMD Memory

`openclaw-qmd-memory` is a local-first memory upgrade skill for OpenClaw. It does not replace the whole memory system. Instead, it keeps native `memory-core` in place while adding a more practical, inspectable, and governable local memory path.

## Quick Navigation

- [Why This Exists](#why-this-exists)
- [Core Capabilities](#core-capabilities)
- [Quick Start](#quick-start)
- [Install](#install)
- [Usage](#usage)
- [Repository Structure](#repository-structure)
- [Release Assets](#release-assets)

## Quick Start

1. Download the repo or release zip
2. Put the folder in a local working location
3. Run the install script
4. Run the verify script
5. Confirm the plugin, index, and recall path all work

```bash
bash scripts/install.sh
bash scripts/verify.sh
```

## Why This Exists

Long-term agent memory usually becomes unstable for three main reasons:

- weak `capture`
- opaque `store`
- low-quality `recall`

This repository focuses on making those three parts practical, inspectable, and shareable on a local machine.

## Core Capabilities

- keeps native OpenClaw `memory-core` enabled
- uses QMD `vsearch` for markdown-memory semantic recall
- captures high-signal user and assistant turns after sessions
- writes governed markdown memories
- applies fingerprint dedupe, `hot/warm/cold` tiering, TTL expiry, and archive sweep
- includes install and verification scripts

## Install

Run:

```bash
bash scripts/install.sh
```

Verify:

```bash
bash scripts/verify.sh
```

By default the installer will:

- install QMD
- copy the `qmd-memory` plugin into `~/.openclaw/extensions/qmd-memory`
- create the `openclaw-memory` index
- attach common markdown memory directories
- patch `~/.openclaw/openclaw.json`
- attempt to restart the OpenClaw gateway

## Usage

After install:

```bash
qmd --index openclaw-memory status
qmd --index openclaw-memory vsearch "recent session state and plans" -n 3 --json
openclaw plugins list
```

## Repository Structure

```text
openclaw-qmd-memory/
├── SKILL.md
├── README.md
├── README.en.md
├── LICENSE
├── agents/openai.yaml
├── plugin/qmd-memory/
├── scripts/
└── references/
```

## Release Assets

- first public release: `v0.1.0`
- recommended install path: download the release zip and extract the folder intact

## License

MIT
