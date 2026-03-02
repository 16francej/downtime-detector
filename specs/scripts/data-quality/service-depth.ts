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

  const counts: Record<string, number> = {};
  for (const r of data) {
    counts[r.service] = (counts[r.service] || 0) + 1;
  }

  assert(
    (counts["AWS"] || 0) >= 5,
    `AWS has ${counts["AWS"] || 0} entries — expected at least 5`
  );
  assert(
    (counts["Google"] || 0) >= 4,
    `Google has ${counts["Google"] || 0} entries — expected at least 4`
  );
  assert(
    (counts["GitHub"] || 0) >= 4,
    `GitHub has ${counts["GitHub"] || 0} entries — expected at least 4`
  );
  assert(
    (counts["Cloudflare"] || 0) >= 3,
    `Cloudflare has ${counts["Cloudflare"] || 0} entries — expected at least 3`
  );

  const singleEntryServices = Object.entries(counts).filter(
    ([, c]) => c === 1
  );
  const singlePct = (singleEntryServices.length / Object.keys(counts).length) * 100;
  assert(
    singlePct <= 50,
    `${singlePct.toFixed(0)}% of services have only 1 entry — expected ≤ 50%. Singles: ${singleEntryServices.map(([s]) => s).join(", ")}`
  );

  console.log(
    `✓ Service depth OK. Counts: ${JSON.stringify(counts)}. ${singleEntryServices.length}/${Object.keys(counts).length} are single-entry.`
  );
  process.exit(0);
}

main();
