---
priority: low
type: edge-case
confidence: inferred
---

# Ui-styling — Scatter plot renders correctly in dark mode if supported

## Context
- User's system preference is dark mode or dark mode toggle exists

## Steps
1. Open the application with dark mode enabled

## Expected
- Scatter plot background contrasts with dots
- Axis labels and tick marks are readable
- Tooltip has appropriate dark mode styling
- Color coding for services remains distinguishable on dark background

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
    "description": "Wait for scatter plot to load"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot is visible and renders with dark mode styling"
  },
  {
    "type": "assert",
    "selector": "svg text",
    "description": "Verify axis labels and tick marks are present and readable in dark mode"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Verify timeline heading is visible with appropriate dark mode contrast"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the outage list section maintains readability in dark mode"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter controls have appropriate dark mode styling and remain distinguishable"
  }
]
```
