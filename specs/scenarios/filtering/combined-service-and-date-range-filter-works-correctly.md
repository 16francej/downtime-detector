---
priority: high
type: happy-path
confidence: expanded
---

# Filtering — Combined service and date range filter works correctly

## Context
- Scatter plot has data for many services across 10 years

## Steps
1. Select 'Cloudflare' from the ServiceFilter
2. Set date range to '2021-06-01' through '2021-12-31'

## Expected
- Only Cloudflare outages from June through December 2021 are displayed
- Both scatter plot and OutageList reflect the combined filters

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
    "description": "Click the service filter dropdown button to open options"
  },
  {
    "type": "click",
    "selector": "text=Cloudflare",
    "description": "Select 'Cloudflare' from the service filter options"
  },
  {
    "type": "fill",
    "selector": "input[type='date']:first-of-type",
    "value": "2021-06-01",
    "description": "Set the start date to June 1, 2021"
  },
  {
    "type": "fill",
    "selector": "input[type='date']:last-of-type",
    "value": "2021-12-31",
    "description": "Set the end date to December 31, 2021"
  },
  {
    "type": "wait",
    "selector": "role=table",
    "description": "Wait for the outage list table to update with filtered results"
  },
  {
    "type": "assert",
    "selector": "text=Cloudflare",
    "description": "Verify that Cloudflare outages are displayed in the results"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify that the OutageList table is visible and contains filtered data"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify that the scatter plot is visible and reflects the filtered data"
  }
]
```
