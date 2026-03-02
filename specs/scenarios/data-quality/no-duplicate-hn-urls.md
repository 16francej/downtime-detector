---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-duplicate-hn-urls.ts
---

# Data-quality — No duplicate HN URLs across records

## Context
- Each outage should reference a unique Hacker News discussion
- Duplicate hn_url values indicate the same HN post was counted twice

## Steps
1. Load the outage data from public/outages.json
2. Check for duplicate hn_url values

## Expected
- No two records share the same hn_url
- Each outage links to a distinct HN discussion thread
