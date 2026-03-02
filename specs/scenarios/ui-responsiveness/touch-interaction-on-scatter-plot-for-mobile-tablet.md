---
priority: medium
type: edge-case
confidence: inferred
---

# Ui-responsiveness — Touch interaction on scatter plot for mobile/tablet

## Context
- User is on a touch device viewing the scatter plot

## Steps
1. Tap on a data point in the scatter plot

## Expected
- Tooltip appears on tap (since hover is not available)
- Tapping elsewhere dismisses the tooltip
- Tooltip does not interfere with scrolling

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the scatter plot page"
  },
  {
    "type": "click",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Tap on a data point in the scatter plot (simulating touch interaction on the SVG chart)"
  },
  {
    "type": "wait",
    "selector": "role=tooltip",
    "description": "Wait for tooltip to appear after tap"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip appears on tap"
  },
  {
    "type": "click",
    "selector": "role=main",
    "description": "Tap elsewhere on the page to dismiss tooltip"
  },
  {
    "type": "wait",
    "selector": "1000",
    "description": "Wait briefly to ensure tooltip dismissal"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip is dismissed after tapping elsewhere (should not be visible)"
  }
]
```
