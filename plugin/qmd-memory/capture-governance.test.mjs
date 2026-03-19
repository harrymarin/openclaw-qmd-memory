import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { buildMemoryCandidates, deriveTier, extractConversation } from "./capture.js";
import { loadGovernanceIndex, runGovernanceSweep, upsertCandidates } from "./governance.js";

test("extractConversation handles text parts", () => {
  const messages = [
    { role: "user", content: [{ type: "text", text: "以后优先本机部署。" }] },
    { role: "assistant", content: "收到，后续默认本机优先。" },
  ];
  assert.deepEqual(extractConversation(messages), [
    { role: "user", text: "以后优先本机部署。" },
    { role: "assistant", text: "收到，后续默认本机优先。" },
  ]);
});

test("buildMemoryCandidates extracts high-signal rules", () => {
  const candidates = buildMemoryCandidates([
    { role: "user", content: "以后不要推荐远程服务器，必须本机优先。" },
    { role: "assistant", content: "记住：后续必须本机优先，不再推荐远程服务器。" },
  ]);
  assert.ok(candidates.length >= 1);
  assert.equal(candidates[0].category, "decision");
  assert.equal(deriveTier(candidates[0].priority), candidates[0].tier);
});

test("governance upsert dedupes and archives expired memories", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "qmd-memory-"));
  const config = { memoryRootDir: root };
  const candidates = [
    {
      fingerprint: "abc123",
      summary: "后续必须本机优先",
      category: "decision",
      priority: 90,
      tier: "hot",
      ttlDays: 0,
      source: { user: "本机优先", assistant: "必须本机优先" },
    },
  ];

  const first = await upsertCandidates(config, candidates);
  const second = await upsertCandidates(config, candidates);
  assert.equal(first.written, 1);
  assert.equal(second.updated, 1);

  const sweep = await runGovernanceSweep(config);
  assert.equal(sweep.archived, 1);

  const state = await loadGovernanceIndex(config);
  assert.equal(state.entries.abc123.archivedAt !== null, true);
});
