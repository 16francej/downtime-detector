---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-false-positives.ts
---

# Data Quality — No CEO/executive "stepping down" records in dataset

## Context
- The outage dataset should only contain actual service outages
- Records about executives stepping down are false positives from keyword matching "down"

## Steps
1. Load the outages dataset from public/outages.json
2. Check every record title for "stepping down" pattern
3. Verify no records match

## Expected
- Zero records contain "stepping down" in their title
- All records represent actual service outages, not personnel changes
