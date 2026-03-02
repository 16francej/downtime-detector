---
priority: high
type: happy-path
confidence: direct
---

# Filtering — ServiceFilter filters scatter plot by a single service

## Context
- Scatter plot displays data points for multiple services
- ServiceFilter component is visible

## Steps
1. Select 'AWS' from the ServiceFilter component

## Expected
- Only dots corresponding to AWS outages remain visible on the scatter plot
- Other service dots are hidden or dimmed
- OutageList updates to show only AWS outages

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the main page"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Click the service filter button to open dropdown"
  },
  {
    "type": "click",
    "selector": "text=AWS",
    "description": "Select AWS from the dropdown options"
  },
  {
    "type": "assert",
    "selector": "button[name='Filter: AWS']",
    "description": "Verify filter button shows AWS is selected"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot is still visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify OutageList section is present and updated"
  }
]
```
