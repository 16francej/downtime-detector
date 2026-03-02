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

  const sorted = data.map((r) => r.date).sort();
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];

  const startYear = new Date(earliest).getFullYear();
  const endYear = new Date(latest).getFullYear();

  // Check every year has at least one entry
  const yearCounts: Record<number, number> = {};
  for (const record of data) {
    const year = new Date(record.date).getFullYear();
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }

  const missingYears: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    if (!yearCounts[y] || yearCounts[y] === 0) {
      missingYears.push(y);
    }
  }

  assert(
    missingYears.length === 0,
    `Missing outage data for years: ${missingYears.join(", ")}. Year counts: ${JSON.stringify(yearCounts)}`
  );

  // Check no gap > 18 months between consecutive records
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]).getTime();
    const curr = new Date(sorted[i]).getTime();
    const gapMonths = (curr - prev) / (1000 * 60 * 60 * 24 * 30);
    assert(
      gapMonths <= 18,
      `Gap of ${gapMonths.toFixed(1)} months between ${sorted[i - 1]} and ${sorted[i]}`
    );
  }

  console.log(
    `✓ No multi-year gaps. ${Object.keys(yearCounts).length} years covered (${startYear}–${endYear})`
  );
  process.exit(0);
}

main();
