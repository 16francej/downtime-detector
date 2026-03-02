---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Filter-design — Selected services shown as removable chips

## Context
- App is loaded and a service has been selected

## Steps
1. Navigate to the homepage
2. Select "AWS" from the service filter
3. Select "Google" from the service filter

## Expected
- Selected services appear as small chips/tags near the filter
- Each chip has a way to remove/deselect it (X button or clickable)
- Chip styling matches the warm minimal aesthetic (no harsh colors)
