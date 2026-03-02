---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-deduplication/group-same-service-7day.ts
---

# Pipeline-deduplication — Deduplication groups posts about same service within 7-day window

## Context
- Pipeline has classified three posts about GitHub outages on Jan 1, Jan 3, and Jan 5 of the same year with upvotes 500, 1200, and 300 respectively

## Steps
1. Run the deduplication step on the classified posts

## Expected
- All three posts are grouped into a single outage event
- The post with 1200 upvotes (Jan 3) is kept as the representative post
- The final dataset contains only one GitHub outage for that week
