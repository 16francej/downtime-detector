---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Scatter-chart — Chart has a concise heading

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Look at the area above the scatter plot

## Expected
- The chart has a heading or label that concisely describes what it shows
- The heading is not overly verbose (no long descriptions like "Scatter plot of N outage events — X axis: date, Y axis: HN upvotes")
- The heading fits the warm minimal tone (e.g. just "Timeline" or "Outage Timeline")
