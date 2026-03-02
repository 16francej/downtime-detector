---
priority: low
type: edge-case
confidence: inferred
---

# Navigation — Browser back button after interacting with filters

## Context
- User has applied filters to the scatter plot and OutageList

## Steps
1. Select a service in ServiceFilter
2. Set a date range
3. Press the browser back button

## Expected
- Application handles navigation gracefully
- Either filters are reset or the URL reflects filter state via query parameters
- No JavaScript errors or blank page

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the application home page"
  },
  {
    "type": "wait",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Wait for the service filter button to be visible"
  },
  {
    "type": "click",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Click the service filter dropdown trigger"
  },
  {
    "type": "wait",
    "selector": "role=option",
    "description": "Wait for filter options to appear"
  },
  {
    "type": "click",
    "selector": "role=option >> nth=0",
    "description": "Select the first service option from the dropdown"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to be visible after filter application"
  },
  {
    "type": "keyboard",
    "key": "Alt+ArrowLeft",
    "description": "Press the browser back button (using keyboard shortcut)"
  },
  {
    "type": "wait",
    "selector": "role=main",
    "description": "Wait for the main content to be visible after navigation"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify the main heading is visible - application loaded gracefully"
  },
  {
    "type": "assert",
    "selector": "role=button[name*='Filter:']",
    "description": "Verify the service filter button is visible - no blank page"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible - page rendered correctly"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the outage list section is visible - no JavaScript errors"
  }
]
```
