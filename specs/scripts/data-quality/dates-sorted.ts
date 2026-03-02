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
  const data = JSON.parse(raw) as { date: string; timestamp: number; service: string }[];

  assert(data.length > 1, "Need at least 2 records to check sort order");

  const errors: string[] = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i].date < data[i - 1].date) {
      errors.push(
        `Record[${i}] "${data[i].service}" (${data[i].date}) is before Record[${i - 1}] "${data[i - 1].service}" (${data[i - 1].date})`
      );
    }
  }

  assert(
    errors.length === 0,
    `Records not sorted by date ascending:\n${errors.join("\n")}`
  );

  // Also verify timestamp is consistent with date field
  for (let i = 0; i < data.length; i++) {
    const dateFromTimestamp = new Date(data[i].timestamp).toISOString().slice(0, 10);
    const dateField = data[i].date;

    // Allow up to 1 day difference for timezone issues
    const tsDate = new Date(data[i].timestamp);
    const fieldDate = new Date(dateField + "T00:00:00Z");
    const diffMs = Math.abs(tsDate.getTime() - fieldDate.getTime());
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays > 1) {
      errors.push(
        `Record[${i}] (${data[i].service}): date "${dateField}" doesn't match timestamp ${data[i].timestamp} (resolves to ${dateFromTimestamp})`
      );
    }
  }

  assert(
    errors.length === 0,
    `Date/timestamp mismatches:\n${errors.join("\n")}`
  );

  console.log(
    `✓ All ${data.length} records are sorted by date ascending with consistent timestamps`
  );
  process.exit(0);
}

main();
