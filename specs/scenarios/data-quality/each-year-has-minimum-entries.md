---
priority: high
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/year-distribution.ts
---

# Data-quality — Each year in the dataset range has at least 2 outage entries

## Context
- Years with only 0-1 entries create visual and informational gaps
- The scatter plot should show meaningful data density in every year

## Steps
1. Load the outage data from public/outages.json
2. Group records by year
3. Check each year has sufficient entries

## Expected
- Every year from the earliest to the latest record has at least 2 outage entries
- No single year accounts for more than 40% of all records (distribution should be reasonable)
