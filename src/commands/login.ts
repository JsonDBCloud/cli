import * as readline from "readline";
import { saveConfig, getConfigPath } from "../lib/config";
import { success, error } from "../lib/output";

export async function loginCommand(options: { apiKey?: string; project?: string; baseUrl?: string }): Promise<void> {
  let apiKey = options.apiKey || "";

  if (!apiKey) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    apiKey = await new Promise<string>((resolve) => {
      rl.question("? Enter your API key: ", (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  if (!apiKey || !apiKey.startsWith("jdb_sk_")) {
    error("Invalid API key format", "API keys start with 'jdb_sk_live_' or 'jdb_sk_test_'");
    process.exit(1);
  }

  const config = {
    apiKey,
    project: options.project || "v1",
    baseUrl: options.baseUrl || "https://api.jsondb.cloud",
  };

  saveConfig(config);
  success(`Authenticated successfully`);
  console.log(`  Project: ${config.project}`);
  console.log(`  Key stored in ${getConfigPath()}`);
}
