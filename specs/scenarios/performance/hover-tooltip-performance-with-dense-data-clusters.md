---
priority: medium
type: edge-case
confidence: expanded
---

# Performance — Hover tooltip performance with dense data clusters

## Context
- Multiple outages cluster around the same date and upvote range (e.g., a major AWS outage week)

## Steps
1. Hover over a cluster of overlapping dots in the scatter plot

## Expected
- Tooltip shows for the topmost or nearest dot
- No flickering or rapid tooltip switching
- User can distinguish which dot the tooltip belongs to

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
    "description": "Wait for the scatter plot SVG to be visible"
  },
  {
    "type": "wait",
    "selector": "role=table",
    "description": "Wait for the outage table to load, indicating data is ready"
  },
  {
    "type": "hover",
    "selector": "svg[role='img'] circle",
    "description": "Hover over a cluster of overlapping dots in the scatter plot"
  },
  {
    "type": "wait",
    "timeout": 500,
    "description": "Wait briefly to allow tooltip to appear and stabilize"
  },
  {
    "type": "assert",
    "selector": "[role='tooltip'], [data-tooltip], .tooltip",
    "description": "Verify tooltip is visible for the topmost or nearest dot"
  },
  {
    "type": "wait",
    "timeout": 1000,
    "description": "Wait to observe no flickering or rapid tooltip switching occurs"
  },
  {
    "type": "assert",
    "selector": "[role='tooltip'], [data-tooltip], .tooltip",
    "description": "Verify tooltip remains stable and user can distinguish which dot it belongs to"
  }
]
```
