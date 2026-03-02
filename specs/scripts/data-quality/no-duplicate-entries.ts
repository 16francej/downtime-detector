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
  const data = JSON.parse(raw) as { service: string; date: string }[];

  const seen = new Set<string>();
  const dupes: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const key = `${data[i].service}|${data[i].date}`;
    if (seen.has(key)) {
      dupes.push(`Record[${i}]: duplicate (service="${data[i].service}", date="${data[i].date}")`);
    }
    seen.add(key);
  }

  assert(dupes.length === 0, `Duplicate entries:\n${dupes.join("\n")}`);

  console.log(`✓ All ${data.length} (service, date) pairs are unique`);
  process.exit(0);
}

main();
