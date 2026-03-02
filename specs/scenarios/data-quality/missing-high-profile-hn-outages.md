---
priority: high
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/missing-hn-outages.ts
---

# Data-quality — No missing high-profile HN outage posts

## Context
- The dataset should cover all major outage discussions on Hacker News
- High-engagement posts (≥1000 points) about tracked services represent widely-known incidents that should not be absent

## Steps
1. Load the outage data from public/outages.json
2. Extract existing HN item IDs from hn_url fields
3. Query the HN Algolia API for outage-related keywords ("outage", "is down", "incident")
4. Filter API results to posts with ≥1000 points about services already tracked in the dataset
5. Compare API results against existing dataset entries

## Expected
- All high-profile HN outage posts (≥1000 points) for tracked services are present in the dataset
- If the HN API is unreachable, the check skips gracefully with a warning rather than failing
