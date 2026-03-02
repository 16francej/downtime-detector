---
priority: high
type: happy-path
confidence: expanded
verification:
  - browser
---

# Scatter-chart — Chart updates when filters are applied

## Context
- App is loaded with all outage data

## Steps
1. Navigate to the homepage
2. Select a specific service from the filter dropdown (e.g. "AWS")
3. Observe the scatter plot

## Expected
- The chart only shows dots for the filtered service
- The Y-axis may rescale to fit the filtered data
- Severity coloring remains consistent on filtered results
- Dot sizing by engagement still applies
