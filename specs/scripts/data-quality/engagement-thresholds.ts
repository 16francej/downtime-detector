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
  const data = JSON.parse(raw) as {
    severity: string;
    upvotes: number;
    service: string;
    id: string;
  }[];

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    let expected: string;

    if (r.upvotes > 1000) {
      expected = "high";
    } else if (r.upvotes > 300) {
      expected = "medium";
    } else {
      expected = "low";
    }

    if (r.severity !== expected) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): upvotes=${r.upvotes} should be "${expected}" but got "${r.severity}"`
      );
    }
  }

  assert(
    errors.length === 0,
    `Engagement threshold mismatches:\n${errors.join("\n")}`
  );

  console.log(
    `✓ All ${data.length} records have severity consistent with upvote thresholds (>1000=high, 301-1000=medium, <=300=low)`
  );
  process.exit(0);
}

main();
