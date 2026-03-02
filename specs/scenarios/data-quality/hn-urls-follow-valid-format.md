---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/hn-url-format.ts
---

# Data-quality — HN URLs follow valid Hacker News item format

## Context
- Each outage record links to a Hacker News discussion
- URLs must follow the pattern https://news.ycombinator.com/item?id=NUMERIC_ID

## Steps
1. Load the outage data from public/outages.json
2. Validate each hn_url field

## Expected
- Every hn_url matches the pattern `https://news.ycombinator.com/item?id=\d+`
- No hn_url is empty or malformed
- Each HN item ID is a positive integer
