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

  assert(data.length > 0, "Dataset is empty");

  const yearCounts: Record<number, number> = {};
  for (const record of data) {
    const year = new Date(record.date).getFullYear();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }

  const years = Object.keys(yearCounts).map(Number).sort();
  const startYear = years[0];
  const endYear = years[years.length - 1];

  // Check each year has at least 2 entries
  const thinYears: string[] = [];
  for (let y = startYear; y <= endYear; y++) {
    const count = yearCounts[y] || 0;
    if (count < 2) {
      thinYears.push(`${y}(${count})`);
    }
  }

  assert(
    thinYears.length === 0,
    `Years with fewer than 2 entries: ${thinYears.join(", ")}. Full counts: ${JSON.stringify(yearCounts)}`
  );

  // Check no single year > 25%
  const maxCount = Math.max(...Object.values(yearCounts));
  const maxPct = (maxCount / data.length) * 100;
  assert(
    maxPct <= 25,
    `Year with most entries has ${maxPct.toFixed(0)}% of all data — expected ≤ 25%`
  );

  // Check no consecutive 2-year window > 40%
  for (let y = startYear; y < endYear; y++) {
    const twoYearTotal = (yearCounts[y] || 0) + (yearCounts[y + 1] || 0);
    const twoYearPct = (twoYearTotal / data.length) * 100;
    assert(
      twoYearPct <= 40,
      `${y}–${y + 1} have ${twoYearTotal} entries (${twoYearPct.toFixed(0)}%) — expected ≤ 40% for any 2-year window`
    );
  }

  console.log(`✓ All years have ≥ 2 entries, no clustering detected. Distribution: ${JSON.stringify(yearCounts)}`);
  process.exit(0);
}

main();
