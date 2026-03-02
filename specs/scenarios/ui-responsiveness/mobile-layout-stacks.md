---
priority: medium
type: edge-case
confidence: inferred
verification:
  - browser
---

# UI-responsiveness — Layout stacks on mobile viewports

## Context
- Browser viewport is set to mobile width (375px)

## Steps
1. Navigate to the homepage on a narrow viewport (375px wide)

## Expected
- Header, filters, chart, and table stack vertically
- No horizontal scrolling is required for the main layout
- Filter controls stack or wrap appropriately
- Content remains readable at mobile width
