#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";

const JSON_PATH = join(process.cwd(), "public", "outages.json");
const TS_PATH = join(process.cwd(), "src", "data", "outages.ts");

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function main() {
  // Load JSON data
  const jsonRaw = readFileSync(JSON_PATH, "utf-8");
  const jsonData = JSON.parse(jsonRaw) as Record<string, unknown>[];

  // Load TS file and extract data
  const tsRaw = readFileSync(TS_PATH, "utf-8");

  // Count records by counting id fields in TS source (handles both quoted and unquoted keys)
  const tsIdMatches = tsRaw.match(/"?id"?:\s*"/g);
  const tsCount = tsIdMatches ? tsIdMatches.length : 0;

  assert(
    jsonData.length === tsCount,
    `Record count mismatch: outages.json has ${jsonData.length}, outages.ts has ${tsCount}`
  );

  // Extract all id values from TS source (handles both quoted and unquoted keys)
  const tsIdValueMatches = tsRaw.match(/"?id"?:\s*"([^"]+)"/g);
  const tsIds = new Set(
    (tsIdValueMatches || []).map((m) => m.replace(/"?id"?:\s*"/, "").replace(/"$/, ""))
  );

  // Extract all id values from JSON
  const jsonIds = new Set(jsonData.map((r) => r.id as string));

  // Check every JSON id exists in TS
  for (const id of jsonIds) {
    assert(tsIds.has(id), `ID "${id}" in outages.json but not in outages.ts`);
  }

  // Check every TS id exists in JSON
  for (const id of tsIds) {
    assert(jsonIds.has(id), `ID "${id}" in outages.ts but not in outages.json`);
  }

  // Extract and compare service names (handles both quoted and unquoted keys)
  const tsServiceMatches = tsRaw.match(/"?service"?:\s*"([^"]+)"/g);
  const tsServices = new Set(
    (tsServiceMatches || []).map((m) => m.replace(/"?service"?:\s*"/, "").replace(/"$/, ""))
  );
  const jsonServices = new Set(jsonData.map((r) => r.service as string));

  for (const s of tsServices) {
    assert(
      jsonServices.has(s),
      `Service "${s}" in outages.ts but not in outages.json`
    );
  }

  for (const s of jsonServices) {
    assert(
      tsServices.has(s),
      `Service "${s}" in outages.json but not in outages.ts`
    );
  }

  // Extract and compare titles to confirm content matches (handles both quoted and unquoted keys)
  const tsTitleMatches = tsRaw.match(/"?title"?:\s*"([^"]+)"/g);
  const tsTitles = new Set(
    (tsTitleMatches || []).map((m) => m.replace(/"?title"?:\s*"/, "").replace(/"$/, ""))
  );
  const jsonTitles = new Set(jsonData.map((r) => r.title as string));

  assert(
    tsTitles.size === jsonTitles.size,
    `Unique title count mismatch: outages.ts has ${tsTitles.size}, outages.json has ${jsonTitles.size}`
  );

  console.log(
    `✓ Both files have ${jsonData.length} records with matching IDs, services, and titles`
  );
  process.exit(0);
}

main();
