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
  const data = JSON.parse(raw) as { hn_url: string; service: string }[];

  const hnItemPattern = /^https:\/\/news\.ycombinator\.com\/item\?id=\d+$/;
  const hnSearchPattern = /^https:\/\/hn\.algolia\.com\/\?/;
  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    if (!hnItemPattern.test(r.hn_url) && !hnSearchPattern.test(r.hn_url)) {
      errors.push(`Record[${i}] (${r.service}): invalid hn_url "${r.hn_url}"`);
    }
  }

  assert(errors.length === 0, `Invalid HN URLs:\n${errors.join("\n")}`);

  console.log(`✓ All ${data.length} HN URLs follow valid format`);
  process.exit(0);
}

main();
