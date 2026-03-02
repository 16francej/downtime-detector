---
priority: medium
type: edge-case
confidence: expanded
verification:
  - browser
---

# Scatter Chart — Filtered view still shows reasonable axis range

## Context
- When filtering to a single service, the timeline should still show a reasonable date range
- Should not collapse to a single point if all records are from the same year

## Steps
1. Navigate to the homepage at /
2. Filter to a service with few records (e.g., "CrowdStrike")
3. Observe the timeline X-axis

## Expected
- Timeline still shows a reasonable date range (not cramped to a single year)
- Filtered dots are visible and properly positioned
- Axis labels are readable
