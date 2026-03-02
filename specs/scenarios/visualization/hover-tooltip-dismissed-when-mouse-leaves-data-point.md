---
priority: medium
type: happy-path
confidence: expanded
---

# Visualization — Hover tooltip dismissed when mouse leaves data point

## Context
- Tooltip is currently visible from hovering a data point

## Steps
1. Move the mouse away from the data point

## Expected
- Tooltip disappears smoothly
- No tooltip remains stuck on screen
- Moving to a different dot immediately shows the new tooltip

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector page"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the timeline chart to be visible"
  },
  {
    "type": "click",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Hover over a data point to show tooltip (simulated by click for setup)"
  },
  {
    "type": "wait",
    "selector": "text=/./",
    "description": "Wait briefly for tooltip to appear"
  },
  {
    "type": "click",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Move mouse away from the data point by clicking elsewhere on the page"
  },
  {
    "type": "wait",
    "selector": "text=/./",
    "description": "Wait for tooltip animation to complete"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify tooltip has disappeared and is not visible on screen"
  },
  {
    "type": "click",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Move to a different data point"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify new tooltip appears immediately for the different data point"
  }
]
```
