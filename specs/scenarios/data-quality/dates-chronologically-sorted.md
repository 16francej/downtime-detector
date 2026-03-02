---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/dates-sorted.ts
---

# Data Quality — Records are sorted chronologically

## Context
- Records in the dataset should be sorted by date ascending
- This ensures consistent display order

## Steps
1. Load the outages dataset from public/outages.json
2. Check that timestamps are in ascending order

## Expected
- Each record's timestamp is greater than or equal to the previous record's timestamp
- Date field is consistent with timestamp field for each record
