---
priority: low
type: infrastructure
confidence: inferred
verification:
  - script: specs/scripts/data-quality/severity-engagement-correlation.ts
---

# Data-quality — Severity generally correlates with engagement metrics

## Context
- Major outages typically generate more HN engagement (upvotes, comments)
- A total disconnect between severity and engagement suggests poor classification

## Steps
1. Load the outage data from public/outages.json
2. Compute average upvotes per severity level

## Expected
- Average upvotes for "major" severity is higher than average for "minor"
- No "minor" severity outage has more upvotes than the median "major" outage
- The relationship doesn't need to be perfect, but directionally correct
