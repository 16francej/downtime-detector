---
priority: medium
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-deduplication/different-outages-same-window.ts
---

# Pipeline-deduplication — Deduplication handles different outages of same service in same 7-day window

## Context
- Two GitHub outages occur within 3 days but are actually distinct incidents (e.g., DNS issue on day 1, database issue on day 3)

## Steps
1. Run the deduplication step on the classified posts

## Expected
- The deduplication logic groups them by service and 7-day window
- Only the most upvoted post is retained (as per business rules)
- A note or log acknowledges the limitation that distinct incidents may be merged
