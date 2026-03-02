---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Header-layout — Header uses minimal vertical space

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Measure how much vertical space the header takes before the first content section

## Expected
- The header (title + stats) takes no more than roughly 80-120px of vertical space
- The filter controls and chart are visible quickly without excessive scrolling
- There is no oversized top padding or spacing above the title
