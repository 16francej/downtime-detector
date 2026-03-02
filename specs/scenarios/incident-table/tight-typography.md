---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Incident-table — Table has tightened typography

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Inspect the incident table text sizing

## Expected
- Table body text uses a compact font size (roughly 13-14px, not the default 16px)
- Table header text is styled distinctly (uppercase, smaller, lighter color, or similar)
- Row height is compact but still comfortable to read
- Numbers (points, comments) use tabular/monospace figures for alignment
