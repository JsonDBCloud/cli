import { loginCommand } from "./login";

vi.mock("../lib/config", () => ({
  saveConfig: vi.fn(),
  getConfigPath: vi.fn(() => "/mock/.config/jsondb/credentials.json"),
}));

import { saveConfig, getConfigPath } from "../lib/config";

let logSpy: ReturnType<typeof vi.spyOn>;
let errorSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
    throw new Error("process.exit");
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("loginCommand", () => {
  it("saves config when valid API key is provided via options", async () => {
    await loginCommand({ apiKey: "jdb_sk_test_abc123" });

    expect(saveConfig).toHaveBeenCalledWith({
      apiKey: "jdb_sk_test_abc123",
      project: "v1",
      baseUrl: "https://api.jsondb.cloud",
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Project: v1"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(getConfigPath()));
  });

  it("exits with error for invalid API key format", async () => {
    await expect(loginCommand({ apiKey: "bad-key" })).rejects.toThrow("process.exit");

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Invalid API key format"));
    expect(saveConfig).not.toHaveBeenCalled();
  });

  it("uses custom project and baseUrl when provided", async () => {
    await loginCommand({
      apiKey: "jdb_sk_live_xyz789",
      project: "my-project",
      baseUrl: "https://custom.api.com",
    });

    expect(saveConfig).toHaveBeenCalledWith({
      apiKey: "jdb_sk_live_xyz789",
      project: "my-project",
      baseUrl: "https://custom.api.com",
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Project: my-project"));
  });
});
