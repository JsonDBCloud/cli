import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export interface CliConfig {
  apiKey: string;
  project: string;
  baseUrl: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".config", "jsondb");
const CONFIG_FILE = path.join(CONFIG_DIR, "credentials.json");

export function loadConfig(): CliConfig | null {
  // Environment variable takes precedence
  const envKey = process.env.JSONDB_API_KEY;
  if (envKey) {
    return {
      apiKey: envKey,
      project: process.env.JSONDB_PROJECT || process.env.JSONDB_NAMESPACE || "v1",
      baseUrl: process.env.JSONDB_BASE_URL || "https://api.jsondb.cloud",
    };
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(data) as CliConfig;
  } catch {
    return null;
  }
}

export function saveConfig(config: CliConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function clearConfig(): void {
  try {
    fs.unlinkSync(CONFIG_FILE);
  } catch {
    // File doesn't exist
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
