---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/title-quality.ts
---

# Data-quality — Titles are descriptive and not generic placeholders

## Context
- Titles are displayed in the outage table and tooltips
- Generic titles like "service outage" provide no useful information

## Steps
1. Load the outage data from public/outages.json
2. Check each title for quality

## Expected
- Every title is at least 20 characters long
- No two titles are identical
- Every title contains a reference to the service or a specific detail about the outage
- No title is a generic placeholder like "outage" or "service down"
