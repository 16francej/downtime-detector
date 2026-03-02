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
  const data = JSON.parse(raw) as { severity: string; service: string; id: string }[];

  const validSeverities = new Set(["high", "medium", "low"]);
  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    if (!validSeverities.has(r.severity)) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): severity "${r.severity}" is not one of "high", "medium", "low"`
      );
    }
  }

  assert(
    errors.length === 0,
    `Invalid severity values:\n${errors.join("\n")}`
  );

  // Report distribution
  const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
  for (const r of data) {
    counts[r.severity]++;
  }

  console.log(
    `✓ All ${data.length} records have valid severity labels (high: ${counts.high}, medium: ${counts.medium}, low: ${counts.low})`
  );
  process.exit(0);
}

main();
