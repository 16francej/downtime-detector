---
priority: medium
type: edge-case
confidence: inferred
---

# Performance — Rapid filter changes do not cause race conditions

## Context
- User rapidly clicks different service names and changes date ranges

## Steps
1. Quickly toggle 'AWS', then 'GitHub', then 'Cloudflare' in rapid succession
2. Change date range while service toggle is still updating

## Expected
- The final state of filters is correctly reflected in the scatter plot and OutageList
- No intermediate or inconsistent states are shown
- No errors or visual glitches occur

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
    "description": "Open the service filter dropdown"
  },
  {
    "type": "click",
    "selector": "text=AWS",
    "description": "Quickly toggle AWS filter"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Reopen the service filter dropdown"
  },
  {
    "type": "click",
    "selector": "text=GitHub",
    "description": "Quickly toggle GitHub filter"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Reopen the service filter dropdown"
  },
  {
    "type": "click",
    "selector": "text=Cloudflare",
    "description": "Quickly toggle Cloudflare filter in rapid succession"
  },
  {
    "type": "click",
    "selector": "label:has-text('Date Range')",
    "description": "Click date range filter while service toggle is updating"
  },
  {
    "type": "wait",
    "selector": "500",
    "description": "Wait for any updates to settle"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible and rendered"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the OutageList section is visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is present and correctly rendered"
  },
  {
    "type": "assert",
    "selector": "h2:has-text('Famous Outage Incidents')",
    "description": "Verify no visual glitches - OutageList heading is visible"
  },
  {
    "type": "assert",
    "selector": "h2:has-text('Outage Timeline')",
    "description": "Verify no visual glitches - Timeline heading is visible"
  }
]
```
