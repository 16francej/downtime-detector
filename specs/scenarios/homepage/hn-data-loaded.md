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

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the outage list section to be visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is present"
  },
  {
    "type": "assert",
    "selector": "role=row",
    "description": "Verify at least 30 outage entries are displayed (counting table rows excluding header)"
  },
  {
    "type": "click",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Click the service filter dropdown to open it"
  },
  {
    "type": "wait",
    "selector": "role=option",
    "description": "Wait for filter options to appear"
  },
  {
    "type": "assert",
    "selector": "role=option",
    "description": "Verify at least 8 different service options are available in the dropdown"
  },
  {
    "type": "keyboard",
    "key": "Escape",
    "description": "Close the dropdown"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the table contains more than 7 rows, indicating HN-sourced data is present"
  },
  {
    "type": "assert",
    "selector": "text=/\\d+\\s*(points|comments)/i",
    "description": "Verify engagement metrics (points or comment counts) are visible in the table"
  }
]
```
