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
  const data = JSON.parse(raw) as { url: string; service: string }[];

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    try {
      const parsed = new URL(r.url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        errors.push(`Record[${i}] (${r.service}): url uses ${parsed.protocol} instead of http(s):`);
      }
    } catch {
      errors.push(`Record[${i}] (${r.service}): url is not valid: "${r.url}"`);
    }

  }

  assert(errors.length === 0, `Article URL issues:\n${errors.join("\n")}`);

  console.log(`✓ All ${data.length} article URLs are well-formed HTTP(S)`);
  process.exit(0);
}

main();
