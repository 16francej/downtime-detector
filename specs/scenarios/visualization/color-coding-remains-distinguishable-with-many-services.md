---
priority: medium
type: edge-case
confidence: inferred
---

# Visualization — Color coding remains distinguishable with many services

## Context
- Dataset contains outages for 50+ different services

## Steps
1. Open the application and view the scatter plot

## Expected
- Color palette provides sufficient contrast for at least the top 10-15 services
- Less frequent services may share colors or be grouped under 'Other'
- A legend or search helps identify specific services

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
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify the service filter/legend is present for identifying services"
  },
  {
    "type": "click",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Open the service filter dropdown to check available services"
  },
  {
    "type": "wait",
    "selector": "role=option",
    "description": "Wait for service options to appear"
  },
  {
    "type": "assert",
    "selector": "role=option",
    "description": "Verify that service options are available in the dropdown for identifying specific services"
  },
  {
    "type": "keyboard",
    "key": "Escape",
    "description": "Close the dropdown to view the scatter plot colors"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot displays color-coded data points with sufficient visual distinction for multiple services"
  }
]
```
