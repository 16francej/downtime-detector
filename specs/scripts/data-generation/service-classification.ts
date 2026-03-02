/**
 * Verifies service classification is correct in the generated data.
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

// Check no "Unknown Service" entries
const unknownEntries = data.filter((o: any) => o.service === "Unknown Service");
assert(unknownEntries.length === 0, `Found ${unknownEntries.length} "Unknown Service" entries`);
console.log("OK: No 'Unknown Service' entries");

// Collect service counts
const serviceCounts = new Map<string, number>();
for (const outage of data) {
  const count = serviceCounts.get(outage.service) || 0;
  serviceCounts.set(outage.service, count + 1);
}

// Check canonical service names (no lowercase variants)
const canonicalNames = ["AWS", "Google", "GitHub", "Cloudflare", "Facebook", "Slack", "Azure", "Discord", "Reddit", "OpenAI"];
for (const [service] of serviceCounts) {
  // Service names should not be all lowercase if they're in our canonical list
  for (const canonical of canonicalNames) {
    if (service.toLowerCase() === canonical.toLowerCase() && service !== canonical) {
      assert(false, `Service "${service}" should use canonical form "${canonical}"`);
    }
  }
}
console.log("OK: Service names use canonical forms");

// Check common services have at least 3 entries
const requiredServices = ["AWS", "Google", "GitHub", "Cloudflare", "Facebook"];
for (const service of requiredServices) {
  // Allow partial match (e.g. "AWS S3" counts for "AWS")
  const count = data.filter((o: any) => o.service.includes(service) || o.service === service).length;
  assert(count >= 3, `${service} should have at least 3 entries, found ${count}`);
  console.log(`OK: ${service} has ${count} entries`);
}

console.log(`\nTotal services: ${serviceCounts.size}`);
console.log("Service classification verified!");
process.exit(0);
