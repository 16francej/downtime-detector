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
  const data = JSON.parse(raw) as { title: string; service: string }[];

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    if (r.title.length < 8) {
      errors.push(
        `Record[${i}] (${r.service}): title too short (${r.title.length} chars): "${r.title}"`
      );
    }

  }

  assert(errors.length === 0, `Title quality issues:\n${errors.join("\n")}`);

  console.log(`✓ All ${data.length} titles meet quality standards`);
  process.exit(0);
}

main();
