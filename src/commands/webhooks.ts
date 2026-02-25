import { ApiClient } from "../lib/client";
import { success, error, printJson, printTable } from "../lib/output";

export async function listWebhooksCommand(collection: string, client: ApiClient): Promise<void> {
  const res = await client.get(`${collection}/_webhooks`);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to list webhooks: ${res.status}`);
    process.exit(1);
  }
  const data: any = await res.json();
  const webhooks = data.webhooks || data.data || data;

  if (Array.isArray(webhooks) && webhooks.length > 0) {
    printTable(
      ["ID", "URL", "Events", "Status"],
      webhooks.map((w: any) => [
        w._id || "",
        w.url || "",
        Array.isArray(w.events) ? w.events.join(", ") : "",
        w.status || "",
      ]),
    );
  } else {
    console.log("No webhooks found.");
  }
}

export async function createWebhookCommand(
  collection: string,
  client: ApiClient,
  options: { url: string; events: string; description?: string; secret?: string },
): Promise<void> {
  const events = options.events.split(",").map((e) => e.trim());
  const body: Record<string, unknown> = { url: options.url, events };
  if (options.description) body.description = options.description;
  if (options.secret) body.secret = options.secret;

  const res = await client.post(`${collection}/_webhooks`, body);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to create webhook: ${res.status}`);
    process.exit(1);
  }
  const webhook: any = await res.json();
  success(`Created webhook ${webhook._id}`);
  printJson(webhook);
}

export async function getWebhookCommand(collection: string, webhookId: string, client: ApiClient): Promise<void> {
  const res = await client.get(`${collection}/_webhooks/${webhookId}`);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to get webhook: ${res.status}`);
    process.exit(1);
  }
  const webhook = await res.json();
  printJson(webhook);
}

export async function updateWebhookCommand(
  collection: string,
  webhookId: string,
  client: ApiClient,
  options: { url?: string; events?: string; description?: string; status?: string },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (options.url) body.url = options.url;
  if (options.events) body.events = options.events.split(",").map((e) => e.trim());
  if (options.description) body.description = options.description;
  if (options.status) body.status = options.status;

  if (Object.keys(body).length === 0) {
    error("No update options provided. Use --url, --events, --description, or --status.");
    process.exit(1);
  }

  const res = await client.put(`${collection}/_webhooks/${webhookId}`, body);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to update webhook: ${res.status}`);
    process.exit(1);
  }
  const webhook = await res.json();
  success(`Updated webhook ${webhookId}`);
  printJson(webhook);
}

export async function deleteWebhookCommand(collection: string, webhookId: string, client: ApiClient): Promise<void> {
  const res = await client.delete(`${collection}/_webhooks/${webhookId}`);
  if (!res.ok && res.status !== 204) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to delete webhook: ${res.status}`);
    process.exit(1);
  }
  success(`Deleted webhook ${webhookId}`);
}

export async function testWebhookCommand(collection: string, webhookId: string, client: ApiClient): Promise<void> {
  const res = await client.post(`${collection}/_webhooks/${webhookId}/test`);
  if (!res.ok) {
    const data: any = await res.json().catch(() => ({}));
    error(data.error?.message || `Failed to test webhook: ${res.status}`);
    process.exit(1);
  }
  const result = await res.json();
  success(`Test event sent for webhook ${webhookId}`);
  printJson(result);
}
