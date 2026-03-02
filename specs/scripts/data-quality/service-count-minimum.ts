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
  const data = JSON.parse(raw) as { service: string }[];

  const counts: Record<string, number> = {};
  for (const r of data) {
    counts[r.service] = (counts[r.service] || 0) + 1;
  }

  const uniqueCount = Object.keys(counts).length;
  assert(
    uniqueCount >= 15,
    `Only ${uniqueCount} distinct services — expected at least 15`
  );

  const withThreePlus = Object.entries(counts).filter(([, c]) => c >= 3);
  assert(
    withThreePlus.length >= 5,
    `Only ${withThreePlus.length} services with 3+ entries — expected at least 5. Services with 3+: ${withThreePlus.map(([s, c]) => `${s}(${c})`).join(", ")}`
  );

  console.log(
    `✓ ${uniqueCount} services total, ${withThreePlus.length} with 3+ entries`
  );
  process.exit(0);
}

main();
