---
priority: low
type: happy-path
confidence: expanded
---

# Ui-responsiveness — Responsive layout on tablet viewport

## Context
- User opens the application on a tablet device (viewport width ~768px)

## Steps
1. Open the application on a tablet-sized viewport

## Expected
- Layout adapts gracefully between mobile and desktop views
- Scatter plot is usable with touch interactions
- All components are visible and functional

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application"
  },
  {
    "type": "wait",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Wait for page to load"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify main heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter button is visible and functional"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot is visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify outage incidents section is visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify outage table is visible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Verify timeline heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Famous Outage Incidents']",
    "description": "Verify outage list heading is visible"
  }
]
```
