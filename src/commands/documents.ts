import * as fs from "fs";
import { ApiClient } from "../lib/client";
import { success, error, printJson } from "../lib/output";

export async function getCommand(path: string, client: ApiClient, options: { format?: string }): Promise<void> {
  // path = "collection/docId"
  const res = await client.get(path);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Request failed with status ${res.status}`);
    process.exit(1);
  }
  const doc = await res.json();
  printJson(doc, options.format === "raw");
}

export async function createCommand(
  collection: string,
  client: ApiClient,
  options: { file?: string; id?: string },
): Promise<void> {
  let body: unknown;

  if (options.file) {
    const content = fs.readFileSync(options.file, "utf-8");
    body = JSON.parse(content);
  } else {
    // Read from stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  }

  const path = options.id ? `${collection}/${options.id}` : collection;
  const res = await client.post(path, body);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Create failed with status ${res.status}`);
    process.exit(1);
  }
  const doc: any = await res.json();
  success(`Created ${doc._id} in ${collection}`);
}

export async function updateCommand(path: string, client: ApiClient, options: { file?: string }): Promise<void> {
  let body: unknown;

  if (options.file) {
    const content = fs.readFileSync(options.file, "utf-8");
    body = JSON.parse(content);
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  }

  const res = await client.put(path, body);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Update failed with status ${res.status}`);
    process.exit(1);
  }
  const doc: any = await res.json();
  success(`Updated ${doc._id}`);
}

export async function patchCommand(path: string, client: ApiClient, options: { file?: string }): Promise<void> {
  let body: unknown;

  if (options.file) {
    const content = fs.readFileSync(options.file, "utf-8");
    body = JSON.parse(content);
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf-8"));
  }

  const res = await client.patch(path, body);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Patch failed with status ${res.status}`);
    process.exit(1);
  }
  const doc: any = await res.json();
  success(`Patched ${doc._id}`);
}

export async function deleteCommand(path: string, client: ApiClient): Promise<void> {
  const res = await client.delete(path);
  if (!res.ok && res.status !== 204) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Delete failed with status ${res.status}`);
    process.exit(1);
  }
  success(`Deleted ${path}`);
}

export async function listCollectionsCommand(client: ApiClient): Promise<void> {
  // List documents and extract unique collection names
  const res = await client.get("?limit=100");
  if (!res.ok) {
    error("Failed to list collections");
    process.exit(1);
  }
  const data: any = await res.json();
  const collections = new Set<string>();
  for (const doc of data.data || []) {
    if (doc.$collection) collections.add(doc.$collection);
  }
  for (const coll of Array.from(collections).sort()) {
    console.log(coll);
  }
}

export async function listDocumentsCommand(
  collection: string,
  client: ApiClient,
  options: { limit?: string; format?: string },
): Promise<void> {
  const limit = options.limit || "20";
  const res = await client.get(`${collection}?limit=${limit}`);
  if (!res.ok) {
    error("Failed to list documents");
    process.exit(1);
  }
  const data = await res.json();
  if (options.format === "raw") {
    printJson(data, true);
  } else {
    printJson(data);
  }
}
