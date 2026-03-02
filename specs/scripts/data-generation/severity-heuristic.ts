/**
 * Verifies severity assignments match the upvote-based heuristic.
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

function expectedSeverity(upvotes: number): string {
  if (upvotes > 1000) return "high";
  if (upvotes > 300) return "medium";
  return "low";
}

let mismatches = 0;
const counts = { high: 0, medium: 0, low: 0 };

for (const record of data) {
  const expected = expectedSeverity(record.upvotes);
  counts[expected as keyof typeof counts]++;

  if (record.severity !== expected) {
    console.error(
      `Mismatch: ${record.id} has severity "${record.severity}" but upvotes=${record.upvotes} → expected "${expected}"`
    );
    mismatches++;
  }
}

assert(mismatches === 0, `Found ${mismatches} severity mismatches`);

console.log(`OK: All ${data.length} records have correct severity`);
console.log(`  high (>1000): ${counts.high}`);
console.log(`  medium (>300): ${counts.medium}`);
console.log(`  low (<=300): ${counts.low}`);
console.log("\nSeverity heuristic verified!");
process.exit(0);
