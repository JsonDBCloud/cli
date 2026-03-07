import { ApiClient } from "../lib/client";
import { success, error, printJson, printTable } from "../lib/output";

export async function listVersionsCommand(collection: string, docId: string, client: ApiClient): Promise<void> {
  const res = await client.get(`${collection}/${docId}/versions`);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to list versions: ${res.status}`);
    process.exit(1);
  }
  const data: any = await res.json();
  const versions = data.versions || data.data || data;

  if (Array.isArray(versions) && versions.length > 0) {
    printTable(
      ["Version", "Action", "Timestamp", "Size"],
      versions.map((v: any) => [
        String(v.version),
        v.action || "",
        v.timestamp || "",
        v.size != null ? String(v.size) : "",
      ]),
    );
  } else {
    console.log("No versions found.");
  }
}

export async function getVersionCommand(
  collection: string,
  docId: string,
  version: string,
  client: ApiClient,
): Promise<void> {
  const res = await client.get(`${collection}/${docId}/versions/${version}`);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to get version: ${res.status}`);
    process.exit(1);
  }
  const doc = await res.json();
  printJson(doc);
}

export async function diffVersionsCommand(
  collection: string,
  docId: string,
  client: ApiClient,
  options: { from: string; to: string },
): Promise<void> {
  if (!options.from || !options.to) {
    error("Both --from and --to version numbers are required");
    process.exit(1);
  }
  const res = await client.get(`${collection}/${docId}/versions/diff?from=${options.from}&to=${options.to}`);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to diff versions: ${res.status}`);
    process.exit(1);
  }
  const diff = await res.json();
  printJson(diff);
}

export async function restoreVersionCommand(
  collection: string,
  docId: string,
  version: string,
  client: ApiClient,
): Promise<void> {
  const res = await client.post(`${collection}/${docId}/versions/${version}/restore`);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to restore version: ${res.status}`);
    process.exit(1);
  }
  const doc = await res.json();
  success(`Restored ${docId} to version ${version}`);
  printJson(doc);
}
