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
  const data = JSON.parse(raw) as { id: string }[];

  const ids = data.map((r) => r.id);
  const seen = new Set<string>();
  const dupes: string[] = [];

  for (const id of ids) {
    assert(typeof id === "string" && id.length > 0, `Found empty or non-string id`);
    if (seen.has(id)) {
      dupes.push(id);
    }
    seen.add(id);
  }

  assert(dupes.length === 0, `Duplicate IDs found: ${dupes.join(", ")}`);

  console.log(`✓ All ${ids.length} IDs are unique`);
  process.exit(0);
}

main();
