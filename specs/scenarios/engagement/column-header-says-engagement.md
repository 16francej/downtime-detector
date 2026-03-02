---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Engagement — Table column header says "Engagement" not "Severity"

## Context
- The severity column has been renamed to "HN Engagement"
- This accurately reflects that the metric is based on HN upvotes, not actual outage impact

## Steps
1. Navigate to the homepage at /
2. Wait for the outage table to load
3. Inspect the table column headers

## Expected
- Table has a column header labeled "Engagement" (not "Severity")
- The word "Severity" does not appear as a column header
