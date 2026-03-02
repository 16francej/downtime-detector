---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Scatter-chart — Hover tooltip shows incident details

## Context
- App is loaded with outage data visible in the chart

## Steps
1. Navigate to the homepage
2. Hover over a dot in the scatter plot

## Expected
- A tooltip appears showing the incident title, service name, date, and severity
- The tooltip also shows the upvote and comment counts
- Tooltip styling is clean and matches the warm minimal aesthetic (no heavy shadows)
- Tooltip disappears when the mouse moves away from the dot
