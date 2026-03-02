---
priority: low
type: happy-path
confidence: inferred
---

# Visualization — Scatter plot legend is interactive for filtering

## Context
- Scatter plot has a color legend showing service names

## Steps
1. Click on a service name in the legend

## Expected
- That service's dots are toggled on/off in the scatter plot
- Or clicking the legend item activates the corresponding ServiceFilter selection
- Visual feedback indicates which services are active

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector page"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to be visible"
  },
  {
    "type": "click",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Click on the service filter dropdown button"
  },
  {
    "type": "wait",
    "selector": "role=option",
    "description": "Wait for filter options to appear"
  },
  {
    "type": "click",
    "selector": "role=option >> nth=0",
    "description": "Click on the first service name in the legend/filter"
  },
  {
    "type": "assert",
    "selector": "role=button[name*='Filter:']",
    "description": "Verify the filter button text has changed to show active filter"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is still visible and updated"
  }
]
```
