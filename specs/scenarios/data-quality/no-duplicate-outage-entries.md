---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-duplicate-entries.ts
---

# Data-quality — No duplicate outage entries for same service and date

## Context
- Each outage record should represent a distinct incident
- Two records with the same service and date likely represent a duplicate

## Steps
1. Load the outage data from public/outages.json
2. Check for records with the same service + date combination

## Expected
- No two records have both the same service name AND the same date
- Each (service, date) pair is unique in the dataset
