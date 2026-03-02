---
priority: high
type: happy-path
confidence: expanded
verification:
  - browser
---

# Incident-table — Each row links to HN discussion

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Find a row in the incident table
3. Look for the HN discussion link

## Expected
- Each incident row includes a link to the Hacker News discussion
- The link is accessible (clickable, has href) and opens in a new tab
- The link is styled subtly (not a large button)
