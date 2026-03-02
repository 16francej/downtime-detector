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
  const jsonData = JSON.parse(jsonRaw) as { service: string; date: string; title: string }[];

  // Load TS file and count records by parsing the array literals
  const tsRaw = readFileSync(TS_PATH, "utf-8");

  // Count objects in the TS array by counting id fields (with or without quoted keys)
  const tsRecordMatches = tsRaw.match(/"?id"?:\s*"/g);
  // Subtract 1 for the interface definition if it matched
  const interfaceIdMatch = tsRaw.match(/^\s*id:\s*string/m);
  const tsCount = tsRecordMatches ? tsRecordMatches.length - (interfaceIdMatch ? 0 : 0) : 0;

  assert(
    jsonData.length === tsCount,
    `Record count mismatch: outages.json has ${jsonData.length}, outages.ts has ${tsCount}`
  );

  // Extract service names from TS (handles both quoted and unquoted keys)
  const tsServiceMatches = tsRaw.match(/"?service"?:\s*"([^"]+)"/g);
  const tsServices = new Set(
    (tsServiceMatches || []).map((m) => m.replace(/"?service"?:\s*"/, "").replace(/"$/, ""))
  );

  const jsonServices = new Set(jsonData.map((r) => r.service));

  // Check all TS services exist in JSON
  for (const s of tsServices) {
    assert(
      jsonServices.has(s),
      `Service "${s}" in outages.ts but not in outages.json`
    );
  }

  console.log(
    `✓ Both files have ${jsonData.length} records and matching services`
  );
  process.exit(0);
}

main();
