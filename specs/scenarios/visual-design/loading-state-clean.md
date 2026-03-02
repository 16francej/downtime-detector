---
priority: medium
type: edge-case
confidence: inferred
verification:
  - browser
---

# Visual-design — Loading state matches aesthetic

## Context
- App is loading data from /outages.json

## Steps
1. Navigate to the homepage (potentially with throttled network)

## Expected
- Any loading spinner or indicator matches the warm minimal aesthetic
- Loading state does not flash a white background before the cream appears
- The page feels consistent from first paint through data load
