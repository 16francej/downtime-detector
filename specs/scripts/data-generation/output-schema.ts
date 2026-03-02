/**
 * Verifies every record in outages.json conforms to the Outage schema.
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
assert(data.length > 0, "outages.json should not be empty");

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SEVERITIES = ["high", "medium", "low"];
const REQUIRED_STRING_FIELDS = ["id", "service", "date", "title", "url", "hn_url", "summary"];
const REQUIRED_NUMBER_FIELDS = ["upvotes", "comments", "timestamp"];

let errors = 0;

for (let i = 0; i < data.length; i++) {
  const record = data[i];
  const prefix = `Record ${i} (${record.id || "unknown"})`;

  // Check required string fields
  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof record[field] !== "string" || record[field].length === 0) {
      console.error(`${prefix}: "${field}" must be a non-empty string, got: ${JSON.stringify(record[field])}`);
      errors++;
    }
  }

  // Check required number fields
  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (typeof record[field] !== "number") {
      console.error(`${prefix}: "${field}" must be a number, got: ${typeof record[field]}`);
      errors++;
    }
  }

  // Check date format
  if (!ISO_DATE_RE.test(record.date)) {
    console.error(`${prefix}: date "${record.date}" is not ISO 8601 (YYYY-MM-DD)`);
    errors++;
  }

  // Check severity
  if (!VALID_SEVERITIES.includes(record.severity)) {
    console.error(`${prefix}: severity "${record.severity}" is not valid (expected high/medium/low)`);
    errors++;
  }

  // Check upvotes >= 50
  if (typeof record.upvotes === "number" && record.upvotes < 50) {
    console.error(`${prefix}: upvotes ${record.upvotes} is less than 50`);
    errors++;
  }

  // Check summary length
  if (typeof record.summary === "string") {
    if (record.summary.length < 10) {
      console.error(`${prefix}: summary is too short (${record.summary.length} chars)`);
      errors++;
    }
    if (record.summary.length > 500) {
      console.error(`${prefix}: summary is too long (${record.summary.length} chars)`);
      errors++;
    }
  }
}

assert(errors === 0, `Found ${errors} schema violations`);

console.log(`OK: All ${data.length} records pass schema validation`);
console.log("Output schema verified!");
process.exit(0);
