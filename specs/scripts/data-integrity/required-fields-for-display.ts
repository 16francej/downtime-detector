#!/usr/bin/env node
/**
 * Verification script: Outage data includes all required fields for display
 * Checks that every record in public/outages.json has the required fields.
 */

import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "public", "outages.json");

interface OutageRecord {
  service: string;
  title: string;
  url: string;
  hn_url: string;
  upvotes: number;
  comments: number;
  date: string;
  summary: string;
}

const REQUIRED_FIELDS: (keyof OutageRecord)[] = [
  "service",
  "title",
  "url",
  "hn_url",
  "upvotes",
  "comments",
  "date",
  "summary",
];

function main() {
  let data: OutageRecord[];
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    data = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read/parse outages.json:", err);
    process.exit(1);
  }

  if (!Array.isArray(data) || data.length === 0) {
    console.error("outages.json is empty or not an array");
    process.exit(1);
  }

  let allValid = true;
  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const record = data[i];
    for (const field of REQUIRED_FIELDS) {
      const value = record[field];
      if (value === null || value === undefined || value === "") {
        errors.push(
          `Record [${i}] (${record.service ?? "unknown"}) missing or empty field: ${field}`
        );
        allValid = false;
      }
    }
  }

  if (!allValid) {
    errors.forEach((e) => console.error(e));
    process.exit(1);
  }

  console.log(
    `✓ All ${data.length} records have all required fields: ${REQUIRED_FIELDS.join(", ")}`
  );
  process.exit(0);
}

main();
