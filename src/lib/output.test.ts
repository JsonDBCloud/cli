import { success, error, warn, printJson, printTable } from "./output.js";

describe("output (non-TTY)", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("success", () => {
    it('prints "OK: " prefix in non-TTY mode', () => {
      success("created");
      expect(logSpy).toHaveBeenCalledWith("OK: created");
    });
  });

  describe("error", () => {
    it('prints "ERROR: " prefix', () => {
      error("not found");
      expect(errorSpy).toHaveBeenCalledWith("ERROR: not found");
    });

    it("prints suggestion on second line", () => {
      error("not found", "try again");
      expect(errorSpy).toHaveBeenCalledWith("ERROR: not found");
      expect(errorSpy).toHaveBeenCalledWith("try again");
    });
  });

  describe("warn", () => {
    it('prints "WARN: " prefix', () => {
      warn("deprecated");
      expect(logSpy).toHaveBeenCalledWith("WARN: deprecated");
    });
  });

  describe("printJson", () => {
    it("prints compact JSON in non-TTY mode", () => {
      printJson({ a: 1, b: [2, 3] });
      expect(logSpy).toHaveBeenCalledWith('{"a":1,"b":[2,3]}');
    });

    it("prints compact JSON when raw=true", () => {
      printJson({ x: "y" }, true);
      expect(logSpy).toHaveBeenCalledWith('{"x":"y"}');
    });
  });

  describe("printTable", () => {
    it("prints headers, separator, and rows with padding", () => {
      const headers = ["Name", "Age"];
      const rows = [
        ["Alice", "30"],
        ["Bob", "25"],
      ];

      printTable(headers, rows);

      expect(logSpy).toHaveBeenCalledTimes(4); // header + sep + 2 rows
      expect(logSpy).toHaveBeenNthCalledWith(1, "Name   Age");
      expect(logSpy).toHaveBeenNthCalledWith(2, "-----  ---");
      expect(logSpy).toHaveBeenNthCalledWith(3, "Alice  30 ");
      expect(logSpy).toHaveBeenNthCalledWith(4, "Bob    25 ");
    });

    it("pads columns to the widest value", () => {
      const headers = ["ID", "Description"];
      const rows = [
        ["1", "short"],
        ["2", "a longer value"],
      ];

      printTable(headers, rows);

      expect(logSpy).toHaveBeenNthCalledWith(1, "ID  Description   ");
      expect(logSpy).toHaveBeenNthCalledWith(2, "--  --------------");
      expect(logSpy).toHaveBeenNthCalledWith(3, "1   short         ");
      expect(logSpy).toHaveBeenNthCalledWith(4, "2   a longer value");
    });
  });
});
