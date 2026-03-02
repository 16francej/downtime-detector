---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Scatter Chart — Timeline X-axis covers full data range

## Context
- The timeline X-axis was previously hardcoded to 2011-2026
- Data starts at 2008, so early records were invisible
- X-axis should be dynamic based on actual data

## Steps
1. Navigate to the homepage at /
2. Wait for the timeline scatter plot to load
3. Inspect the X-axis labels

## Expected
- X-axis starts at or before 2008 (the earliest record in the dataset)
- X-axis extends to the current year or the latest record year
- All outage dots are visible within the chart area
- No dots are rendered outside the visible X-axis range
