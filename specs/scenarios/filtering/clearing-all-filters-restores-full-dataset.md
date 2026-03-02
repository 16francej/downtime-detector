---
priority: medium
type: happy-path
confidence: expanded
---

# Filtering — Clearing all filters restores full dataset

## Context
- A service filter and date range filter are both active

## Steps
1. Clear the service filter selection
2. Clear or reset the date range filter

## Expected
- All data points reappear on the scatter plot
- OutageList shows the full list of outages
- X axis returns to the full 10-year range

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector application"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Click the service filter button to open the dropdown"
  },
  {
    "type": "click",
    "selector": "text=All Services",
    "description": "Select 'All Services' option to clear the service filter"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to update after clearing service filter"
  },
  {
    "type": "assert",
    "selector": "text=2011",
    "description": "Verify the X axis shows the start of the full 10-year range (2011)"
  },
  {
    "type": "assert",
    "selector": "text=2023",
    "description": "Verify the X axis shows the end of the full 10-year range (2023)"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the OutageList section is visible with the full list of outages"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is visible showing all data points"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible with all data points restored"
  }
]
```
