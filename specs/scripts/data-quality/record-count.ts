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
  const data = JSON.parse(raw) as unknown[];

  assert(
    data.length >= 50,
    `Dataset has only ${data.length} records — expected at least 50`
  );

  console.log(`✓ Dataset has ${data.length} records (meets minimum of 50)`);
  process.exit(0);
}

main();
