---
priority: low
type: edge-case
confidence: expanded
---

# Visualization — Extremely old outage data from 10 years ago renders correctly

## Context
- Dataset includes outages from 2014-2015

## Steps
1. Open the scatter plot and examine the leftmost data points

## Expected
- Data from 2014-2015 is visible on the scatter plot
- Dates are displayed correctly (not showing wrong year or format)
- Hover tooltips work for old data points

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector homepage"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to load"
  },
  {
    "type": "assert",
    "selector": "text=2014",
    "description": "Verify that 2014 date label is visible on the scatter plot"
  },
  {
    "type": "assert",
    "selector": "text=2015",
    "description": "Verify that 2015 date label is visible on the scatter plot"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is rendered and visible"
  }
]
```
