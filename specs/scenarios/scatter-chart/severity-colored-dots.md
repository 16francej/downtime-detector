---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Scatter-chart — Dots are colored by severity

## Context
- App is loaded with all outage data (no filters)

## Steps
1. Navigate to the homepage
2. Look at the scatter plot chart

## Expected
- Dots use three colors based on severity: red for major, amber/orange for moderate, green for minor
- No service-specific colors are used — all differentiation is by severity
- The three severity colors are clearly distinguishable from each other and from the cream background
