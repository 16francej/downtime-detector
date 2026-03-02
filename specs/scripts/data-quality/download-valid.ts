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
  // Check file exists and is readable
  let raw: string;
  try {
    raw = readFileSync(DATA_PATH, "utf-8");
  } catch (err) {
    assert(false, `Cannot read public/outages.json: ${err}`);
    return;
  }

  // Check it's not empty
  assert(raw.trim().length > 0, "public/outages.json is empty");

  // Check it's valid JSON
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    assert(false, `public/outages.json is not valid JSON: ${err}`);
    return;
  }

  // Check it's an array
  assert(Array.isArray(data), "public/outages.json root is not an array");

  const records = data as Record<string, unknown>[];

  // Check it has records
  assert(records.length > 0, "public/outages.json has zero records");

  // Check required fields exist on each record
  const requiredFields = [
    "id",
    "service",
    "date",
    "title",
    "url",
    "hn_url",
    "upvotes",
    "comments",
    "summary",
    "timestamp",
    "severity",
  ];

  const errors: string[] = [];
  for (let i = 0; i < records.length; i++) {
    for (const field of requiredFields) {
      if (!(field in records[i])) {
        errors.push(`Record[${i}]: missing required field "${field}"`);
      }
    }
  }

  assert(
    errors.length === 0,
    `Records with missing fields:\n${errors.join("\n")}`
  );

  console.log(
    `✓ public/outages.json is valid JSON with ${records.length} records, all containing required fields`
  );
  process.exit(0);
}

main();
