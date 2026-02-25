# llms.txt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create llms.txt (concise) and llms-full.txt (complete) files for LLMs helping developers use the CLI.

**Architecture:** Two static text files at project root. Content derived from README, source code, and command implementations. No code changes needed.

**Tech Stack:** Plain text / markdown

---

### Task 1: Create llms.txt (concise)

**Files:**
- Create: `llms.txt`

**Step 1: Write llms.txt**

The file should contain these sections in order:

1. **Title line:** `# @jsondb-cloud/cli` followed by a one-line tagline
2. **Overview:** 2-3 sentences explaining what jsondb.cloud is and what the CLI does
3. **Installation:** Three methods (npm, Homebrew, binary) — one line each
4. **Authentication:** How to log in (one-liner about `jsondb login` and API keys starting with `jdb_sk_`)
5. **Configuration:** Env vars (JSONDB_API_KEY, JSONDB_PROJECT, JSONDB_BASE_URL) and credential file location (~/.config/jsondb/credentials.json)
6. **Commands overview:** Grouped by category, one line per command with syntax. Groups: Auth, Documents, Collections, Import/Export, Schema, Versions, Webhooks, Utilities
7. **Global flags:** --api-key, --project, --base-url, --format
8. **Quick example:** 5-line workflow (login, collections, push, get, pull)
9. **Footer:** Link to llms-full.txt for complete docs, link to docs site, related packages

Target: ~100 lines. Keep it scannable — an LLM should be able to decide in seconds whether this tool is relevant to the user's question.

**Step 2: Commit**

```bash
git add llms.txt
git commit -m "docs: add llms.txt (concise LLM reference)"
```

---

### Task 2: Create llms-full.txt (complete)

**Files:**
- Create: `llms-full.txt`

**Step 1: Write llms-full.txt**

The file should contain ALL of the following sections with complete detail:

**Section 1: Header**
- Title, tagline, what jsondb.cloud is
- Node requirement (>=18)

**Section 2: Installation (complete)**
- npm: `npm install -g @jsondb-cloud/cli`
- Homebrew: `brew install jsondbcloud/tap/jsondb`
- Standalone: download from GitHub Releases, available platforms
- Verify: `jsondb --version`

**Section 3: Configuration (complete)**
- Credentials file: `~/.config/jsondb/credentials.json` with format:
  ```json
  { "apiKey": "jdb_sk_...", "project": "default", "baseUrl": "https://api.jsondb.cloud" }
  ```
