import { ApiClient } from "./client";
import type { CliConfig } from "./config";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

const config: CliConfig = {
  apiKey: "test-api-key",
  project: "my-project",
  baseUrl: "https://api.example.com",
};

let client: ApiClient;

beforeEach(() => {
  client = new ApiClient(config);
  mockFetch.mockReset();
  mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
});

describe("URL construction", () => {
  it("builds URL with project prefix", async () => {
    await client.get("collections");
    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/my-project/collections", expect.anything());
  });

  it("strips trailing slash from baseUrl", async () => {
    const trailingSlashClient = new ApiClient({ ...config, baseUrl: "https://api.example.com/" });
    await trailingSlashClient.get("collections");
    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/my-project/collections", expect.anything());
  });
});

describe("Headers", () => {
  it("includes Authorization bearer token and Content-Type", async () => {
    await client.get("collections");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("merges Accept header when provided to get()", async () => {
    await client.get("collections", "text/csv");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
          "Content-Type": "application/json",
          Accept: "text/csv",
        }),
      }),
    );
  });
});

describe("HTTP methods", () => {
  it("GET sends correct method", async () => {
    await client.get("items");
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: "GET" }));
  });

  it("POST sends JSON body", async () => {
    const body = { name: "test" };
    await client.post("items", body);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      }),
    );
  });

  it("POST sends undefined body when no body provided", async () => {
    await client.post("items");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: undefined,
      }),
    );
  });

  it("postRaw sends raw body with custom content type", async () => {
    await client.postRaw("import", "col1,col2\na,b", "text/csv");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/my-project/import",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer test-api-key",
          "Content-Type": "text/csv",
        },
        body: "col1,col2\na,b",
      }),
    );
  });

  it("PUT sends JSON body", async () => {
    const body = { name: "updated" };
    await client.put("items/1", body);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(body),
      }),
    );
  });

  it("PATCH sends JSON body", async () => {
    const body = { name: "patched" };
    await client.patch("items/1", body);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    );
  });

  it("PATCH accepts custom content type that overrides default", async () => {
    const body = { op: "replace", path: "/name", value: "new" };
    await client.patch("items/1", body, "application/json-patch+json");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          "Content-Type": "application/json-patch+json",
        }),
      }),
    );
  });

  it("DELETE sends correct method", async () => {
    await client.delete("items/1");
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: "DELETE" }));
  });
});

describe("rawGet", () => {
  it("sends GET without project prefix", async () => {
    await client.rawGet("/health");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/health",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-api-key",
        }),
      }),
    );
  });
});
