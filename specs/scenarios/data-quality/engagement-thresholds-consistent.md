---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/engagement-thresholds.ts
---

# Data Quality — Engagement levels match upvote thresholds

## Context
- Engagement is derived from upvotes: >1000 = high, >300 = medium, else low
- All records should have consistent engagement assignments

## Steps
1. Load the outages dataset from public/outages.json
2. For each record, verify engagement matches the upvote threshold rules

## Expected
- Records with >1000 upvotes have "high" engagement
- Records with 301-1000 upvotes have "medium" engagement
- Records with <=300 upvotes have "low" engagement
- No mismatches exist
