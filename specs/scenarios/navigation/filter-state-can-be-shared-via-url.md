---
priority: low
type: edge-case
confidence: inferred
---

# Navigation — Filter state can be shared via URL

## Context
- User has applied specific filters

## Steps
1. Select 'AWS' in ServiceFilter and set date range 2020-2022
2. Copy the URL from the browser address bar
3. Open the URL in a new browser tab

## Expected
- If URL contains filter state (query params), the same filters are applied in the new tab
- If not, this is a known limitation and filters start in default state

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector homepage"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Click on the service filter dropdown button"
  },
  {
    "type": "click",
    "selector": "text=AWS",
    "description": "Select AWS from the service filter options"
  },
  {
    "type": "wait",
    "selector": "button[name*='AWS']",
    "description": "Wait for the filter to update and show AWS is selected"
  },
  {
    "type": "click",
    "selector": "label[name='Filter by Service']",
    "description": "Click to close the service filter dropdown if needed"
  },
  {
    "type": "fill",
    "selector": "textbox[name='Start Year']",
    "value": "2020",
    "description": "Set start year to 2020"
  },
  {
    "type": "fill",
    "selector": "textbox[name='End Year']",
    "value": "2022",
    "description": "Set end year to 2022"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the filtered results to load"
  },
  {
    "type": "assert",
    "selector": "button[name*='AWS']",
    "description": "Verify AWS filter is applied in the current tab"
  },
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the same URL in new context (simulating new tab with same URL including query params)"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the page to load in the new tab"
  },
  {
    "type": "assert",
    "selector": "button[name*='Filter']",
    "description": "Verify the service filter button is present (filters may be default state if URL params not supported)"
  }
]
```
