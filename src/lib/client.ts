import type { CliConfig } from "./config";

export class ApiClient {
  private config: CliConfig;
  public verbose = false;

  constructor(config: CliConfig) {
    this.config = config;
  }

  private log(msg: string): void {
    if (this.verbose) {
      console.error(`\x1b[2m[debug] ${msg}\x1b[0m`);
    }
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

  private async request(method: string, url: string, headers: Record<string, string>, body?: string): Promise<Response> {
    this.log(`${method} ${url}`);
    const res = await fetch(url, { method, headers, body });
    this.log(`${res.status} ${res.statusText}`);
    return res;
  }

  async get(path: string, accept?: string): Promise<Response> {
    const headers = this.headers(accept ? { Accept: accept } : undefined);
    return this.request("GET", this.url(path), headers);
  }

  async post(path: string, body?: unknown, extraHeaders?: Record<string, string>): Promise<Response> {
    return this.request("POST", this.url(path), this.headers(extraHeaders), body !== undefined ? JSON.stringify(body) : undefined);
  }

  async postRaw(path: string, body: string, contentType: string): Promise<Response> {
    return this.request("POST", this.url(path), {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": contentType,
    }, body);
  }

  async put(path: string, body: unknown): Promise<Response> {
    return this.request("PUT", this.url(path), this.headers(), JSON.stringify(body));
  }

  async patch(path: string, body: unknown, contentType?: string): Promise<Response> {
    return this.request("PATCH", this.url(path), this.headers(contentType ? { "Content-Type": contentType } : undefined), JSON.stringify(body));
  }

  async delete(path: string): Promise<Response> {
    return this.request("DELETE", this.url(path), this.headers());
  }

  /** Raw API call without project prefix */
  async rawGet(fullPath: string): Promise<Response> {
    const base = this.config.baseUrl.replace(/\/$/, "");
    return this.request("GET", `${base}${fullPath}`, this.headers());
  }
}
