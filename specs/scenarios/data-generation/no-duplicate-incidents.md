---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-generation/no-duplicate-incidents.ts
---

# Data-generation — No duplicate incidents in generated data

## Context
- The pipeline has run and produced `public/outages.json`
- Deduplication should ensure no duplicate incidents exist

## Steps
1. Read `public/outages.json`
2. Check all `id` fields are unique
3. Check all `hn_url` fields are unique
4. Check no same-service entries exist within 7 days of each other

## Expected
- All `id` values are unique
- All `hn_url` values are unique
- No two entries for the same service are within 7 days of each other
