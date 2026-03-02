---
priority: medium
type: edge-case
confidence: expanded
verification:
  - script: specs/scripts/data-quality/summaries-meaningful.ts
---

# Data Quality — No two summaries are identical

## Context
- Each outage is a distinct event and should have a unique summary
- Duplicate summaries indicate templated or broken generation

## Steps
1. Load the outages dataset from public/outages.json
2. Collect all summary values
3. Check for duplicates

## Expected
- All summaries are unique (no two records share the same summary text)
