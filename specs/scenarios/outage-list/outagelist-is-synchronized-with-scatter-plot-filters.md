---
priority: high
type: happy-path
confidence: direct
---

# Outage-list — OutageList is synchronized with scatter plot filters

## Context
- ServiceFilter is set to a specific service

## Steps
1. Select 'Google' from the ServiceFilter
2. Observe the OutageList component

## Expected
- OutageList only shows outages attributed to Google
- The count of items matches the number of visible dots on the scatter plot

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
    "selector": "text=Google",
    "description": "Select 'Google' from the service filter options"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the OutageList component to update"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents'] >> role=table",
    "description": "Verify that the OutageList table is visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents'] >> text=Google",
    "description": "Verify that OutageList contains Google-related outages"
  }
]
```
