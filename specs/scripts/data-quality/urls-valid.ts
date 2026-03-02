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
    url: string;
    hn_url: string;
    service: string;
    id: string;
  }[];

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    // Validate url field
    if (!r.url || r.url.trim().length === 0) {
      errors.push(`Record[${i}] (${r.service}, id="${r.id}"): url is empty`);
    } else {
      try {
        const parsed = new URL(r.url);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          errors.push(
            `Record[${i}] (${r.service}, id="${r.id}"): url uses unsupported protocol "${parsed.protocol}"`
          );
        }
      } catch {
        errors.push(
          `Record[${i}] (${r.service}, id="${r.id}"): url is not a valid URL — "${r.url}"`
        );
      }
    }

    // Validate hn_url field
    if (!r.hn_url || r.hn_url.trim().length === 0) {
      errors.push(`Record[${i}] (${r.service}, id="${r.id}"): hn_url is empty`);
    } else {
      try {
        const parsed = new URL(r.hn_url);
        if (parsed.protocol !== "https:") {
          errors.push(
            `Record[${i}] (${r.service}, id="${r.id}"): hn_url uses "${parsed.protocol}" instead of "https:"`
          );
        }
        // Check it's a valid HN URL format
        const isHnItem = r.hn_url.startsWith("https://news.ycombinator.com/item?id=");
        const isHnSearch = r.hn_url.startsWith("https://hn.algolia.com/");
        if (!isHnItem && !isHnSearch) {
          errors.push(
            `Record[${i}] (${r.service}, id="${r.id}"): hn_url doesn't match expected HN format — "${r.hn_url}"`
          );
        }
      } catch {
        errors.push(
          `Record[${i}] (${r.service}, id="${r.id}"): hn_url is not a valid URL — "${r.hn_url}"`
        );
      }
    }
  }

  // Check for duplicate hn_urls (each HN post should be unique)
  // Note: duplicate article urls are allowed since multiple outages may link to the same status page
  const hnUrls = new Set<string>();
  for (let i = 0; i < data.length; i++) {
    if (hnUrls.has(data[i].hn_url)) {
      errors.push(
        `Record[${i}] (${data[i].service}, id="${data[i].id}"): duplicate hn_url "${data[i].hn_url}"`
      );
    }
    hnUrls.add(data[i].hn_url);
  }

  assert(
    errors.length === 0,
    `URL validation errors:\n${errors.join("\n")}`
  );

  console.log(`✓ All ${data.length} records have valid urls and hn_urls with no duplicates`);
  process.exit(0);
}

main();
