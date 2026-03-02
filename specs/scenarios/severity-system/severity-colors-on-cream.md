---
priority: high
type: edge-case
confidence: expanded
verification:
  - browser
---

# Severity-system — Severity colors are visible on cream background

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Look at severity dots/badges in the table and chart dots on the cream background

## Expected
- All three severity colors (red, amber, green) are clearly visible against the #f6f6ef cream background
- No severity color blends into or is hard to distinguish from the background
- Green (minor) in particular maintains sufficient contrast on the warm background
