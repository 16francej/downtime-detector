---
priority: high
type: edge-case
confidence: direct
verification:
  - browser
---

# Scatter Chart — Earliest records (2008-2010) are visible

## Context
- Records from 2008-2010 were previously invisible due to hardcoded 2011 start
- These early records must now appear on the chart

## Steps
1. Navigate to the homepage at /
2. Wait for the timeline to load
3. Look for dots in the leftmost portion of the chart (2008-2010 area)

## Expected
- Dots representing 2008-2010 outages are visible on the chart
- These dots are positioned correctly on the X-axis
- Hovering over them shows correct tooltip information
