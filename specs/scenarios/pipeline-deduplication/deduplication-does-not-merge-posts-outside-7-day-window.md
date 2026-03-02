---
priority: high
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-deduplication/no-merge-outside-7day.ts
---

# Pipeline-deduplication — Deduplication does not merge posts outside 7-day window

## Context
- Pipeline has classified two posts about GitHub outages: one on Jan 1 and one on Jan 15

## Steps
1. Run the deduplication step on the classified posts

## Expected
- Two separate outage events are created for GitHub
- Both posts appear in the final dataset as distinct outages
