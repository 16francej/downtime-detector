---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Scatter-chart — Legend shows severity color meanings

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Look for the chart legend

## Expected
- A legend displays the three severity levels with their corresponding colors: major (red), moderate (amber), minor (green)
- The legend is compact and positioned near the chart (above, below, or inline)
- The legend does NOT list individual services — only the three severity categories
