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
  const data = JSON.parse(raw) as { service: string }[];

  const services = data.map((r) => r.service);
  const errors: string[] = [];

  // Check for whitespace issues
  for (let i = 0; i < data.length; i++) {
    const s = services[i];
    if (s !== s.trim()) {
      errors.push(`Record[${i}]: service "${s}" has leading/trailing whitespace`);
    }
  }

  // Check for case-insensitive duplicates
  const lowerMap = new Map<string, string>();
  for (const s of new Set(services)) {
    const lower = s.toLowerCase();
    if (lowerMap.has(lower)) {
      errors.push(
        `Case-insensitive duplicate: "${s}" vs "${lowerMap.get(lower)}"`
      );
    }
    lowerMap.set(lower, s);
  }

  assert(errors.length === 0, `Service name issues:\n${errors.join("\n")}`);

  console.log(
    `✓ All ${new Set(services).size} service names are consistently cased`
  );
  process.exit(0);
}

main();
