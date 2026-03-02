---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Incident-table — Service names are clearly readable

## Context
- App is loaded with all outage data

## Steps
1. Navigate to the homepage
2. Look at the Service column in the table

## Expected
- Service names are displayed as plain text or subtle badges
- Long service names (e.g. "Let's Encrypt", "CrowdStrike") are not truncated
- Service name styling is consistent across all rows
