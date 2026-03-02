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
  const data = JSON.parse(raw) as { date: string; timestamp: number; service: string }[];

  const errors: string[] = [];
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    const expected = new Date(r.date).getTime();
    const drift = Math.abs(r.timestamp - expected);

    if (drift > ONE_DAY_MS) {
      errors.push(
        `Record[${i}] (${r.service}): timestamp ${r.timestamp} drifts ${(drift / ONE_DAY_MS).toFixed(1)} days from date "${r.date}" (expected ~${expected})`
      );
    }
  }

  assert(errors.length === 0, `Timestamp/date mismatches:\n${errors.join("\n")}`);

  console.log(`✓ All ${data.length} records have timestamps matching their date fields`);
  process.exit(0);
}

main();
