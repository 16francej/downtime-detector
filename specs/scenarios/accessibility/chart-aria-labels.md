---
priority: medium
type: edge-case
confidence: expanded
verification:
  - browser
---

# Accessibility — Chart has appropriate ARIA labels

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Inspect the scatter plot chart element

## Expected
- The chart SVG has role="img" or similar semantic role
- The chart has an aria-label or aria-labelledby that describes its content
- Individual data points are accessible to screen readers
