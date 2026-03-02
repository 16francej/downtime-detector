---
priority: low
type: edge-case
confidence: inferred
verification:
  - browser
---

# Data Loading — Page handles empty dataset gracefully

## Context
- If outages.json contained an empty array, the page should handle it gracefully
- All components should show appropriate empty states

## Steps
1. Navigate to the homepage at / (with empty dataset)
2. Observe the page behavior

## Expected
- Page loads without JavaScript errors
- Timeline shows an empty state or message
- Table shows "No outage data available" message
- Filter dropdown shows no services
- No console errors
