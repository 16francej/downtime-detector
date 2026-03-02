---
priority: high
type: happy-path
confidence: expanded
verification:
  - browser
---

# Incident-table — Rows sorted by most recent first

## Context
- App is loaded with all outage data (no filters)

## Steps
1. Navigate to the homepage
2. Read the first few rows of the incident table

## Expected
- The most recent incidents appear at the top of the table
- Dates decrease as you scroll down the table
