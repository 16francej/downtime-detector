---
priority: high
type: happy-path
confidence: direct
---

# Visualization — Hover tooltip displays outage details on a data point

## Context
- Scatter plot is rendered with multiple data points

## Steps
1. Hover the mouse cursor over a dot in the scatter plot

## Expected
- A tooltip appears showing the HN post title
- The tooltip shows the LLM-generated outage summary
- The tooltip contains a clickable link to the original HN post
- Tooltip appears near the hovered dot without clipping off-screen

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the main page"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for scatter plot SVG to be visible"
  },
  {
    "type": "hover",
    "selector": "svg[role='img'] circle, svg[role='img'] path[d*='M']",
    "description": "Hover over a data point dot in the scatter plot"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip appears"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip contains HN post title text"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip shows LLM-generated outage summary text"
  },
  {
    "type": "assert",
    "selector": "role=tooltip >> role=link",
    "description": "Verify tooltip contains a clickable link to original HN post"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip is positioned near hovered dot and visible on screen"
  }
]
```
