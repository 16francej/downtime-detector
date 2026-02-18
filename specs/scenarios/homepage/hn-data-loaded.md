---
priority: high
type: happy-path
confidence: direct
---

# Homepage — HN data loaded with multiple services

## Context
- The app has been enriched with outage data scraped from Hacker News
- Data is stored in a local JSON file that the app reads at build/render time
- Original hardcoded outages are preserved alongside HN-sourced entries

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load

## Expected
- The outage list displays at least 30 outage entries total
- The service filter dropdown lists at least 8 different services
- Entries sourced from Hacker News are present in the list (not just the original 7 hardcoded outages)
- The data includes engagement metrics — at least some rows show points or comment counts
