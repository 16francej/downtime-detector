---
priority: medium
type: edge-case
confidence: inferred
verification:
  - browser
---

# UI-responsiveness — Chart remains readable on narrow viewports

## Context
- Browser viewport is set to tablet width (~768px)

## Steps
1. Navigate to the homepage on a tablet-width viewport
2. Examine the scatter plot

## Expected
- Chart scales down proportionally without overlapping labels
- Axis labels remain readable
- Dots remain distinguishable (not overlapping into a blob)
