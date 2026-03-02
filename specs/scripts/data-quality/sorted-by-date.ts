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
  const data = JSON.parse(raw) as { date: string; service: string }[];

  assert(data.length > 1, "Need at least 2 records to check sort order");

  // Check ascending
  let ascending = true;
  let descending = true;

  for (let i = 1; i < data.length; i++) {
    if (data[i].date < data[i - 1].date) ascending = false;
    if (data[i].date > data[i - 1].date) descending = false;
  }

  assert(
    ascending || descending,
    `Data is not sorted. First few dates: ${data.slice(0, 5).map((r) => r.date).join(", ")}...`
  );

  const order = ascending ? "ascending" : "descending";
  console.log(`✓ Data is sorted by date (${order})`);
  process.exit(0);
}

main();
