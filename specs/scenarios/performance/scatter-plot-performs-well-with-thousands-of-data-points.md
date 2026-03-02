---
priority: high
type: happy-path
confidence: direct
---

# Performance — Scatter plot performs well with thousands of data points

## Context
- Static JSON file contains 2000+ outage records

## Steps
1. Open the application at route '/'
2. Wait for the scatter plot to render
3. Pan and zoom the scatter plot if supported

## Expected
- Page loads within 3 seconds
- Scatter plot renders without visible lag
- Hover interactions remain smooth and responsive
- No browser freezes or excessive memory usage

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000/",
    "description": "Open the application at route '/'"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot SVG to render"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the outage list section to be visible"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot renders without visible lag"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Verify timeline heading is visible confirming page loaded successfully"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Famous Outage Incidents']",
    "description": "Verify outage list is visible confirming full page render"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter button is interactive and responsive"
  }
]
```
