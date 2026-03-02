---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Scatter-chart — Dot size varies by engagement

## Context
- App is loaded with all outage data

## Steps
1. Navigate to the homepage
2. Compare dots in the scatter plot

## Expected
- Higher-engagement outages (more upvotes) have visibly larger dots
- Lower-engagement outages have smaller dots
- The Facebook BGP outage (2589 upvotes) should be among the largest dots
- Size range is visible but not extreme — the smallest dots are still clickable
