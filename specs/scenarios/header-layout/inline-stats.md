---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Header-layout — Inline stats shown below title

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Look at the header area below the title

## Expected
- A subtitle line shows key dataset stats: the total number of incidents, the number of services tracked, and the date range (e.g. "since 2011")
- Stats are separated by a visual delimiter (dot, dash, or similar)
- The stats text is smaller and lighter weight than the title
