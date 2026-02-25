# @jsondb-cloud/cli

The official CLI tool for [jsondb.cloud](https://jsondb.cloud) — a hosted JSON document database.

[![npm version](https://img.shields.io/npm/v/@jsondb-cloud/cli)](https://www.npmjs.com/package/@jsondb-cloud/cli)
[![npm downloads](https://img.shields.io/npm/dm/@jsondb-cloud/cli)](https://www.npmjs.com/package/@jsondb-cloud/cli)
[![CI](https://github.com/JsonDBCloud/cli/actions/workflows/ci.yml/badge.svg)](https://github.com/JsonDBCloud/cli/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)
[![Bundle size](https://img.shields.io/bundlephobia/min/@jsondb-cloud/cli)](https://bundlephobia.com/package/@jsondb-cloud/cli)
[![GitHub stars](https://img.shields.io/github/stars/JsonDBCloud/cli)](https://github.com/JsonDBCloud/cli)
[![Last commit](https://img.shields.io/github/last-commit/JsonDBCloud/cli)](https://github.com/JsonDBCloud/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Install

### npm

```bash
npm install -g @jsondb-cloud/cli
```

### Homebrew

```bash
brew install jsondbcloud/tap/jsondb
```

### Standalone binaries

Download prebuilt binaries from [GitHub Releases](https://github.com/JsonDBCloud/cli/releases).

Available platforms: macOS (arm64, x64), Linux (x64, arm64).

## Quick Start

Get your API key from [jsondb.cloud/dashboard/api-keys](https://jsondb.cloud/dashboard/api-keys), then:

```bash
# Authenticate (paste your API key when prompted)
jsondb login

# Create a document
echo '{"name": "Alice", "email": "alice@example.com"}' | jsondb create users
# ✓ Created usr_abc123 in users

# Read it back
jsondb get users/usr_abc123
# {"_id": "usr_abc123", "name": "Alice", "email": "alice@example.com", ...}

# Delete it
jsondb delete users/usr_abc123
# ✓ Deleted users/usr_abc123
```

## Configuration

### Auth

`jsondb login` prompts for your API key interactively. Keys start with `jdb_sk_`.

Credentials are stored at `~/.config/jsondb/credentials.json`.

### Environment variables

| Variable | Description |
|----------|-------------|
| `JSONDB_API_KEY` | API key (overrides stored credentials) |
| `JSONDB_PROJECT` | Default project namespace |
| `JSONDB_BASE_URL` | API base URL (for self-hosted or staging) |

### Global flags

| Flag | Description |
|------|-------------|
| `--api-key <key>` | API key for this request |
| `--project <ns>` | Project namespace |
| `--base-url <url>` | API base URL |
| `--format <fmt>` | Output format: `json`, `raw`, `ndjson`, `table` |
| `--verbose` | Show debug info (request URLs, status codes) |

## Commands

### Auth

| Command | Description |
|---------|-------------|
| `login` | Authenticate with your API key |
| `logout` | Remove stored credentials |
| `whoami` | Show the current authenticated user |

### Documents

| Command | Description |
|---------|-------------|
| `get <path>` | Retrieve a document by path |
| `create <collection>` | Create a new document in a collection |
| `update <path>` | Replace a document at the given path |
| `patch <path>` | Partially update a document |
| `delete <path>` | Delete a document |

### Collections

| Command | Description |
|---------|-------------|
| `collections` | List all collections |
| `documents <collection>` | List documents in a collection |

### Import/Export

| Command | Description |
|---------|-------------|
| `push <file> --to <collection>` | Import a local JSON file into a collection |
| `pull <collection>` | Export a collection to a local file |

### Schema

| Command | Description |
|---------|-------------|
| `schema get <collection>` | Retrieve the schema for a collection |
| `schema set <collection>` | Set or update a collection schema |
| `schema remove <collection>` | Remove the schema from a collection |

### Versions

| Command | Description |
|---------|-------------|
| `versions list <collection> <id>` | List version history for a document |
| `versions get <collection> <id> <version>` | Retrieve a specific version |
| `versions diff <collection> <id>` | Show diff between versions |
| `versions restore <collection> <id> <version>` | Restore a document to a previous version |

### Webhooks

| Command | Description |
|---------|-------------|
| `webhooks list <collection>` | List webhooks for a collection |
| `webhooks create <collection>` | Create a new webhook |
| `webhooks get <collection> <id>` | Get webhook details |
| `webhooks update <collection> <id>` | Update a webhook |
| `webhooks delete <collection> <id>` | Delete a webhook |
| `webhooks test <collection> <id>` | Send a test event to a webhook |

### Utilities

| Command | Description |
|---------|-------------|
| `validate <collection>` | Validate documents against the collection schema |
| `count <collection>` | Count documents in a collection |
| `bulk <collection>` | Perform bulk operations on a collection |

## Documentation

Full documentation at [jsondb.cloud/docs](https://jsondb.cloud/docs).

## Related Packages

| Package | Description |
|---------|-------------|
| [@jsondb-cloud/client](https://github.com/JsonDBCloud/node) | JavaScript/TypeScript SDK |
| [@jsondb-cloud/mcp](https://github.com/JsonDBCloud/mcp) | MCP server for AI agents |
| [@jsondb-cloud/cli](https://github.com/JsonDBCloud/cli) | CLI tool |
| [jsondb-cloud](https://github.com/JsonDBCloud/python) (PyPI) | Python SDK |

## License

MIT
