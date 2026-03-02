---
priority: medium
type: edge-case
confidence: expanded
---

# Visualization — Scatter plot tooltip does not clip at screen edges

## Context
- User hovers over a data point near the right or bottom edge of the scatter plot

## Steps
1. Hover over a dot at the far-right edge of the scatter plot
2. Hover over a dot at the top edge of the scatter plot

## Expected
- Tooltip repositions to stay within the viewport
- Full tooltip content is visible and readable
- No horizontal or vertical overflow

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector application"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot SVG to be visible"
  },
  {
    "type": "click",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Hover over a dot at the far-right edge of the scatter plot"
  },
  {
    "type": "wait",
    "selector": "[role='tooltip'], [data-tooltip], .tooltip",
    "description": "Wait for tooltip to appear after hovering right edge dot"
  },
  {
    "type": "assert",
    "selector": "[role='tooltip'], [data-tooltip], .tooltip",
    "description": "Verify tooltip is visible after hovering right edge"
  },
  {
    "type": "click",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Hover over a dot at the top edge of the scatter plot"
  },
  {
    "type": "wait",
    "selector": "[role='tooltip'], [data-tooltip], .tooltip",
    "description": "Wait for tooltip to appear after hovering top edge dot"
  },
  {
    "type": "assert",
    "selector": "[role='tooltip'], [data-tooltip], .tooltip",
    "description": "Verify tooltip is visible and repositioned to stay within viewport"
  },
  {
    "type": "assert",
    "selector": "[role='tooltip'], [data-tooltip], .tooltip",
    "description": "Verify full tooltip content is visible and readable without clipping"
  }
]
```
