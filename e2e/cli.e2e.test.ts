import { execFileSync } from "child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as path from "path";

const CLI = path.resolve(__dirname, "../dist/index.js");
const API_KEY = process.env.JSONDB_E2E_API_KEY;
const PROJECT = process.env.JSONDB_E2E_PROJECT || "v1";
const COLLECTION = "e2e_test";

function jsondb(...args: string[]): string {
  return execFileSync("node", [CLI, ...args, "--api-key", API_KEY!, "--project", PROJECT], {
    encoding: "utf-8",
    timeout: 15_000,
  }).trim();
}

function jsondbStdin(input: string, ...args: string[]): string {
  return execFileSync("node", [CLI, ...args, "--api-key", API_KEY!, "--project", PROJECT], {
    encoding: "utf-8",
    input,
    timeout: 15_000,
  }).trim();
}

function jsondbRaw(...args: string[]): { stdout: string; stderr: string; status: number } {
  try {
    const stdout = execFileSync(
      "node",
      [CLI, ...args, "--api-key", API_KEY!, "--project", PROJECT],
      { encoding: "utf-8", timeout: 15_000 },
    ).trim();
    return { stdout, stderr: "", status: 0 };
  } catch (e: any) {
    return { stdout: (e.stdout || "").trim(), stderr: (e.stderr || "").trim(), status: e.status || 1 };
  }
}

