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

  const dates = data.map((r) => r.date).sort();
  const mostRecent = dates[dates.length - 1];
  const mostRecentYear = new Date(mostRecent).getFullYear();

  assert(
    mostRecentYear >= 2024,
    `Most recent outage is from ${mostRecent} — expected at least one entry from 2024 or later`
  );

  const now = new Date();
  const mostRecentDate = new Date(mostRecent);
  const monthsAgo =
    (now.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  assert(
    monthsAgo <= 12,
    `Most recent outage (${mostRecent}) is ${monthsAgo.toFixed(0)} months old — expected within 12 months`
  );

  console.log(`✓ Dataset includes recent data. Most recent: ${mostRecent}`);
  process.exit(0);
}

main();
