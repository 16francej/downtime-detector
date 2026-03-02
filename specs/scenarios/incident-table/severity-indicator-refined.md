---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Incident-table — Severity shown as refined indicator

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Look at the severity column in the table

## Expected
- Engagement is shown as a colored dot, small badge, or similar compact indicator — not a large pill
- Colors match the scatter chart: red for High, amber for Medium, green for Low
- The engagement label text (High/Medium/Low) is visible alongside or near the indicator
