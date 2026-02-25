import { Command } from "commander";
import { loadConfig, clearConfig } from "./lib/config";
import { ApiClient } from "./lib/client";
import { error, success } from "./lib/output";
import { version as pkgVersion } from "../package.json";
import { loginCommand } from "./commands/login";
import {
  getCommand,
  createCommand,
  updateCommand,
  patchCommand,
  deleteCommand,
  listCollectionsCommand,
  listDocumentsCommand,
} from "./commands/documents";
import { pushCommand } from "./commands/push";
import { pullCommand } from "./commands/pull";
import { listKeysCommand } from "./commands/keys";
import { getSchemaCommand, setSchemaCommand, removeSchemaCommand } from "./commands/schema";
import {
  listVersionsCommand,
  getVersionCommand,
  diffVersionsCommand,
  restoreVersionCommand,
} from "./commands/versions";
import {
  listWebhooksCommand,
  createWebhookCommand,
  getWebhookCommand,
  updateWebhookCommand,
  deleteWebhookCommand,
  testWebhookCommand,
} from "./commands/webhooks";
import { validateCommand, countCommand, bulkCommand } from "./commands/extras";

const program = new Command();

program
  .name("jsondb")
  .description("The jsondb.cloud CLI — manage your JSON database from the terminal")
  .version(pkgVersion)
  .option("--api-key <key>", "Use a specific API key")
  .option("--project <ns>", 'Target project (default: "default")')
  .option("--base-url <url>", "API base URL")
  .option("--format <fmt>", "Output format: json, raw, ndjson, table")
  .option("--verbose", "Show debug info (request URLs, status codes)");

function getClient(): ApiClient {
  const opts = program.opts();
  const config = loadConfig();

  const apiKey = opts.apiKey || config?.apiKey;
  if (!apiKey) {
    error("Not authenticated", "Run `jsondb login` to authenticate, or pass --api-key");
    process.exit(1);
  }

  const client = new ApiClient({
    apiKey,
    project: opts.project || config?.project || "default",
    baseUrl: opts.baseUrl || config?.baseUrl || "https://api.jsondb.cloud",
  });
  if (opts.verbose) client.verbose = true;
  return client;
}

// ─── Auth commands ───

program
  .command("login")
  .description("Authenticate with jsondb.cloud")
  .option("--api-key <key>", "API key to use")
  .option("--project <ns>", "Default project")
  .option("--base-url <url>", "API base URL")
  .action(async (opts) => {
    await loginCommand(opts);
  });

program
  .command("logout")
  .description("Remove stored credentials")
  .action(() => {
    clearConfig();
    success("Logged out. Credentials removed.");
  });

program
  .command("whoami")
  .description("Show current configuration")
  .action(() => {
    const config = loadConfig();
    if (!config) {
      error("Not authenticated", "Run `jsondb login` to authenticate");
      process.exit(1);
    }
    console.log(`  API Key: ${config.apiKey.slice(0, 16)}...${config.apiKey.slice(-4)}`);
    console.log(`  Project: ${config.project}`);
    console.log(`  Base URL: ${config.baseUrl}`);
  });

// ─── Document commands ───

program
  .command("get <path>")
  .description("Read a document (e.g., users/usr_abc123)")
  .option("--format <fmt>", "Output format: json, raw")
  .action(async (path, opts) => {
    await getCommand(path, getClient(), opts);
  });

program
  .command("create <collection>")
  .description("Create a document from stdin or file")
  .option("--file <file>", "Read document from file")
  .option("--id <id>", "Explicit document ID")
  .action(async (collection, opts) => {
    await createCommand(collection, getClient(), opts);
  });

program
  .command("update <path>")
  .description("Replace a document (e.g., users/usr_abc123)")
  .option("--file <file>", "Read document from file")
  .action(async (path, opts) => {
    await updateCommand(path, getClient(), opts);
  });

program
  .command("patch <path>")
  .description("Partial update a document")
  .option("--file <file>", "Read patch from file")
  .action(async (path, opts) => {
    await patchCommand(path, getClient(), opts);
  });

program
  .command("delete <path>")
  .description("Delete a document")
  .action(async (path) => {
    await deleteCommand(path, getClient());
  });

// ─── Collection commands ───

program
  .command("collections")
  .description("List collections in the project")
  .action(async () => {
    await listCollectionsCommand(getClient());
  });

program
  .command("documents <collection>")
  .description("List documents in a collection")
  .option("--limit <n>", "Max documents to show")
  .option("--format <fmt>", "Output format: json, raw")
  .action(async (collection, opts) => {
    await listDocumentsCommand(collection, getClient(), opts);
  });

// ─── Import / Export ───

program
  .command("push <file>")
  .description("Import documents from JSON/CSV/NDJSON file")
  .requiredOption("--to <collection>", "Target collection")
  .option("--on-conflict <strategy>", "Conflict strategy: fail, skip, overwrite", "fail")
  .action(async (file, opts) => {
    await pushCommand(file, getClient(), opts);
  });

