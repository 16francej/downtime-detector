---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/recent-outages.ts
---

# Data-quality — Dataset includes recent outages from 2024 and beyond

## Context
- The tracker should reflect current data, not just historical records
- Users expect to see outages from the last 1-2 years

## Steps
1. Load the outage data from public/outages.json
2. Check the most recent outage date

## Expected
- At least one outage record has a date in 2024 or later
- The most recent record is within 12 months of the current date
- The "Last updated" indicator on the page reflects a recent date
