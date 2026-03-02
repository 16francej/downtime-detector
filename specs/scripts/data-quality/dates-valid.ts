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
  const data = JSON.parse(raw) as { date: string; service: string }[];

  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  const errors: string[] = [];
  const now = new Date();

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    if (!isoPattern.test(r.date)) {
      errors.push(`Record[${i}] (${r.service}): date "${r.date}" is not ISO 8601 (YYYY-MM-DD)`);
      continue;
    }

    const d = new Date(r.date);
    if (isNaN(d.getTime())) {
      errors.push(`Record[${i}] (${r.service}): date "${r.date}" is not parseable`);
      continue;
    }

    if (d > now) {
      errors.push(`Record[${i}] (${r.service}): date "${r.date}" is in the future`);
    }

    if (d.getFullYear() < 2006) {
      errors.push(`Record[${i}] (${r.service}): date "${r.date}" is before 2006`);
    }
  }

  assert(errors.length === 0, `Date validation errors:\n${errors.join("\n")}`);

  console.log(`✓ All ${data.length} dates are valid ISO 8601 within expected range`);
  process.exit(0);
}

main();
