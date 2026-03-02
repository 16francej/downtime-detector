#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "public", "outages.json");

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function main() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as { severity: string; service: string }[];

  const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
  for (const r of data) {
    counts[r.severity] = (counts[r.severity] || 0) + 1;
  }

  assert(counts.high > 0, "No 'high' severity records found");
  assert(counts.medium > 0, "No 'medium' severity records found");
  assert(counts.low > 0, "No 'low' severity records found");

  assert(
    counts.low >= 3,
    `Only ${counts.low} 'low' severity records — expected at least 3`
  );

  const maxPct = (Math.max(...Object.values(counts)) / data.length) * 100;
  assert(
    maxPct <= 85,
    `Most common severity is ${maxPct.toFixed(0)}% of data — expected ≤ 85%. Counts: ${JSON.stringify(counts)}`
  );

  console.log(`✓ Severity distribution balanced: ${JSON.stringify(counts)}`);
  process.exit(0);
}

main();
