---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-generation/year-coverage.ts
---

# Data-generation — Year coverage has no multi-year gaps

## Context
- The pipeline has run and produced `public/outages.json`
- The dataset should cover a wide time range without large gaps

## Steps
1. Read `public/outages.json`
2. Extract unique years from all outage dates
3. Check for gaps between consecutive years

## Expected
- At least 1 outage per year from 2008 to 2025
- No gap of 2+ consecutive missing years
