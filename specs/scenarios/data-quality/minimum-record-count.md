---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/minimum-record-count.ts
---

# Data-quality — Dataset has a minimum of 50 outage records

## Context
- A credible outage tracker needs substantial data coverage
- 36 records across 12+ years is sparse — roughly 3 per year

## Steps
1. Load the outage data from public/outages.json
2. Count the total number of records

## Expected
- The dataset contains at least 50 outage records
- The average is at least 4 outages per year of coverage
