---
priority: medium
type: edge-case
confidence: inferred
verification:
  - browser
---

# Header-layout — Stats reflect filtered state or stay fixed

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Note the stats in the header (incident count, service count)
3. Apply a service filter (e.g. select "AWS")

## Expected
- Stats either update to reflect the filtered data OR stay fixed showing the total dataset
- If stats stay fixed, this is acceptable — they represent the overall dataset
- Stats do not show incorrect or stale numbers
