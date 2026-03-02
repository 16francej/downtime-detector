---
priority: high
type: edge-case
confidence: inferred
verification:
  - browser
---

# Accessibility — Interactive elements have visible focus states

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Tab through interactive elements (filter dropdown, date inputs, chart dots, table links)

## Expected
- Every interactive element shows a visible focus indicator when tabbed to
- Focus rings or outlines are visible against the cream background
- Focus states do not rely solely on color change
