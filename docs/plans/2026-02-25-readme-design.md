# README Design — @jsondb-cloud/cli

## Overview

Create a README.md following the jsondb-cloud README guideline for a CLI package.

## Sections

### 1. Title + One-liner

`# @jsondb-cloud/cli` with standard phrasing: "The official CLI tool for jsondb.cloud — a hosted JSON document database."

### 2. Badges

- npm version
- npm downloads
- CI (ci.yml — upcoming)
- License: MIT
- Node.js >= 18

### 3. Install

Three methods in priority order:

1. `npm install -g @jsondb-cloud/cli`
2. `brew install jsondbcloud/tap/jsondb`
3. Standalone binaries from GitHub Releases (darwin-arm64, darwin-x64, linux-x64, linux-arm64)

### 4. Quick Start

CLI example format per guideline. Show: auth login, list collections, push local data, get a document.

### 5. Configuration

- `jsondb login` interactive flow
- Global flags: `--api-key`, `--project`, `--base-url`, `--format`
- Config file location (`~/.config/jsondb/credentials.json`)

### 6. Commands

Grouped table with one-line descriptions:

- **Auth**: login, logout, whoami
- **Documents**: get, create, update, patch, delete
- **Collections**: collections, documents
- **Import/Export**: push, pull
- **Schema**: schema get/set/remove
- **Versions**: versions list/get/diff/restore
- **Webhooks**: webhooks list/create/get/update/delete/test
- **Utilities**: validate, count, bulk

### 7. Documentation

Link to jsondb.cloud/docs.

### 8. Related Packages

Standard cross-reference table (client, mcp, cli, python).

### 9. License

MIT.

## Excluded

- Error Handling (not relevant for CLI)
- Contributing (not accepting external contributions)
