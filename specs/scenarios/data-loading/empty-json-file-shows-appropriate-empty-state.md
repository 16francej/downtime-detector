---
priority: medium
type: edge-case
confidence: expanded
---

# Data-loading — Empty JSON file shows appropriate empty state

## Context
- The outage data JSON file exists but contains an empty array

## Steps
1. Open the application at route '/'

## Expected
- Scatter plot renders empty axes or a message like 'No outage data available'
- OutageList shows an empty state message
- No JavaScript errors in the console

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Open the application at route '/'"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for scatter plot SVG to render"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify OutageList region is present"
  },
  {
    "type": "assert",
    "selector": "text=No outage data available",
    "description": "Verify empty state message is displayed in the outage list or chart area"
  }
]
```
