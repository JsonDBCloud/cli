import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    globals: true,
    reporters: ["verbose", "junit"],
    outputFile: { junit: "test-results.xml" },
  },
});
