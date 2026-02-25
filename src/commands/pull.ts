import * as fs from "fs";
import { ApiClient } from "../lib/client";
import { success, error } from "../lib/output";

export async function pullCommand(
  collection: string,
  client: ApiClient,
  options: { out?: string; format?: string; filter?: string },
): Promise<void> {
  const format = options.format || "json";
  let accept = "application/json";
  if (format === "csv") accept = "text/csv";
  else if (format === "ndjson") accept = "application/x-ndjson";

  let path = `${collection}/_export`;
  if (options.filter) {
    // Parse simple filter: "field=value"
    const parts = options.filter.split("=");
    if (parts.length === 2) {
      path += `?filter[${parts[0]}]=${encodeURIComponent(parts[1])}`;
    }
  }

  const res = await client.get(path, accept);

  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Export failed with status ${res.status}`);
    process.exit(1);
  }

  const content = await res.text();

  if (options.out) {
    fs.writeFileSync(options.out, content, "utf-8");
    // Count documents
    let count = 0;
    if (format === "json") {
      try {
        count = JSON.parse(content).length;
      } catch {
        count = 0;
      }
    } else if (format === "ndjson") {
      count = content.split("\n").filter((l) => l.trim()).length;
    } else {
      count = content.split("\n").filter((l) => l.trim()).length - 1; // exclude header
    }
    success(`Exported ${count} documents to ${options.out}`);
  } else {
    // Output to stdout
    process.stdout.write(content);
    if (!content.endsWith("\n")) process.stdout.write("\n");
  }
}
