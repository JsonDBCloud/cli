import * as fs from "fs";
import { ApiClient } from "../lib/client";
import { success, error, printJson } from "../lib/output";

export async function getSchemaCommand(collection: string, client: ApiClient): Promise<void> {
  const res = await client.get(`${collection}/_schema`);
  if (!res.ok) {
    if (res.status === 404) {
      console.log(`No schema set for collection '${collection}'`);
      return;
    }
    error(`Failed to get schema: ${res.status}`);
    process.exit(1);
  }
  const data: any = await res.json();
  printJson(data.schema || data);
}

export async function setSchemaCommand(
  collection: string,
  client: ApiClient,
  options: { file?: string },
): Promise<void> {
  let schema: unknown;

  if (options.file) {
    const content = fs.readFileSync(options.file, "utf-8");
    schema = JSON.parse(content);
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    schema = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  }

  const res = await client.put(`${collection}/_schema`, schema);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to set schema: ${res.status}`);
    process.exit(1);
  }
  success(`Schema set for collection '${collection}'`);
}

export async function removeSchemaCommand(collection: string, client: ApiClient): Promise<void> {
  const res = await client.delete(`${collection}/_schema`);
  if (!res.ok) {
    error(`Failed to remove schema: ${res.status}`);
    process.exit(1);
  }
  success(`Schema removed from collection '${collection}'`);
}
