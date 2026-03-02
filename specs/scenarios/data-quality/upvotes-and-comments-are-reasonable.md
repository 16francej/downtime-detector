---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/engagement-ranges.ts
---

# Data-quality — Upvote and comment counts are within reasonable ranges

## Context
- Upvotes and comments come from HN and should reflect real engagement levels
- Unrealistic values suggest fabricated data

## Steps
1. Load the outage data from public/outages.json
2. Check the range of upvotes and comments

## Expected
- All upvotes are non-negative integers
- All comments are non-negative integers
- No record has upvotes exceeding 10,000 (HN's practical upper bound for outage posts)
- At least 25% of records have upvotes > 500 (outage posts tend to get significant engagement)
- The ratio of comments to upvotes is between 0.05 and 2.0 for each record
