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
  const data = JSON.parse(raw) as { date: string }[];

  assert(data.length >= 50, `Dataset has only ${data.length} records — expected at least 50`);

  const dates = data.map((r) => r.date).sort();
  const startYear = new Date(dates[0]).getFullYear();
  const endYear = new Date(dates[dates.length - 1]).getFullYear();
  const yearSpan = endYear - startYear + 1;
  const avgPerYear = data.length / yearSpan;

  assert(
    avgPerYear >= 4,
    `Average of ${avgPerYear.toFixed(1)} outages/year — expected at least 4`
  );

  console.log(
    `✓ Dataset has ${data.length} records across ${yearSpan} years (avg ${avgPerYear.toFixed(1)}/year)`
  );
  process.exit(0);
}

main();