- File permissions: 0o600 (user-only)
- Environment variables with full precedence rules: env vars > config file > defaults
  - JSONDB_API_KEY — overrides stored key
  - JSONDB_PROJECT — project namespace (default: from config or "v1" for env-only)
  - JSONDB_NAMESPACE — legacy alias for JSONDB_PROJECT
  - JSONDB_BASE_URL — API base (default: https://api.jsondb.cloud)
- Global flags: --api-key, --project, --base-url, --format (json, raw, ndjson, table)
- Precedence: CLI flags > env vars > config file > defaults

**Section 4: Auth commands**
- `jsondb login [--api-key <key>] [--project <ns>] [--base-url <url>]`
  - Interactive prompt if no --api-key provided
  - Key must start with `jdb_sk_` (e.g., `jdb_sk_live_...` or `jdb_sk_test_...`)
  - Saves to ~/.config/jsondb/credentials.json
  - Example: `jsondb login --api-key jdb_sk_test_abc123`
- `jsondb logout` — removes stored credentials
- `jsondb whoami` — shows current API key (masked), project, base URL

**Section 5: Document CRUD**
- `jsondb get <collection>/<docId> [--format json|raw]`
  - Example: `jsondb get users/usr_abc123`
  - Response: the document JSON
  - Error: exits with code 1, prints error message from API

- `jsondb create <collection> [--file <file>] [--id <id>]`
  - Reads JSON from --file or stdin
  - Example: `echo '{"name":"Alice"}' | jsondb create users`
  - Example: `jsondb create users --file user.json --id usr_custom`
  - Response: `Created <id> in <collection>`

- `jsondb update <collection>/<docId> [--file <file>]`
  - Full document replacement (PUT)
  - Reads from --file or stdin

- `jsondb patch <collection>/<docId> [--file <file>]`
  - Partial update (PATCH)
  - Reads from --file or stdin

- `jsondb delete <collection>/<docId>`
  - Response: `Deleted <path>`

**Section 6: Collections**
- `jsondb collections` — lists all collection names (sorted)
- `jsondb documents <collection> [--limit <n>] [--format json|raw]`
  - Default limit: 20
  - Returns paginated document list

**Section 7: Import/Export**
- `jsondb push <file> --to <collection> [--on-conflict fail|skip|overwrite]`
  - Supported formats: .json, .csv, .ndjson (detected from file extension)
  - Default on-conflict: fail
  - Response: summary with created/skipped/failed/overwritten counts
  - Shows first 10 errors if any

- `jsondb pull <collection> [--out <file>] [--format json|csv|ndjson] [--filter <field=value>]`
  - Default format: json
  - If --out is omitted, outputs to stdout
  - Filter syntax: `--filter "status=active"`
  - Example: `jsondb pull users --out users.csv --format csv`

**Section 8: Schema management**
- `jsondb schema get <collection>` — returns JSON schema (or "No schema set")
- `jsondb schema set <collection> [--file <file>]` — reads JSON schema from file or stdin
- `jsondb schema remove <collection>` — removes schema from collection

**Section 9: Version history**
- `jsondb versions list <collection> <docId>` — table with Version, Action, Timestamp, Size
- `jsondb versions get <collection> <docId> <version>` — document at that version
- `jsondb versions diff <collection> <docId> --from <n> --to <n>` — JSON diff
- `jsondb versions restore <collection> <docId> <version>` — restores and prints restored doc

**Section 10: Webhooks**
- `jsondb webhooks list <collection>` — table with ID, URL, Events, Status
- `jsondb webhooks create <collection> --url <url> --events <events> [--description <desc>] [--secret <secret>]`
  - Events: comma-separated (document.created, document.updated, document.deleted)
- `jsondb webhooks get <collection> <id>` — full webhook details + recent deliveries
- `jsondb webhooks update <collection> <id> [--url] [--events] [--description] [--status active|disabled]`
- `jsondb webhooks delete <collection> <id>`
- `jsondb webhooks test <collection> <id>` — sends test event

**Section 11: Utilities**
- `jsondb validate <collection> [--file <file>]` — dry-run schema validation, reads from file or stdin
  - 422 response means validation failed, prints validation errors
- `jsondb count <collection> [--filter <expr...>]` — prints document count
  - Filter: `--filter status=active --filter role=admin` (multiple allowed)
  - Filter syntax: `field=value` or `field[op]=value`
- `jsondb bulk <collection> [--file <file>]` — bulk operations from JSON array via file or stdin

**Section 12: API key management**
- `jsondb keys list` — table with NAME, HINT, SCOPE, PROJECT, STATUS, CREATED
- `jsondb keys create` — requires dashboard auth (prints message directing to web UI)
- `jsondb keys revoke <id>` — requires dashboard auth

**Section 13: Error handling**
- All errors exit with code 1
- Error format on stderr: `ERROR: <message>` (non-TTY) or `✗ Error: <message>` (TTY)
- API errors include the server's error message when available
- Common error pattern: `{ "error": { "message": "..." } }`
- Auth errors: "Not authenticated" with suggestion to run `jsondb login`

**Section 14: Output formats**
- Default (TTY): pretty-printed JSON with 2-space indent
- Default (non-TTY/piped): compact single-line JSON
- `--format raw`: always compact JSON
- `--format json`: always pretty JSON
- Table output: padded columns with header and separator (for lists/versions/webhooks/keys)
- Success messages: `OK: <message>` (non-TTY) or `✓ <message>` (TTY, green)
- Warnings: `WARN: <message>` (non-TTY) or `⚠ <message>` (TTY, yellow)

**Section 15: Common workflows**
- Getting started: login → collections → get
- Importing data: push from JSON/CSV
- Exporting data: pull to file
- Schema enforcement: schema set → validate → create
- Version management: versions list → diff → restore

**Section 16: Related packages**
- @jsondb-cloud/client (JS/TS SDK)
- @jsondb-cloud/mcp (MCP server for AI agents)
- jsondb-cloud (Python SDK)
- Docs: jsondb.cloud/docs

**Step 2: Commit**

```bash
git add llms-full.txt
git commit -m "docs: add llms-full.txt (complete LLM reference)"
```
