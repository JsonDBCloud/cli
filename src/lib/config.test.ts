import * as path from "path";

vi.mock("fs");
vi.mock("os", async (importOriginal) => {
  const actual = await importOriginal<typeof import("os")>();
  return {
    ...actual,
    homedir: () => "/mock-home",
  };
});

import * as fs from "fs";
import { loadConfig, saveConfig, clearConfig, getConfigPath } from "./config";

const EXPECTED_DIR = path.join("/mock-home", ".config", "jsondb");
const EXPECTED_FILE = path.join(EXPECTED_DIR, "credentials.json");

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.JSONDB_API_KEY;
  delete process.env.JSONDB_PROJECT;
  delete process.env.JSONDB_NAMESPACE;
  delete process.env.JSONDB_BASE_URL;
});

describe("getConfigPath", () => {
  it("returns path under ~/.config/jsondb", () => {
    expect(getConfigPath()).toBe(EXPECTED_FILE);
  });
});

describe("loadConfig", () => {
  describe("with env vars", () => {
    it("returns config from JSONDB_API_KEY with defaults", () => {
      process.env.JSONDB_API_KEY = "test-key";

      const config = loadConfig();

      expect(config).toEqual({
        apiKey: "test-key",
        project: "v1",
        baseUrl: "https://api.jsondb.cloud",
      });
    });

    it("uses JSONDB_PROJECT if set", () => {
      process.env.JSONDB_API_KEY = "test-key";
      process.env.JSONDB_PROJECT = "my-project";

      const config = loadConfig();

      expect(config).toEqual({
        apiKey: "test-key",
        project: "my-project",
        baseUrl: "https://api.jsondb.cloud",
      });
    });

    it("falls back to JSONDB_NAMESPACE", () => {
      process.env.JSONDB_API_KEY = "test-key";
      process.env.JSONDB_NAMESPACE = "my-namespace";

      const config = loadConfig();

      expect(config).toEqual({
        apiKey: "test-key",
        project: "my-namespace",
        baseUrl: "https://api.jsondb.cloud",
      });
    });

    it("uses JSONDB_BASE_URL if set", () => {
      process.env.JSONDB_API_KEY = "test-key";
      process.env.JSONDB_BASE_URL = "http://localhost:3000";

      const config = loadConfig();

      expect(config).toEqual({
        apiKey: "test-key",
        project: "v1",
        baseUrl: "http://localhost:3000",
      });
    });
  });

  describe("without env vars", () => {
    it("reads from credentials file", () => {
      const fileConfig = { apiKey: "file-key", project: "file-proj", baseUrl: "https://example.com" };
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(fileConfig));

      const config = loadConfig();

      expect(fs.readFileSync).toHaveBeenCalledWith(EXPECTED_FILE, "utf-8");
      expect(config).toEqual(fileConfig);
    });

    it("returns null if credentials file does not exist", () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error("ENOENT");
      });

      const config = loadConfig();

      expect(config).toBeNull();
    });
  });
});

describe("saveConfig", () => {
  it("creates directory if missing and writes with 0o600 permissions", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockReturnValue(undefined);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

    const config = { apiKey: "key", project: "proj", baseUrl: "https://api.jsondb.cloud" };
    saveConfig(config);

    expect(fs.existsSync).toHaveBeenCalledWith(EXPECTED_DIR);
    expect(fs.mkdirSync).toHaveBeenCalledWith(EXPECTED_DIR, { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(EXPECTED_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
  });

  it("skips mkdir if directory already exists", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.writeFileSync).mockReturnValue(undefined);

    const config = { apiKey: "key", project: "proj", baseUrl: "https://api.jsondb.cloud" };
    saveConfig(config);

    expect(fs.existsSync).toHaveBeenCalledWith(EXPECTED_DIR);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(EXPECTED_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
  });
});

describe("clearConfig", () => {
  it("deletes the credentials file", () => {
    vi.mocked(fs.unlinkSync).mockReturnValue(undefined);

    clearConfig();

    expect(fs.unlinkSync).toHaveBeenCalledWith(EXPECTED_FILE);
  });

  it("does not throw if file is missing", () => {
    vi.mocked(fs.unlinkSync).mockImplementation(() => {
      throw new Error("ENOENT");
    });

    expect(() => clearConfig()).not.toThrow();
  });
});
