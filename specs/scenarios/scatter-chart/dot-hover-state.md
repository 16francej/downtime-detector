---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Scatter-chart — Dots have a visible hover state

## Context
- App is loaded with outage data in the chart

## Steps
1. Navigate to the homepage
2. Move the mouse cursor over a scatter plot dot

## Expected
- The hovered dot visually changes (e.g. grows slightly, gains an outline, or increases opacity)
- The cursor changes to a pointer on hover
- Non-hovered dots may dim slightly to emphasize the hovered dot
