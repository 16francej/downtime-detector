---
priority: medium
type: edge-case
confidence: inferred
verification:
  - browser
---

# Scatter-chart — Empty state when filters match nothing

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Set a date range that includes no outages (e.g. From: 2030-01-01, To: 2030-12-31)

## Expected
- The chart area shows gracefully — either empty axes or a "No matching outages" message
- The chart does not crash or show rendering artifacts
- The table also shows an appropriate empty state
