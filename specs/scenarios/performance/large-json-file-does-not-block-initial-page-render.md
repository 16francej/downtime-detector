---
priority: high
type: edge-case
confidence: direct
---

# Performance — Large JSON file does not block initial page render

## Context
- Static JSON file is very large (e.g., 5MB+ with thousands of records)

## Steps
1. Open the application at route '/'
2. Observe the initial render

## Expected
- Page shell/layout renders quickly
- Data loading does not block the main thread excessively
- User sees meaningful content or loading state within 2 seconds

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000/",
    "description": "Open the application at route '/'"
  },
  {
    "type": "wait",
    "selector": "role=main",
    "description": "Wait for main content area to be present"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify page shell/layout renders quickly - main heading is visible"
  },
  {
    "type": "assert",
    "selector": "text=Track and explore famous service outages and incidents across major tech platfor",
    "description": "Verify page shell/layout renders quickly - description text is visible"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify page shell/layout renders quickly - filter button is visible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Verify page shell/layout renders quickly - timeline heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Famous Outage Incidents']",
    "description": "Verify user sees meaningful content within 2 seconds - outage list heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify user sees meaningful content or loading state - table structure is present"
  }
]
```
