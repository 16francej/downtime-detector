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
    severity: string;
    upvotes: number;
    service: string;
  }[];

  const groups: Record<string, number[]> = { high: [], medium: [], low: [] };
  for (const r of data) {
    if (groups[r.severity]) {
      groups[r.severity].push(r.upvotes);
    }
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgHigh = avg(groups.high);
  const avgLow = avg(groups.low);

  assert(
    avgHigh > avgLow,
    `Average high upvotes (${avgHigh.toFixed(0)}) should be > average low (${avgLow.toFixed(0)})`
  );

  // Check no low has more upvotes than the median high
  if (groups.high.length > 0 && groups.low.length > 0) {
    const sortedHigh = [...groups.high].sort((a, b) => a - b);
    const medianHigh = sortedHigh[Math.floor(sortedHigh.length / 2)];
    const lowAboveMedianHigh = groups.low.filter((v) => v > medianHigh);

    assert(
      lowAboveMedianHigh.length === 0,
      `${lowAboveMedianHigh.length} low outages have more upvotes than the median high outage (${medianHigh})`
    );
  }

  console.log(
    `✓ Severity correlates with engagement. High avg: ${avgHigh.toFixed(0)}, Low avg: ${avgLow.toFixed(0)}`
  );
  process.exit(0);
}

main();
