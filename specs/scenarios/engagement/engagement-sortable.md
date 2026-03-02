---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Engagement — Engagement column is sortable

## Context
- The engagement column should be sortable like the old severity column
- Sorting order: High > Medium > Low

## Steps
1. Navigate to the homepage at /
2. Wait for the outage table to load
3. Click the "Engagement" column header to sort ascending
4. Click again to sort descending

## Expected
- Clicking the header sorts rows by engagement level
- Ascending sort shows Low entries first, then Medium, then High
- Descending sort shows High entries first, then Medium, then Low
- Sort direction indicator appears on the column header
