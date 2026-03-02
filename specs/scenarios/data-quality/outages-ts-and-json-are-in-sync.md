---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/ts-json-sync.ts
---

# Data-quality — outages.ts and outages.json contain matching record count

## Context
- The project has two data sources: src/data/outages.ts (TypeScript) and public/outages.json
- The page loads from outages.json, but outages.ts is the source of truth

## Steps
1. Load public/outages.json
2. Load src/data/outages.ts (parse the exported array)
3. Compare record counts

## Expected
- Both files contain the same number of outage records
- Every service name in outages.ts also appears in outages.json
- No records are present in one file but missing from the other
