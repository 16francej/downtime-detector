---
priority: medium
type: happy-path
confidence: expanded
---

# Accessibility — Keyboard navigation through scatter plot data points

## Context
- User navigates using keyboard only

## Steps
1. Tab to the scatter plot area
2. Use arrow keys or tab to navigate between data points

## Expected
- Focus indicator is visible on the currently selected data point
- Tooltip information is accessible via keyboard (e.g., pressing Enter or Space)
- Screen reader announces the data point details

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector page"
  },
  {
    "type": "keyboard",
    "key": "Tab",
    "description": "Tab to focus on the scatter plot area"
  },
  {
    "type": "keyboard",
    "key": "Tab",
    "description": "Continue tabbing to reach the scatter plot SVG element"
  },
  {
    "type": "keyboard",
    "key": "ArrowRight",
    "description": "Use arrow key to navigate to the first data point"
  },
  {
    "type": "assert",
    "selector": "svg[role='img'][aria-labelledby='timeline-heading']",
    "description": "Verify the scatter plot is present and accessible"
  },
  {
    "type": "keyboard",
    "key": "ArrowRight",
    "description": "Navigate to the next data point using arrow key"
  },
  {
    "type": "keyboard",
    "key": "Enter",
    "description": "Press Enter to access tooltip information for the data point"
  },
  {
    "type": "wait",
    "selector": "role=tooltip",
    "description": "Wait for tooltip to appear after pressing Enter"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip is visible and accessible via keyboard"
  },
  {
    "type": "keyboard",
    "key": "Escape",
    "description": "Close the tooltip by pressing Escape"
  },
  {
    "type": "keyboard",
    "key": "ArrowDown",
    "description": "Navigate to another data point using arrow key"
  },
  {
    "type": "keyboard",
    "key": "Space",
    "description": "Press Space to access tooltip information for the current data point"
  },
  {
    "type": "assert",
    "selector": "role=tooltip",
    "description": "Verify tooltip appears when Space key is pressed"
  }
]
```