program
  .command("pull <collection>")
  .description("Export documents to stdout or file")
  .option("--out <file>", "Output file path")
  .option("--format <fmt>", "Format: json, csv, ndjson", "json")
  .option("--filter <expr>", "Filter expression (field=value)")
  .action(async (collection, opts) => {
    await pullCommand(collection, getClient(), opts);
  });

// ─── Key management ───

const keys = program.command("keys").description("Manage API keys");

keys
  .command("list")
  .description("List API keys")
  .action(async () => {
    await listKeysCommand(getClient());
  });

keys
  .command("create")
  .description("Create a new API key")
  .option("--name <name>", "Key name")
  .option("--scope <scope>", "Scope: read-only, read-write", "read-write")
  .option("--project <ns>", "Target project")
  .action(async (_opts) => {
    error(
      "Key creation requires dashboard authentication. Use the web dashboard at https://jsondb.cloud/dashboard/api-keys",
    );
    process.exit(1);
  });

keys
  .command("revoke <id>")
  .description("Revoke an API key")
  .action(async (_id) => {
    error(
      "Key revocation requires dashboard authentication. Use the web dashboard at https://jsondb.cloud/dashboard/api-keys",
    );
    process.exit(1);
  });

// ─── Schema ───

const schema = program.command("schema").description("Manage collection schemas");

schema
  .command("get <collection>")
  .description("Get collection schema")
  .action(async (collection) => {
    await getSchemaCommand(collection, getClient());
  });

schema
  .command("set <collection>")
  .description("Set collection schema from file or stdin")
  .option("--file <file>", "Schema JSON file")
  .action(async (collection, opts) => {
    await setSchemaCommand(collection, getClient(), opts);
  });

schema
  .command("remove <collection>")
  .description("Remove collection schema")
  .action(async (collection) => {
    await removeSchemaCommand(collection, getClient());
  });

// ─── Versions ───

const versions = program.command("versions").description("Manage document version history");

versions
  .command("list <collection> <id>")
  .description("List versions of a document")
  .action(async (collection, id) => {
    await listVersionsCommand(collection, id, getClient());
  });

versions
  .command("get <collection> <id> <version>")
  .description("Get a document at a specific version")
  .action(async (collection, id, version) => {
    await getVersionCommand(collection, id, version, getClient());
  });

versions
  .command("diff <collection> <id>")
  .description("Diff two versions of a document")
  .requiredOption("--from <version>", "From version number")
  .requiredOption("--to <version>", "To version number")
  .action(async (collection, id, opts) => {
    await diffVersionsCommand(collection, id, getClient(), opts);
  });

versions
  .command("restore <collection> <id> <version>")
  .description("Restore a document to a specific version")
  .action(async (collection, id, version) => {
    await restoreVersionCommand(collection, id, version, getClient());
  });

// ─── Webhooks ───

const webhooks = program.command("webhooks").description("Manage collection webhooks");

webhooks
  .command("list <collection>")
  .description("List webhooks for a collection")
  .action(async (collection) => {
    await listWebhooksCommand(collection, getClient());
  });

webhooks
  .command("create <collection>")
  .description("Create a webhook")
  .requiredOption("--url <url>", "Webhook endpoint URL")
  .requiredOption("--events <events>", "Comma-separated events (document.created,document.updated,document.deleted)")
  .option("--description <desc>", "Webhook description")
  .option("--secret <secret>", "HMAC signing secret")
  .action(async (collection, opts) => {
    await createWebhookCommand(collection, getClient(), opts);
  });

webhooks
  .command("get <collection> <id>")
  .description("Get webhook details and recent deliveries")
  .action(async (collection, id) => {
    await getWebhookCommand(collection, id, getClient());
  });

webhooks
  .command("update <collection> <id>")
  .description("Update a webhook")
  .option("--url <url>", "New endpoint URL")
  .option("--events <events>", "New comma-separated events")
  .option("--description <desc>", "New description")
  .option("--status <status>", "Status: active or disabled")
  .action(async (collection, id, opts) => {
    await updateWebhookCommand(collection, id, getClient(), opts);
  });

webhooks
  .command("delete <collection> <id>")
  .description("Delete a webhook")
  .action(async (collection, id) => {
    await deleteWebhookCommand(collection, id, getClient());
  });

webhooks
  .command("test <collection> <id>")
  .description("Send a test event to a webhook")
  .action(async (collection, id) => {
    await testWebhookCommand(collection, id, getClient());
  });

// ─── Validate / Count / Bulk ───

program
  .command("validate <collection>")
  .description("Dry-run schema validation against a document")
  .option("--file <file>", "Read document from file (otherwise reads stdin)")
  .action(async (collection, opts) => {
    await validateCommand(collection, getClient(), opts);
  });

program
  .command("count <collection>")
  .description("Count documents in a collection")
  .option("--filter <expr...>", "Filter expressions (field=value)")
  .action(async (collection, opts) => {
    await countCommand(collection, getClient(), opts);
  });

program
  .command("bulk <collection>")
  .description("Execute bulk operations from stdin or file")
  .option("--file <file>", "Read operations from file (otherwise reads stdin)")
  .action(async (collection, opts) => {
    await bulkCommand(collection, getClient(), opts);
  });

// Parse and execute
program.parse();
