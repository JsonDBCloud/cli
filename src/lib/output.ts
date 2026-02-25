const isTTY = process.stdout.isTTY;

export function success(msg: string): void {
  if (isTTY) {
    console.log(`\x1b[32m✓\x1b[0m ${msg}`);
  } else {
    console.log(`OK: ${msg}`);
  }
}

export function error(msg: string, suggestion?: string): void {
  if (isTTY) {
    console.error(`\x1b[31m✗\x1b[0m Error: ${msg}`);
    if (suggestion) console.error(`  ${suggestion}`);
  } else {
    console.error(`ERROR: ${msg}`);
    if (suggestion) console.error(suggestion);
  }
}

export function warn(msg: string): void {
  if (isTTY) {
    console.log(`\x1b[33m⚠\x1b[0m ${msg}`);
  } else {
    console.log(`WARN: ${msg}`);
  }
}

export function printJson(data: unknown, raw = false): void {
  if (raw || !isTTY) {
    console.log(JSON.stringify(data));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

export function printTable(headers: string[], rows: string[][]): void {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => (r[i] || "").length)));

  const sep = widths.map((w) => "-".repeat(w)).join("  ");
  const header = headers.map((h, i) => h.padEnd(widths[i])).join("  ");

  console.log(header);
  console.log(sep);
  for (const row of rows) {
    console.log(row.map((c, i) => (c || "").padEnd(widths[i])).join("  "));
  }
}
