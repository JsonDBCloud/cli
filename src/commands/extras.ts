import * as fs from "fs";
import { ApiClient } from "../lib/client";
import { success, error, printJson } from "../lib/output";

function readInput(options: { file?: string }): unknown {
  let raw: string;

  if (options.file) {
    raw = fs.readFileSync(options.file, "utf-8");
  } else {
    const buf = fs.readFileSync(0, "utf-8");
    raw = buf;
  }

  return JSON.parse(raw);
}

export async function validateCommand(
  collection: string,
  client: ApiClient,
  options: { file?: string },
): Promise<void> {
  const body = readInput(options);

  const res = await client.post(`${collection}/_validate`, body);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    if (res.status === 422) {
      error("Validation failed");
      printJson(data);
      process.exit(1);
    }
    error(data.error?.message || `Validation request failed: ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  success("Document is valid");
  printJson(data);
}

export async function countCommand(
  collection: string,
  client: ApiClient,
  options: { filter?: string[] },
): Promise<void> {
  let query = `${collection}?count=true`;

  if (options.filter && options.filter.length > 0) {
    for (const f of options.filter) {
      const eqIndex = f.indexOf("=");
      if (eqIndex === -1) {
        error(`Invalid filter: ${f}. Use field=value or field[op]=value`);
        process.exit(1);
      }
      const key = f.slice(0, eqIndex);
      const value = f.slice(eqIndex + 1);
      query += `&filter[${key}]=${encodeURIComponent(value)}`;
    }
  }

  const res = await client.get(query);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Count failed: ${res.status}`);
    process.exit(1);
  }
  const data: any = await res.json();
  const count = data.count ?? data.meta?.total ?? data;
  console.log(String(count));
}

export async function bulkCommand(
  collection: string,
  client: ApiClient,
  options: { file?: string },
): Promise<void> {
  const body = readInput(options);

  if (!Array.isArray(body)) {
    error("Bulk operations must be a JSON array");
    process.exit(1);
  }

  const res = await client.post(`${collection}/_bulk`, body);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Bulk operation failed: ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  success(`Bulk operation completed`);
  printJson(data);
}
