---
priority: high
type: happy-path
confidence: direct
---

# Data-loading — Static JSON file loads correctly on initial page load

## Context
- The outage data JSON file exists in the repo and is well-formed

## Steps
1. Open the application at route '/'

## Expected
- Data is fetched and parsed without errors
- Scatter plot and OutageList are populated with the data
- No console errors related to JSON parsing

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
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Wait for the timeline heading to be visible, indicating the page has loaded"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot is populated (SVG chart is visible)"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify OutageList section is present"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is populated with data"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify main heading is visible, confirming page rendered correctly"
  }
]
```
