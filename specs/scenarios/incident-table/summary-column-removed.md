---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Incident-table — Summary column is removed

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Scroll to the incident table

## Expected
- The table does not have a "Summary" column
- Table columns are: Service, Post Title, Date, Severity, Points, Comments (or similar reduced set)
- The table feels less cramped without the summary text
