---
priority: medium
type: edge-case
confidence: expanded
verification:
  - script: specs/scripts/data-quality/record-count.ts
---

# Data Quality — Record count is reasonable after cleanup

## Context
- After removing false positives, the dataset should still have a substantial number of records
- Too few records would indicate over-aggressive filtering

## Steps
1. Load the outages dataset from public/outages.json
2. Count total records

## Expected
- Dataset contains at least 400 records (started with 457, removing ~24 false positives)
- Dataset contains no more than 500 records (sanity check)