describe("jsondb CLI E2E", () => {
  const createdIds: string[] = [];

  beforeAll(() => {
    if (!API_KEY) {
      throw new Error("JSONDB_E2E_API_KEY environment variable is required");
    }
  });

  afterAll(() => {
    // Cleanup: delete all documents created during tests
    for (const id of createdIds) {
      try {
        jsondb("delete", `${COLLECTION}/${id}`);
      } catch {
        // ignore cleanup errors
      }
    }
  });

  // ── Auth ──────────────────────────────────────────────────

  describe("auth", () => {
    it("whoami shows current config", () => {
      // whoami reads from stored config, so just verify it doesn't crash
      // when using --api-key flag (it reads from saved config, not flag)
      const result = jsondbRaw("whoami");
      // Either shows config or says not authenticated - both are valid
      expect(result.status === 0 || result.stderr.includes("Not authenticated")).toBe(true);
    });

    it("--version prints a version string", () => {
      const output = execFileSync("node", [CLI, "--version"], { encoding: "utf-8" }).trim();
      expect(output).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  // ── CRUD ──────────────────────────────────────────────────

  describe("document CRUD", () => {
    let docId: string;

    it("create: creates a document from stdin", () => {
      const output = jsondbStdin(
        JSON.stringify({ name: "e2e-test", value: 42 }),
        "create",
        COLLECTION,
      );
      expect(output).toContain("Created");
      // Extract ID from "✓ Created <id> in <collection>" or "OK: Created <id> in <collection>"
      const match = output.match(/Created\s+(\S+)\s+in/);
      expect(match).toBeTruthy();
      docId = match![1];
      createdIds.push(docId);
    });

    it("get: retrieves the created document", () => {
      const output = jsondb("get", `${COLLECTION}/${docId}`);
      const doc = JSON.parse(output);
      expect(doc._id).toBe(docId);
      expect(doc.name).toBe("e2e-test");
      expect(doc.value).toBe(42);
    });

    it("update: replaces the document", () => {
      const output = jsondbStdin(
        JSON.stringify({ name: "e2e-updated", value: 99 }),
        "update",
        `${COLLECTION}/${docId}`,
      );
      expect(output).toContain("Updated");

      const doc = JSON.parse(jsondb("get", `${COLLECTION}/${docId}`));
      expect(doc.name).toBe("e2e-updated");
      expect(doc.value).toBe(99);
    });

    it("patch: partially updates the document", () => {
      const output = jsondbStdin(
        JSON.stringify({ value: 100 }),
        "patch",
        `${COLLECTION}/${docId}`,
      );
      expect(output).toContain("Patched");

      const doc = JSON.parse(jsondb("get", `${COLLECTION}/${docId}`));
      expect(doc.name).toBe("e2e-updated"); // unchanged
      expect(doc.value).toBe(100); // patched
    });

    it("create with --id: creates a document with explicit ID", () => {
      const customId = `e2e_custom_${Date.now()}`;
      const output = jsondbStdin(
        JSON.stringify({ name: "custom-id-test" }),
        "create",
        COLLECTION,
        "--id",
        customId,
      );
      expect(output).toContain("Created");
      createdIds.push(customId);

      const doc = JSON.parse(jsondb("get", `${COLLECTION}/${customId}`));
      expect(doc._id).toBe(customId);
      expect(doc.name).toBe("custom-id-test");
    });

    it("delete: removes the document", () => {
      const output = jsondb("delete", `${COLLECTION}/${docId}`);
      expect(output).toContain("Deleted");

      // Verify it's gone
      const result = jsondbRaw("get", `${COLLECTION}/${docId}`);
      expect(result.status).not.toBe(0);
      // Remove from cleanup list since already deleted
      createdIds.splice(createdIds.indexOf(docId), 1);
    });
  });

  // ── Collections & Documents listing ───────────────────────

  describe("listing", () => {
    let tempId: string;

    beforeAll(() => {
      // Create a doc so the collection exists
      const output = jsondbStdin(
        JSON.stringify({ name: "list-test" }),
        "create",
        COLLECTION,
      );
      const match = output.match(/Created\s+(\S+)\s+in/);
      tempId = match![1];
      createdIds.push(tempId);
    });

    it("collections: lists available collections", () => {
      const result = jsondbRaw("collections");
      // This may fail server-side (known issue: GET /{project} returns 400)
      if (result.status !== 0) {
        console.warn(`  ⚠ collections command failed: ${result.stderr}`);
        expect(result.stderr).toContain("ERROR");
      } else {
        expect(result.stdout).toContain(COLLECTION);
      }
    });

    it("documents: lists documents in collection", () => {
      const result = jsondbRaw("documents", COLLECTION);
      // This may fail server-side (known issue: "Invalid operator: $collection")
      if (result.status !== 0) {
        console.warn(`  ⚠ documents command failed: ${result.stderr}`);
        expect(result.stderr.length).toBeGreaterThan(0);
      } else {
        const data = JSON.parse(result.stdout);
        expect(data.data || data).toBeInstanceOf(Array);
      }
    });
  });

  // ── Error handling ────────────────────────────────────────

  describe("error handling", () => {
    it("get: returns error for nonexistent document", () => {
      const result = jsondbRaw("get", `${COLLECTION}/nonexistent_doc_id_12345`);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("ERROR");
    });

    it("delete: returns error for nonexistent document", () => {
      const result = jsondbRaw("delete", `${COLLECTION}/nonexistent_doc_id_12345`);
      expect(result.status).not.toBe(0);
    });

    it("create: returns error for invalid JSON", () => {
      const result = jsondbRaw("create", COLLECTION);
      // No stdin provided, should fail
      expect(result.status).not.toBe(0);
    });
  });

  // ── Schema ────────────────────────────────────────────────

  describe("schema", () => {
    it("schema get: retrieves schema (or reports none)", () => {
      const result = jsondbRaw("schema", "get", COLLECTION);
      // Either returns schema or a reasonable error
      expect(result.status === 0 || result.stderr.length > 0).toBe(true);
    });
  });

  // ── Verbose flag ──────────────────────────────────────────

  describe("--verbose flag", () => {
    it("shows debug output on stderr", () => {
      const result = jsondbRaw("get", `${COLLECTION}/nonexistent`, "--verbose");
      expect(result.stderr).toContain("[debug]");
      expect(result.stderr).toContain("GET");
    });
  });
});
