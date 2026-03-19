import test from "node:test";
import assert from "node:assert/strict";

import { buildRecallContext, normalizeResults, trimText } from "./helpers.js";
import { createRecallCommandPlan } from "./index.js";

test("trimText trims whitespace and adds ellipsis", () => {
  assert.equal(trimText("  hello   world  ", 20), "hello world");
  assert.equal(trimText("abcdefghij", 7), "abcd...");
});

test("normalizeResults keeps only usable qmd rows", () => {
  const results = normalizeResults(
    [
      { file: "qmd://notes/a.md", score: 0.9, snippet: " useful snippet " },
      { file: "qmd://notes/b.md", body: "body fallback" },
      { score: 0.2, snippet: "missing file" },
    ],
    50,
  );

  assert.deepEqual(results, [
    {
      file: "qmd://notes/a.md",
      title: undefined,
      score: 0.9,
      snippet: "useful snippet",
      docid: undefined,
    },
    {
      file: "qmd://notes/b.md",
      title: undefined,
      score: undefined,
      snippet: "body fallback",
      docid: undefined,
    },
  ]);
});

test("buildRecallContext renders a compact memory block", () => {
  const context = buildRecallContext([
    {
      file: "qmd://workspace-memory/session-state.md",
      score: 0.64,
      snippet: "Current session state",
    },
  ]);

  assert.match(context, /<qmd-relevant-memories>/);
  assert.match(context, /qmd:\/\/workspace-memory\/session-state.md score=0.64/);
  assert.match(context, /Current session state/);
  assert.match(context, /<\/qmd-relevant-memories>/);
});

test("createRecallCommandPlan builds a vsearch json command by default", () => {
  const plan = createRecallCommandPlan("最近的会话状态", {
    qmdPath: "qmd",
    index: "openclaw-memory",
    recallMode: "vsearch",
    maxResults: 4,
    minScore: 0.35,
  });

  assert.deepEqual(plan, {
    command: "qmd",
    args: [
      "--index",
      "openclaw-memory",
      "vsearch",
      "最近的会话状态",
      "--json",
      "-n",
      "4",
      "--min-score",
      "0.35",
    ],
  });
});
