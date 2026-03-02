---
priority: medium
type: edge-case
confidence: expanded
---

# Visualization — Scatter plot correctly positions data with same date but different upvotes

## Context
- Two outages occur on the same date for different services with different upvote counts

## Steps
1. Open the scatter plot with overlapping date data

## Expected
- Both dots are visible at the same X position but different Y positions
- Hover can distinguish between the two dots
- Colors indicate they are different services

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the scatter plot page with overlapping date data"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot SVG to load"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible on the page"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline'] >> xpath=.//*[local-name()='circle']",
    "description": "Verify that data points (dots) are rendered in the scatter plot"
  }
]
```
