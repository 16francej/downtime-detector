---
priority: medium
type: happy-path
confidence: expanded
---

# Accessibility — Screen reader announces scatter plot data meaningfully

## Context
- User is using a screen reader on the home page

## Steps
1. Navigate to the OutageTimeline component with a screen reader

## Expected
- The scatter plot has an accessible label describing its purpose (e.g., 'Service outage timeline showing upvotes over time')
- Data points are accessible with alternative text or ARIA labels
- Key information is conveyed without requiring visual interpretation

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
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
    "description": "Verify the scatter plot has an accessible label 'Outage Timeline'"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Verify the heading 'Outage Timeline' is present for screen reader context"
  },
  {
    "type": "assert",
    "selector": "svg[role='img'][aria-labelledby='timeline-heading']",
    "description": "Verify the SVG chart has proper ARIA attributes linking it to the descriptive heading"
  }
]
```
