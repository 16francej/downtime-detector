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
    title: string;
    summary: string;
    service: string;
    id: string;
  }[];

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    // Check title for leading/trailing whitespace
    if (r.title !== r.title.trim()) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): title has leading/trailing whitespace — "${r.title}"`
      );
    }

    // Check title for consecutive spaces
    if (/  +/.test(r.title)) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): title contains consecutive spaces — "${r.title}"`
      );
    }

    // Check summary for leading/trailing whitespace
    if (r.summary !== r.summary.trim()) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): summary has leading/trailing whitespace`
      );
    }

    // Check summary for consecutive spaces
    if (/  +/.test(r.summary)) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): summary contains consecutive spaces`
      );
    }
  }

  assert(
    errors.length === 0,
    `Whitespace issues found:\n${errors.join("\n")}`
  );

  console.log(`✓ All ${data.length} records have clean titles and summaries (no whitespace issues)`);
  process.exit(0);
}

main();
