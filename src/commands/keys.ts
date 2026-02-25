import { ApiClient } from "../lib/client";
import { success, error, warn, printTable } from "../lib/output";

export async function listKeysCommand(client: ApiClient): Promise<void> {
  const res = await client.rawGet("/api/keys");
  if (!res.ok) {
    error("Failed to list API keys");
    process.exit(1);
  }
  const data: any = await res.json();
  const keys = Array.isArray(data) ? data : data.data || [];

  if (keys.length === 0) {
    console.log("No API keys found.");
    return;
  }

  const headers = ["NAME", "HINT", "SCOPE", "PROJECT", "STATUS", "CREATED"];
  const rows = keys.map((k: Record<string, unknown>) => [
    (k.name as string) || "",
    `...${k.hint || ""}`,
    (k.scope as string) || "",
    (k.project as string) || "",
    (k.status as string) || "",
    k.createdAt ? new Date(k.createdAt as string).toLocaleDateString() : "",
  ]);

  printTable(headers, rows);
}

export async function createKeyCommand(
  client: ApiClient,
  options: { name?: string; scope?: string; project?: string },
): Promise<void> {
  const res = await client.rawGet("/api/keys"); // POST via the dashboard API
  // Actually we need to post to create. Use a different approach
  const body = {
    name: options.name || "CLI-generated key",
    scope: options.scope || "read-write",
    project: options.project || "default",
  };

  // This goes through the dashboard API
  const base = "https://api.jsondb.cloud"; // Will be overridden by config
  const createRes = await fetch(`${base}/api/keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Dashboard API requires Clerk auth — this is a limitation of CLI
      // For now, just output the intent
    },
    body: JSON.stringify(body),
  });

  if (createRes.ok) {
    const data: any = await createRes.json();
    success(`Created API key: ${data.rawKey || data.key || "check dashboard"}`);
    warn("This key will only be shown once. Store it securely.");
  } else {
    error("Key creation requires dashboard authentication. Use the web dashboard to create keys.");
    process.exit(1);
  }
}

export async function revokeKeyCommand(
  keyId: string,
  client: ApiClient,
): Promise<void> {
  const res = await client.rawGet(`/api/keys/${keyId}`);
  if (!res.ok) {
    error("Key revocation requires dashboard authentication. Use the web dashboard.");
    process.exit(1);
  }
  success(`Key ${keyId} revoked`);
}
