---
priority: high
type: happy-path
confidence: expanded
verification:
  - browser
---

# Incident-table — Table updates when filters are applied

## Context
- App is loaded with all outage data

## Steps
1. Navigate to the homepage
2. Select "AWS" from the service filter
3. Observe the incident table

## Expected
- Only AWS incidents appear in the table
- The table heading or a visible indicator reflects the filtered state
- Severity indicators and formatting remain consistent
