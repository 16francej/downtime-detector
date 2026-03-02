---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/urls-valid.ts
---

# Data Quality — All HN URLs point to valid HN items

## Context
- Every record has an hn_url field pointing to a Hacker News discussion
- These URLs should all follow the correct format

## Steps
1. Load the outages dataset from public/outages.json
2. Check every hn_url follows the pattern https://news.ycombinator.com/item?id=NNNN
3. Verify no duplicate HN URLs exist

## Expected
- All hn_url values start with "https://news.ycombinator.com/item?id="
- All hn_url values are unique (no duplicate HN posts)
- No hn_url values are empty or malformed
