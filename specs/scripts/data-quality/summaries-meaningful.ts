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
  const data = JSON.parse(raw) as {
    summary: string;
    service: string;
    title: string;
    id: string;
  }[];

  const errors: string[] = [];

  // Templated fallback pattern: "{Service} experienced a service outage. {Title}"
  const templatePattern = /^.+ experienced a service outage\.\s*.+$/;

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    // Check for the exact fallback template
    const fallback = `${r.service} experienced a service outage. ${r.title}`;
    if (r.summary === fallback) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): summary is the fallback template "${r.service} experienced a service outage. {Title}"`
      );
      continue;
    }

    // Check summary doesn't just repeat the title verbatim
    if (r.summary.trim() === r.title.trim()) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): summary is identical to the title`
      );
      continue;
    }

    // Check summary has some minimal substance (not just the service + generic phrase)
    const genericPatterns = [
      new RegExp(`^${escapeRegex(r.service)} experienced a service outage\\.$`, "i"),
      new RegExp(`^${escapeRegex(r.service)} was down\\.$`, "i"),
      new RegExp(`^${escapeRegex(r.service)} had an outage\\.$`, "i"),
    ];

    for (const gp of genericPatterns) {
      if (gp.test(r.summary.trim())) {
        errors.push(
          `Record[${i}] (${r.service}, id="${r.id}"): summary is too generic — "${r.summary}"`
        );
        break;
      }
    }

    // Check summary provides information beyond the title
    // A meaningful summary should have some words not in the title
    const titleWords = new Set(r.title.toLowerCase().split(/\s+/));
    const summaryWords = r.summary.toLowerCase().split(/\s+/);
    const newWords = summaryWords.filter((w) => !titleWords.has(w) && w.length > 3);

    if (newWords.length < 3) {
      errors.push(
        `Record[${i}] (${r.service}, id="${r.id}"): summary adds fewer than 3 new words beyond the title`
      );
    }
  }

  assert(
    errors.length === 0,
    `Found ${errors.length} templated or non-meaningful summaries:\n${errors.join("\n")}`
  );

  console.log(`✓ All ${data.length} summaries are meaningful and not templated`);
  process.exit(0);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main();
