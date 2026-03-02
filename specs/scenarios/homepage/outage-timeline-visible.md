---
priority: high
type: happy-path
confidence: direct
---

# Homepage — Outage timeline is visible

## Context
- User navigates to the homepage
- Hardcoded outage data is available

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load

## Expected
- A timeline or chart visualization is visible on the page
- The visualization shows data points representing outages
- At least 5 outage events are displayed in the visualization

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the timeline visualization to load"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify that the timeline/chart visualization is visible on the page"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Verify that the timeline section heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify that the outage incidents section is visible showing data points"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify that the table containing outage events is displayed"
  }
]
```
