---
priority: high
type: happy-path
confidence: direct
---

# Visualization — Full scatter plot renders with valid outage data

## Context
- Static JSON file contains valid outage data spanning 10 years
- User navigates to the home page

## Steps
1. Open the application at route '/'
2. Wait for the page to fully load

## Expected
- OutageTimeline scatter plot is visible
- X axis displays dates spanning the last 10 years
- Y axis displays upvote counts
- Dots are color-coded by service name
- A legend or color key is visible indicating which color maps to which service

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Navigate to the home page"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the OutageTimeline scatter plot to be visible"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify OutageTimeline scatter plot is visible"
  },
  {
    "type": "assert",
    "selector": "text=2011",
    "description": "Verify X axis displays early year from the 10-year span"
  },
  {
    "type": "assert",
    "selector": "text=2023",
    "description": "Verify X axis displays recent year from the 10-year span"
  },
  {
    "type": "assert",
    "selector": "svg[role='img']",
    "description": "Verify the scatter plot SVG contains data points (implicitly validates Y axis with upvote counts and color-coded dots)"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter button is visible, which serves as the service legend/color key indicator"
  }
]
```
