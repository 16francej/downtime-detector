/**
 * Verifies no duplicate incidents exist in the generated data.
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

// Check unique IDs
const ids = data.map((o: any) => o.id);
const uniqueIds = new Set(ids);
assert(uniqueIds.size === ids.length, `IDs are not unique: ${ids.length} total, ${uniqueIds.size} unique`);
console.log(`OK: All ${ids.length} IDs are unique`);

// Check unique hn_urls
const hnUrls = data.map((o: any) => o.hn_url);
const uniqueHnUrls = new Set(hnUrls);
assert(uniqueHnUrls.size === hnUrls.length, `hn_urls are not unique: ${hnUrls.length} total, ${uniqueHnUrls.size} unique`);
console.log(`OK: All ${hnUrls.length} hn_urls are unique`);

// Check no same-service entries within 7 days
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const byService = new Map<string, Array<{ id: string; date: string; timestamp: number }>>();

for (const outage of data) {
  const service = outage.service;
  if (!byService.has(service)) byService.set(service, []);
  byService.get(service)!.push({ id: outage.id, date: outage.date, timestamp: outage.timestamp });
}

let violations = 0;
for (const [service, entries] of byService) {
  entries.sort((a, b) => a.timestamp - b.timestamp);
  for (let i = 1; i < entries.length; i++) {
    const gap = entries[i].timestamp - entries[i - 1].timestamp;
    if (gap < SEVEN_DAYS_MS) {
      console.error(
        `  Violation: ${service} has entries "${entries[i - 1].id}" (${entries[i - 1].date}) and "${entries[i].id}" (${entries[i].date}) within 7 days`
      );
      violations++;
    }
  }
}

assert(violations === 0, `Found ${violations} same-service entries within 7 days of each other`);
console.log("OK: No same-service entries within 7-day window");

console.log("\nNo duplicates found!");
process.exit(0);
