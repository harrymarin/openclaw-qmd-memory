import fs from "node:fs/promises";
import path from "node:path";

function nowIso() {
  return new Date().toISOString();
}

function monthStamp(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, value) {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function computeExpiry(createdAt, ttlDays) {
  const created = new Date(createdAt).getTime();
  return new Date(created + ttlDays * 24 * 60 * 60 * 1000).toISOString();
}

function memoryFileName(entry) {
  const stamp = new Date(entry.createdAt).toISOString().replace(/[-:]/g, "").slice(0, 15);
  return `${stamp}-${entry.category}-${entry.fingerprint}.md`;
}

export function resolvePaths(config) {
  const root = config.memoryRootDir;
  return {
    root,
    governedRoot: path.join(root, "governed"),
    tierDir: (tier) => path.join(root, "governed", tier, monthStamp()),
    archiveDir: () => path.join(root, "governed", "archive", monthStamp()),
    indexFile: path.join(root, "governance", "index.json"),
  };
}

function renderEntryMarkdown(entry) {
  const lines = [
    `# ${entry.summary}`,
    "",
    `- fingerprint: \`${entry.fingerprint}\``,
    `- category: \`${entry.category}\``,
    `- priority: \`${entry.priority}\``,
    `- tier: \`${entry.tier}\``,
    `- created_at: \`${entry.createdAt}\``,
    `- last_seen_at: \`${entry.lastSeenAt}\``,
    `- expires_at: \`${entry.expiresAt}\``,
    `- hits: \`${entry.hits}\``,
    "",
    "## Source Snapshot",
    "",
    `- user: ${entry.source?.user || "-"}`,
    `- assistant: ${entry.source?.assistant || "-"}`,
    "",
  ];
  return `${lines.join("\n")}\n`;
}

export async function loadGovernanceIndex(config) {
  const paths = resolvePaths(config);
  const data = await readJson(paths.indexFile, { entries: {} });
  if (!data.entries || typeof data.entries !== "object") {
    return { entries: {}, paths };
  }
  return { entries: data.entries, paths };
}

async function persistIndex(paths, entries) {
  await writeJson(paths.indexFile, { entries, updatedAt: nowIso() });
}

async function writeEntryFile(paths, entry) {
  const dir = entry.archivedAt ? paths.archiveDir() : paths.tierDir(entry.tier);
  await ensureDir(dir);
  const filePath = path.join(dir, memoryFileName(entry));
  await fs.writeFile(filePath, renderEntryMarkdown(entry), "utf8");
  return filePath;
}

async function removeIfExists(filePath) {
  if (!filePath) return;
  try {
    await fs.rm(filePath, { force: true });
  } catch {
    // ignore
  }
}

export async function upsertCandidates(config, candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return { written: 0, updated: 0, skipped: 0 };
  }
  const { entries, paths } = await loadGovernanceIndex(config);
  let written = 0;
  let updated = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const existing = entries[candidate.fingerprint];
    if (existing) {
      existing.lastSeenAt = nowIso();
      existing.hits = (existing.hits ?? 1) + 1;
      if (candidate.priority > (existing.priority ?? 0)) {
        existing.priority = candidate.priority;
        existing.tier = candidate.tier;
        existing.expiresAt = computeExpiry(existing.createdAt, candidate.ttlDays);
      }
      await removeIfExists(existing.filePath);
      existing.filePath = await writeEntryFile(paths, existing);
      updated += 1;
      continue;
    }

    const entry = {
      ...candidate,
      hits: 1,
      createdAt: nowIso(),
      lastSeenAt: nowIso(),
      expiresAt: computeExpiry(nowIso(), candidate.ttlDays),
      archivedAt: null,
    };
    entry.filePath = await writeEntryFile(paths, entry);
    entries[entry.fingerprint] = entry;
    written += 1;
  }

  await persistIndex(paths, entries);
  return { written, updated, skipped };
}

export async function runGovernanceSweep(config) {
  const { entries, paths } = await loadGovernanceIndex(config);
  const now = Date.now();
  let archived = 0;
  let moved = 0;

  for (const entry of Object.values(entries)) {
    if (!entry || typeof entry !== "object") continue;
    const expiresAt = typeof entry.expiresAt === "string" ? Date.parse(entry.expiresAt) : NaN;
    const lastSeen = typeof entry.lastSeenAt === "string" ? Date.parse(entry.lastSeenAt) : now;

    if (!entry.archivedAt && Number.isFinite(expiresAt) && expiresAt < now) {
      await removeIfExists(entry.filePath);
      entry.archivedAt = nowIso();
      entry.filePath = await writeEntryFile(paths, entry);
      archived += 1;
      continue;
    }

    if (entry.archivedAt) continue;

    let nextTier = entry.tier;
    const ageDays = (now - lastSeen) / (24 * 60 * 60 * 1000);
    if (entry.tier === "hot" && ageDays > 30) nextTier = "warm";
    if (entry.tier === "warm" && ageDays > 90) nextTier = "cold";

    if (nextTier !== entry.tier) {
      entry.tier = nextTier;
      await removeIfExists(entry.filePath);
      entry.filePath = await writeEntryFile(paths, entry);
      moved += 1;
    }
  }

  await persistIndex(paths, entries);
  return { archived, moved, total: Object.keys(entries).length };
}
