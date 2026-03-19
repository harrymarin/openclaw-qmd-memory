# Verification

## Expected Checks

Run:

```bash
bash scripts/verify.sh
```

Success should include:

- Node tests pass for helper and governance logic
- `~/.openclaw/extensions/qmd-memory` contains plugin files
- `qmd --index openclaw-memory status` shows the named index
- `qmd --index openclaw-memory vsearch "最近的会话状态和计划"` returns JSON rows or an empty JSON array without crashing
- `openclaw plugins list` shows `qmd-memory` as loaded after gateway restart

## Manual Sanity Check

After install, talk to OpenClaw and give it a clear preference or rule such as:

```text
以后默认本机优先，不要推荐远程服务器。
```

Then inspect:

- `~/.openclaw/workspace/memory/governance/index.json`
- `~/.openclaw/workspace/memory/governed/`

You should see a governed markdown memory entry created after the session ends.
