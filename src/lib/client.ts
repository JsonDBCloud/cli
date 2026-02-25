import type { CliConfig } from "./config";

export class ApiClient {
  private config: CliConfig;

  constructor(config: CliConfig) {
    this.config = config;
  }

  private url(path: string): string {
    const base = this.config.baseUrl.replace(/\/$/, "");
    return `${base}/${this.config.project}/${path}`;
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
      ...extra,
    };
  }

  async get(path: string, accept?: string): Promise<Response> {
    const headers = this.headers(accept ? { Accept: accept } : undefined);
    return fetch(this.url(path), { method: "GET", headers });
  }

  async post(path: string, body?: unknown, extraHeaders?: Record<string, string>): Promise<Response> {
    return fetch(this.url(path), {
      method: "POST",
      headers: this.headers(extraHeaders),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async postRaw(path: string, body: string, contentType: string): Promise<Response> {
    return fetch(this.url(path), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": contentType,
      },
      body,
    });
  }

  async put(path: string, body: unknown): Promise<Response> {
    return fetch(this.url(path), {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
  }

  async patch(path: string, body: unknown, contentType?: string): Promise<Response> {
    return fetch(this.url(path), {
      method: "PATCH",
      headers: this.headers(contentType ? { "Content-Type": contentType } : undefined),
      body: JSON.stringify(body),
    });
  }

  async delete(path: string): Promise<Response> {
    return fetch(this.url(path), {
      method: "DELETE",
      headers: this.headers(),
    });
  }

  /** Raw API call without project prefix */
  async rawGet(fullPath: string): Promise<Response> {
    const base = this.config.baseUrl.replace(/\/$/, "");
    return fetch(`${base}${fullPath}`, {
      method: "GET",
      headers: this.headers(),
    });
  }
}
