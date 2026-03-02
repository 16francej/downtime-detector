---
priority: low
type: edge-case
confidence: inferred
verification:
  - browser
---

# Visual-design — Dark mode preference does not break styling

## Context
- User has system dark mode preference enabled

## Steps
1. Set system to dark mode
2. Navigate to the homepage

## Expected
- Page either shows a dark mode variant with appropriate color inversions, or consistently stays in the cream/light mode
- There is no flash of unstyled content or mixed light/dark elements
- If dark mode is supported, severity colors remain distinguishable
