---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Severity-system — Severity colors match between chart and table

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Find a "major" severity incident in the table
3. Locate the same incident's dot in the scatter chart

## Expected
- The severity color in the table matches the dot color in the chart
- Red is used for major in both places
- Amber is used for moderate in both places
- Green is used for minor in both places
