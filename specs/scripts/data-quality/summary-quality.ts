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
  const data = JSON.parse(raw) as { summary: string; service: string }[];

  const errors: string[] = [];
  const summaries = new Set<string>();

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    if (r.summary.length < 50) {
      errors.push(
        `Record[${i}] (${r.service}): summary too short (${r.summary.length} chars)`
      );
    }
    if (r.summary.length > 500) {
      errors.push(
        `Record[${i}] (${r.service}): summary too long (${r.summary.length} chars)`
      );
    }
    if (summaries.has(r.summary)) {
      errors.push(`Record[${i}] (${r.service}): duplicate summary`);
    }
    summaries.add(r.summary);

  }

  assert(errors.length === 0, `Summary quality issues:\n${errors.join("\n")}`);

  console.log(`✓ All ${data.length} summaries meet quality standards`);
  process.exit(0);
}

main();
