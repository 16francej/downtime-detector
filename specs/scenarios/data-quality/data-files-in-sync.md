---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/data-sync.ts
---

# Data Quality — TypeScript and JSON data files are in sync

## Context
- Outage data exists in two files: src/data/outages.ts and public/outages.json
- These must contain identical records

## Steps
1. Load public/outages.json
2. Parse src/data/outages.ts to extract its data
3. Compare record counts and content

## Expected
- Both files contain the same number of records
- Records are identical in both files
- No drift between the two data sources
