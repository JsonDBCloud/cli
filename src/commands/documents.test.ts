import { ApiClient } from "../lib/client";
import type { CliConfig } from "../lib/config";
import { getCommand, deleteCommand, listCollectionsCommand, listDocumentsCommand } from "./documents";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

function mockResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const config: CliConfig = {
  apiKey: "test-api-key",
  project: "my-project",
  baseUrl: "https://api.example.com",
};

let client: ApiClient;
let logSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  client = new ApiClient(config);
  mockFetch.mockReset();
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getCommand", () => {
  it("fetches and prints a document", async () => {
    const doc = { _id: "abc", name: "test" };
    mockFetch.mockResolvedValue(mockResponse(doc));

    await getCommand("items/abc", client, {});

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/my-project/items/abc",
      expect.objectContaining({ method: "GET" }),
    );
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(doc));
  });

  it("exits with error on non-ok response", async () => {
    mockFetch.mockResolvedValue(mockResponse({ error: { message: "Not found" } }, 404));

    await expect(getCommand("items/missing", client, {})).rejects.toThrow("process.exit");

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Not found"));
  });
});

describe("deleteCommand", () => {
  it("sends DELETE and prints success", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteCommand("items/abc", client);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/my-project/items/abc",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Deleted items/abc"));
  });
});

describe("listCollectionsCommand", () => {
  it("lists sorted collection names from response", async () => {
    const data = {
      data: ["users", "posts", "animals"],
    };
    mockFetch.mockResolvedValue(mockResponse(data));

    await listCollectionsCommand(client);

    expect(logSpy).toHaveBeenCalledTimes(3);
    expect(logSpy).toHaveBeenNthCalledWith(1, "animals");
    expect(logSpy).toHaveBeenNthCalledWith(2, "posts");
    expect(logSpy).toHaveBeenNthCalledWith(3, "users");
  });
});

describe("listDocumentsCommand", () => {
  it("fetches with limit param and prints result", async () => {
    const data = { data: [{ _id: "1" }, { _id: "2" }] };
    mockFetch.mockResolvedValue(mockResponse(data));

    await listDocumentsCommand("items", client, { limit: "10" });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/my-project/items?limit=10",
      expect.objectContaining({ method: "GET" }),
    );
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(data));
  });
});
