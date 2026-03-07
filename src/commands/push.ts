import * as fs from "fs";
import * as path from "path";
import { ApiClient } from "../lib/client";
import { success, error, warn } from "../lib/output";

export async function pushCommand(
  file: string,
  client: ApiClient,
  options: { to?: string; onConflict?: string },
): Promise<void> {
  if (!fs.existsSync(file)) {
    error(`File not found: ${file}`);
    process.exit(1);
  }

  const collection = options.to || path.basename(file, path.extname(file));
  const content = fs.readFileSync(file, "utf-8");
  const ext = path.extname(file).toLowerCase();

  let contentType = "application/json";
  if (ext === ".csv") contentType = "text/csv";
  else if (ext === ".ndjson") contentType = "application/x-ndjson";

  const onConflict = options.onConflict || "fail";
  const url = `${collection}/_import?onConflict=${onConflict}`;

  const isTTY = process.stdout.isTTY;
  if (isTTY) {
    console.log(`Importing to ${collection}...`);
  }

  const res = await client.postRaw(url, content, contentType);

  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Import failed with status ${res.status}`);
    process.exit(1);
  }

  const result: any = await res.json();
  const summary = result.summary;

  success(
    `Imported ${summary.total} documents (${summary.created} created, ${summary.skipped || 0} skipped, ${summary.failed || 0} failed, ${summary.overwritten || 0} overwritten)`,
  );

  if (result.errors && result.errors.length > 0) {
    warn(`${result.errors.length} errors:`);
    for (const e of result.errors.slice(0, 10)) {
      console.log(`  - Index ${e.index}: ${e.error.message}`);
    }
    if (result.errors.length > 10) {
      console.log(`  ... and ${result.errors.length - 10} more`);
    }
  }
}
