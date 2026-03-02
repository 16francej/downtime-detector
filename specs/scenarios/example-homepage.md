---
priority: high
type: happy-path
confidence: direct
---

# Example — Homepage loads successfully

## Context
- User is not logged in
- No special data requirements

## Steps
1. Navigate to the homepage
2. Wait for the page to fully load

## Expected
- Page title is visible
- No console errors
- Page loads within 3 seconds

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=heading[name=\"Downtime Detector\"]",
    "description": "Wait for the page to fully load by checking main heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name=\"Downtime Detector\"]",
    "description": "Verify page title is visible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name=\"Outage Timeline\"]",
    "description": "Verify timeline heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name=\"Famous Outage Incidents\"]",
    "description": "Verify outage incidents section is visible"
  }
]
```
