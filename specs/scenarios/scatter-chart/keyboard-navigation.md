---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Scatter-chart — Keyboard navigation works on dots

## Context
- App is loaded with outage data in the chart

## Steps
1. Navigate to the homepage
2. Tab into the chart area
3. Use arrow keys to move between data points
4. Press Enter or Space on a focused dot

## Expected
- Data points are keyboard-focusable
- Focused dot shows a visible focus indicator
- Arrow keys navigate between dots
- Enter or Space on a focused dot shows the tooltip or detail
- Escape closes any open tooltip
