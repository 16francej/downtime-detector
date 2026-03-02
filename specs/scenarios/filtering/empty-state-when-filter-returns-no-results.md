---
priority: medium
type: edge-case
confidence: expanded
---

# Filtering — Empty state when filter returns no results

## Context
- Scatter plot has data but none matching the selected criteria

## Steps
1. Select a service that has no outages in the selected date range, e.g., select 'Heroku' and set date range to a month with no Heroku outages

## Expected
- Scatter plot shows no dots
- OutageList displays a meaningful empty state message such as 'No outages found matching your filters'
- No error is thrown

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector page"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Click the service filter dropdown button"
  },
  {
    "type": "click",
    "selector": "text=Heroku",
    "description": "Select Heroku from the dropdown options"
  },
  {
    "type": "wait",
    "selector": "timeout=1000",
    "description": "Wait for filter to apply and data to update"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot SVG is present"
  },
  {
    "type": "assert",
    "selector": "text=No outages found matching your filters",
    "description": "Verify empty state message is displayed in OutageList"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the outage list section is still present without errors"
  }
]
```
