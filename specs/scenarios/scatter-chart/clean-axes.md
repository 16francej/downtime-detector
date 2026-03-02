---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Scatter-chart — Axes are clean and minimal

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Examine the scatter plot axes

## Expected
- X-axis shows year labels (2011 through 2025)
- Y-axis shows upvote counts with abbreviated labels (e.g. "1k", "2k", "5k")
- Grid lines are either absent or very subtle (light gray, dashed or dotted)
- Axis lines are thin and understated
- No heavy borders around the chart area
