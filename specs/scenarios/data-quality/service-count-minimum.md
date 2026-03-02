---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/service-count-minimum.ts
---

# Data-quality — Dataset covers at least 15 distinct services

## Context
- A diverse set of services makes the tracker more useful
- The current 23 services is decent but thin with many having only 1 entry

## Steps
1. Load the outage data from public/outages.json
2. Count unique service names

## Expected
- At least 15 distinct services are represented
- At least 5 services have 3 or more outage entries
