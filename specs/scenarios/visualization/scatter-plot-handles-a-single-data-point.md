---
priority: low
type: edge-case
confidence: expanded
---

# Visualization — Scatter plot handles a single data point

## Context
- Static JSON file contains only one outage record

## Steps
1. Open the application at route '/'

## Expected
- Scatter plot renders with one dot
- Axes are scaled appropriately for a single point
- Tooltip works on the single dot
- No errors or awkward rendering

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
    "description": "Wait for the scatter plot SVG to be visible"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot renders (SVG is present)"
  },
  {
    "type": "assert",
    "selector": "svg[role='img'] circle, svg[role='img'] path[d*='M']",
    "description": "Verify scatter plot has at least one data point (dot/circle rendered)"
  },
  {
    "type": "assert",
    "selector": "svg[role='img'] text",
    "description": "Verify axes are rendered with text labels (years like 2011, 2023)"
  },
  {
    "type": "click",
    "selector": "svg[role='img'] circle, svg[role='img'] path[d*='M']",
    "description": "Hover/click on the single data point to trigger tooltip"
  },
  {
    "type": "wait",
    "selector": "text=/AWS|Google|Facebook|PlayStation|GitHub|Slack|Cloudflare|Microsoft/i",
    "description": "Wait for tooltip to appear with service name or outage details"
  },
  {
    "type": "assert",
    "selector": "text=/AWS|Google|Facebook|PlayStation|GitHub|Slack|Cloudflare|Microsoft|outage|incident/i",
    "description": "Verify tooltip displays meaningful content for the single data point"
  }
]
```
