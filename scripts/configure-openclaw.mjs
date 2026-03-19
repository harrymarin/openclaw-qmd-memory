#!/usr/bin/env node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    args.set(item.slice(2), argv[i + 1]);
    i += 1;
  }
  return args;
}

function expandHome(input) {
  if (!input) return input;
  if (input === "~") return os.homedir();
  if (input.startsWith("~/")) return path.join(os.homedir(), input.slice(2));
  return input;
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const configPath = expandHome(args.get("config"));
  const memoryRoot = expandHome(args.get("memory-root"));
  const index = args.get("index") || "openclaw-memory";

  if (!configPath || !memoryRoot) {
    throw new Error("Missing required flags: --config and --memory-root");
  }

  const raw = await fs.readFile(configPath, "utf8");
  const config = JSON.parse(raw);

  config.plugins ||= {};
  config.plugins.enabled = config.plugins.enabled !== false;
  config.plugins.allow = ensureArray(config.plugins.allow);
  if (!config.plugins.allow.includes("qmd-memory")) {
    config.plugins.allow.push("qmd-memory");
  }

  config.plugins.entries ||= {};
  config.plugins.entries["qmd-memory"] = {
    enabled: true,
    config: {
      index,
      autoRecall: true,
      recallMode: "vsearch",
      maxResults: 4,
      minScore: 0.35,
      timeoutMs: 8000,
      maxSnippetChars: 280,
      autoCapture: true,
      governanceEnabled: true,
      updateIndexAfterWrite: true,
      memoryRootDir: memoryRoot,
    },
  };

  config.meta ||= {};
  config.meta.lastTouchedAt = new Date().toISOString();

  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

