# CLI README Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create README.md for @jsondb-cloud/cli following the jsondb-cloud README guideline.

**Architecture:** Single file creation — no code changes, just documentation.

**Tech Stack:** Markdown

---

### Task 1: Create README.md

**Files:**
- Create: `README.md`

**Step 1: Write README.md**

Create `README.md` with the following content. Reference the design doc at `docs/plans/2026-02-25-readme-design.md` and the guideline at `/Users/e/dev/jsondb-cloud/README-GUIDELINE.md` for structure.

Content must include, in order:

1. **Title**: `# @jsondb-cloud/cli`
2. **One-liner**: "The official CLI tool for [jsondb.cloud](https://jsondb.cloud) — a hosted JSON document database."
3. **Badges**: npm version, npm downloads, CI, License: MIT, Node.js >=18
   - npm badges target `@jsondb-cloud/cli`
   - CI badge: `https://github.com/JsonDBCloud/cli/actions/workflows/ci.yml/badge.svg`
   - Use exact badge markdown from guideline
4. **Install**: Three methods
   - npm: `npm install -g @jsondb-cloud/cli`
   - Homebrew: `brew install jsondbcloud/tap/jsondb`
   - Standalone binaries: link to GitHub Releases page at `https://github.com/JsonDBCloud/cli/releases` for macOS (arm64, x64) and Linux (x64, arm64)
5. **Quick Start**: CLI example format
   - `jsondb login`
   - `jsondb collections`
   - `jsondb push ./data/users.json --to users`
   - `jsondb get users/usr_abc123`
6. **Configuration**: Three subsections
   - Auth: `jsondb login` prompts for API key (keys start with `jdb_sk_`)
   - Environment variables: `JSONDB_API_KEY`, `JSONDB_PROJECT`, `JSONDB_BASE_URL`
   - Global flags: `--api-key`, `--project`, `--base-url`, `--format` (json, raw, ndjson, table)
   - Config stored at `~/.config/jsondb/credentials.json`
7. **Commands**: Grouped table
   - Auth: `login`, `logout`, `whoami`
   - Documents: `get <path>`, `create <collection>`, `update <path>`, `patch <path>`, `delete <path>`
   - Collections: `collections`, `documents <collection>`
   - Import/Export: `push <file> --to <collection>`, `pull <collection>`
   - Schema: `schema get`, `schema set`, `schema remove`
   - Versions: `versions list`, `versions get`, `versions diff`, `versions restore`
   - Webhooks: `webhooks list`, `webhooks create`, `webhooks get`, `webhooks update`, `webhooks delete`, `webhooks test`
   - Utilities: `validate <collection>`, `count <collection>`, `bulk <collection>`
8. **Documentation**: Link to `https://jsondb.cloud/docs`
9. **Related Packages**: Table with client, mcp, cli, python — use exact markdown from guideline
10. **License**: `MIT`

**Step 2: Review against guideline**

Verify:
- Tone: concise, technical, no filler, no emojis in headings
- SEO: package name in title and first sentence, "jsondb.cloud" in first sentence
- Code blocks have language identifiers (`bash`, `typescript`)
- Section order matches guideline exactly

**Step 3: Commit**

```bash
git add README.md docs/plans/
git commit -m "Add README following jsondb-cloud guideline"
```
