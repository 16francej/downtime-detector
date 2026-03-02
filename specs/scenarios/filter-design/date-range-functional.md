---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Filter-design — Date range inputs filter data correctly

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Enter a start date of 2020-01-01 in the "From" field
3. Enter an end date of 2022-12-31 in the "To" field

## Expected
- Both the chart and table update to show only incidents within the date range
- Incidents outside the range are not displayed
- The chart X-axis may adjust to reflect the filtered time window
