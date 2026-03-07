# llms.txt Design for @jsondb-cloud/cli

## Overview

Two files at project root following the llms.txt convention. Target audience: LLMs helping developers use the CLI tool.

## Files

### `llms.txt` (concise, ~80-120 lines)

- What jsondb.cloud CLI is (one paragraph)
- Installation methods (npm, Homebrew, binary)
- Authentication setup
- Core commands grouped by category (one-liner each)
- Link to llms-full.txt for complete docs

### `llms-full.txt` (complete, ~400-600 lines)

- Full installation + configuration (env vars, config file path, file format, precedence)
- Global flags
- Every command with: syntax, all flags/options, example usage, example response shapes
- Error handling patterns (exit codes, error response format)
- Common workflows (login -> create -> query -> export)
- Edge cases and tips (stdin input, format options, filter syntax)

## Content Sources

- `README.md` — command reference, install instructions
- `src/index.ts` — all commands, flags, options
- `src/lib/config.ts` — config file format, env vars, precedence
- `src/lib/client.ts` — API URL structure, headers
- `src/lib/output.ts` — output formats
- `src/commands/*.ts` — response handling, error patterns

## Non-Goals

- No REST API reference (CLI-focused)
- No contribution/development guide
- No changelog
