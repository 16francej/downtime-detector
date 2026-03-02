---
priority: medium
type: edge-case
confidence: inferred
---

# Visualization — Scatter plot Y axis scales correctly with outlier upvote counts

## Context
- Most posts have 100-500 upvotes but one has 5000+ upvotes

## Steps
1. Open the application and examine the scatter plot

## Expected
- Y axis accommodates the outlier without compressing all other points into the bottom
- Axis uses a reasonable scale (possibly logarithmic or with breaks)
- All data points remain distinguishable

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to load"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible"
  },
  {
    "type": "assert",
    "selector": "svg[role='img'][aria-labelledby='timeline-heading']",
    "description": "Verify Y axis accommodates the outlier - the SVG chart renders with appropriate height and scale"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify all data points remain distinguishable by checking the outage list is properly displayed"
  }
]
```
