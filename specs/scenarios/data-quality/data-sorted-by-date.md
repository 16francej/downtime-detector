---
priority: low
type: infrastructure
confidence: inferred
verification:
  - script: specs/scripts/data-quality/sorted-by-date.ts
---

# Data-quality — Data records are sorted by date in the JSON file

## Context
- The OutageList sorts by timestamp on render, but the raw data should also be ordered
- Sorted source data makes diffs cleaner and debugging easier

## Steps
1. Load the outage data from public/outages.json
2. Check if records are sorted by date (ascending or descending)

## Expected
- Records in the JSON file are sorted chronologically (either ascending or descending)
- No records are randomly ordered
