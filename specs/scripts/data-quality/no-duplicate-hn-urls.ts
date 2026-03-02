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

  const seen = new Set<string>();
  const dupes: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const url = data[i].hn_url;
    if (seen.has(url)) {
      dupes.push(`Record[${i}] (${data[i].service}): duplicate hn_url "${url}"`);
    }
    seen.add(url);
  }

  assert(dupes.length === 0, `Duplicate HN URLs:\n${dupes.join("\n")}`);

  console.log(`✓ All ${data.length} HN URLs are unique`);
  process.exit(0);
}

main();
