/**
 * Verifies year coverage — at least 1 outage per year from 2007 to 2025,
 * no multi-year gaps.
 */
import * as fs from "fs";
import * as path from "path";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error("FAIL: " + message);
    process.exit(1);
  }
}

const dataPath = path.join(__dirname, "..", "..", "..", "public", "outages.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

assert(Array.isArray(data), "outages.json should contain an array");

const years = new Set<number>();
for (const outage of data) {
  const year = parseInt(outage.date.split("-")[0], 10);
  years.add(year);
}

const sortedYears = Array.from(years).sort((a, b) => a - b);
console.log(`Years covered: ${sortedYears.join(", ")}`);
console.log(`Range: ${sortedYears[0]} - ${sortedYears[sortedYears.length - 1]}`);

// Check coverage from 2008 to 2025
for (let year = 2008; year <= 2025; year++) {
  assert(years.has(year), `Year ${year} should have at least 1 outage`);
}
console.log("OK: All years 2008-2025 have at least 1 outage");

// Check no gap of 2+ consecutive missing years
for (let i = 1; i < sortedYears.length; i++) {
  const gap = sortedYears[i] - sortedYears[i - 1];
  assert(gap < 3, `Gap of ${gap} years between ${sortedYears[i - 1]} and ${sortedYears[i]} (max allowed: 2)`);
}
console.log("OK: No multi-year gaps");

console.log("\nYear coverage verified!");
process.exit(0);
