---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-false-positives.ts
---

# Data Quality — All records represent actual service outages

## Context
- Every record in the dataset must be an actual service outage or incident
- No personnel changes, stock movements, product launches, or opinion pieces

## Steps
1. Load the outages dataset from public/outages.json
2. Run all false positive pattern checks against every record title
3. Verify zero matches

## Expected
- Zero records match any known false positive pattern
- Every record title relates to an actual service outage, downtime, or incident
