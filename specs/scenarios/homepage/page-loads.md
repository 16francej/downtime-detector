---
priority: high
type: happy-path
confidence: direct
---

# Homepage — Page loads with title and description

## Context
- User is not logged in
- No special data requirements

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load

## Expected
- Page displays the heading "Downtime Detector"
- Page displays a subheading or description mentioning "outages" or "incidents"
- No console errors appear

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
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Wait for the page to fully load by waiting for main heading"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify page displays the heading 'Downtime Detector'"
  },
  {
    "type": "assert",
    "selector": "#main-description",
    "value": "outages",
    "description": "Verify page displays description mentioning 'outages'"
  }
]
```
