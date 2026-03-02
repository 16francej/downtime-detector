---
priority: medium
type: edge-case
confidence: inferred
verification:
  - browser
---

# UI-responsiveness — Table scrolls horizontally on narrow viewports

## Context
- Browser viewport is set to mobile width (375px)

## Steps
1. Navigate to the homepage on a narrow viewport
2. Scroll to the incident table

## Expected
- The table is horizontally scrollable if it exceeds the viewport width
- The scroll container has a visible scrollbar or shadow indicator
- Table content is not squished or overlapping
