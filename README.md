[![English](https://img.shields.io/badge/English-Click_to_View-blue)](./README.en.md)
[![中文](https://img.shields.io/badge/中文-当前-green)](./README.md)
[![Install](https://img.shields.io/badge/Install-Guide-orange)](#安装)
[![Structure](https://img.shields.io/badge/Structure-Architecture-purple)](#仓库结构)
[![Release](https://img.shields.io/github/v/release/harrymarin/openclaw-qmd-memory?style=flat-square)](https://github.com/harrymarin/openclaw-qmd-memory/releases)
[![License](https://img.shields.io/badge/License-MIT-lightgrey)](./LICENSE)

# OpenClaw QMD Memory

`openclaw-qmd-memory` 是一个给 OpenClaw 用的本地优先记忆增强 skill。它不是替换整套记忆系统，而是在不降级 OpenClaw、也不替换原生 `memory-core` 的前提下，补上一套更实用、可治理、可回溯的本地记忆链路。

## 快速导航

- [为什么做这个](#为什么做这个)
- [核心能力](#核心能力)
- [快速开始](#快速开始)
- [安装](#安装)
- [使用方式](#使用方式)
- [仓库结构](#仓库结构)
- [发布资产](#发布资产)

## 快速开始

1. 下载仓库或 release zip
2. 把整个目录放到本地可执行位置
3. 运行安装脚本
4. 运行验证脚本
5. 确认插件、索引和 recall 都已正常工作

```bash
bash scripts/install.sh
bash scripts/verify.sh
```

## 为什么做这个

很多 OpenClaw 记忆方案会强调“层数很多”或者“架构很强”，但真正影响长期使用体验的往往是三件事：

- `capture` 能不能把重要对话稳定沉淀下来
- `store` 能不能保持可读、可治理、可回滚
- `recall` 能不能在当下问题里召回真正相关的内容

这个 skill 的目标不是做“神话级记忆”，而是做一套本机可跑、可解释、可分享的增强记忆方案。

## 核心能力

- 保留 OpenClaw 原生 `memory-core`，降低接入风险
- 使用 QMD 为 markdown 记忆提供 `vsearch` 语义召回
- 在 `agent_end` 自动提炼高信号 user/assistant 对话
- 将记忆写入治理后的 markdown 文件
- 自动做指纹去重、`hot/warm/cold` 分层、TTL 过期与 archive
- 提供可手动调用的本地记忆检索工具

## 安装

把仓库复制到本地后运行：

```bash
bash scripts/install.sh
```

验证安装：

```bash
bash scripts/verify.sh
```

默认会：

- 安装 QMD
- 复制 `qmd-memory` 插件到 `~/.openclaw/extensions/qmd-memory`
- 创建 `openclaw-memory` 索引
- 接入常用 markdown 记忆目录
- 修改 `~/.openclaw/openclaw.json`
- 尝试重启 OpenClaw gateway

## 使用方式

这个仓库本身是一个 skill 包，可以直接放到：

```bash
~/.codex/skills/openclaw-qmd-memory
```

安装完成后，你可以运行：

```bash
qmd --index openclaw-memory status
qmd --index openclaw-memory vsearch "最近的会话状态和计划" -n 3 --json
openclaw plugins list
```

## 仓库结构

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

说明：

- `plugin/qmd-memory/` 是实际接入 OpenClaw 的插件源码
- `scripts/install.sh` 是幂等安装脚本
- `scripts/verify.sh` 是验证脚本
- `references/` 放架构和验证说明

## 发布资产

- 首个发布版本：`v0.1.0`
- 建议优先下载 release zip 资产安装

## License

MIT
