#!/usr/bin/env node
/**
 * Verification script: Outage record schema integrity in JSON file
 * Checks types, no nulls, valid URLs, and parseable dates within 10-year range.
 */

import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "public", "outages.json");

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function main() {
  let data: Record<string, unknown>[];
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

  const now = new Date();
  const twentyYearsAgo = new Date();
  twentyYearsAgo.setFullYear(now.getFullYear() - 20);

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];
    const id = `Record[${i}](${r["service"] ?? "?"})`;

    // Check no null values
    for (const [key, val] of Object.entries(r)) {
      if (val === null) {
        errors.push(`${id} has null value in field: ${key}`);
      }
    }

    // Type checks
    if (typeof r["service"] !== "string" || (r["service"] as string).length === 0)
      errors.push(`${id}: service must be a non-empty string`);
    if (typeof r["title"] !== "string" || (r["title"] as string).length === 0)
      errors.push(`${id}: title must be a non-empty string`);
    if (typeof r["url"] !== "string" || !isValidUrl(r["url"] as string))
      errors.push(`${id}: url must be a valid URL, got: ${r["url"]}`);
    if (typeof r["hn_url"] !== "string" || !isValidUrl(r["hn_url"] as string))
      errors.push(`${id}: hn_url must be a valid URL, got: ${r["hn_url"]}`);
    if (typeof r["upvotes"] !== "number" || (r["upvotes"] as number) < 0)
      errors.push(`${id}: upvotes must be a number >= 0`);
    if (typeof r["comments"] !== "number" || (r["comments"] as number) < 0)
      errors.push(`${id}: comments must be a number >= 0`);
    if (typeof r["summary"] !== "string" || (r["summary"] as string).length === 0)
      errors.push(`${id}: summary must be a non-empty string`);

    // Date checks
    if (typeof r["date"] !== "string") {
      errors.push(`${id}: date must be a string`);
    } else {
      const d = new Date(r["date"] as string);
      if (isNaN(d.getTime())) {
        errors.push(`${id}: date is not parseable: ${r["date"]}`);
      } else if (d < twentyYearsAgo || d > now) {
        errors.push(
          `${id}: date ${r["date"]} is outside the expected range (${twentyYearsAgo.getFullYear()}–${now.getFullYear()})`
        );
      }
    }
  }

  if (errors.length > 0) {
    errors.forEach((e) => console.error(e));
    process.exit(1);
  }

  console.log(`✓ All ${data.length} records pass schema integrity checks`);
  process.exit(0);
}

main();
