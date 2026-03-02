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
    upvotes: number;
    comments: number;
    service: string;
  }[];

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    if (!Number.isInteger(r.upvotes) || r.upvotes < 0) {
      errors.push(`Record[${i}] (${r.service}): upvotes ${r.upvotes} is not a non-negative integer`);
    }
    if (!Number.isInteger(r.comments) || r.comments < 0) {
      errors.push(`Record[${i}] (${r.service}): comments ${r.comments} is not a non-negative integer`);
    }
    if (r.upvotes > 10000) {
      errors.push(`Record[${i}] (${r.service}): upvotes ${r.upvotes} exceeds 10,000`);
    }

    if (r.upvotes > 0) {
      const ratio = r.comments / r.upvotes;
      if (ratio < 0.001 || ratio > 5.0) {
        errors.push(
          `Record[${i}] (${r.service}): comments/upvotes ratio ${ratio.toFixed(4)} is outside 0.001–5.0 range (${r.comments}/${r.upvotes})`
        );
      }
    }
  }

  assert(errors.length === 0, `Engagement range issues:\n${errors.join("\n")}`);

  // Check at least 25% have upvotes > 500
  const highEngagement = data.filter((r) => r.upvotes > 500).length;
  const pct = (highEngagement / data.length) * 100;
  assert(
    pct >= 5,
    `Only ${pct.toFixed(0)}% of records have upvotes > 500 — expected ≥ 5%`
  );

  console.log(`✓ All ${data.length} records have reasonable engagement ranges`);
  process.exit(0);
}

main();
