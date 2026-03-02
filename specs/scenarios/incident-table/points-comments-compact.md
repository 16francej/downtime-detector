---
priority: medium
type: happy-path
confidence: direct
verification:
  - browser
---

# Incident-table — Points and comments displayed compactly

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Look at the points and comments columns in the table

## Expected
- Point counts are displayed as plain numbers without "points" suffix (e.g. "1,456" not "1456 points")
- Comment counts are displayed as plain numbers without "comments" suffix
- Numbers use locale formatting (comma-separated thousands) or abbreviated format
