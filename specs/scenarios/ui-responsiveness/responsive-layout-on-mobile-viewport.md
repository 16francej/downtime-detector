---
priority: medium
type: happy-path
confidence: expanded
---

# Ui-responsiveness — Responsive layout on mobile viewport

## Context
- User opens the application on a mobile device (viewport width ~375px)

## Steps
1. Open the application on a mobile-sized viewport
2. Scroll through the page

## Expected
- Scatter plot is readable, possibly with horizontal scroll or a simplified view
- ServiceFilter is accessible (not clipped or hidden)
- OutageList items are legible with proper text wrapping
- Tailwind responsive classes handle layout adjustments

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application on a mobile-sized viewport"
  },
  {
    "type": "wait",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Wait for the main heading to be visible"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot (SVG chart) is present and accessible"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify ServiceFilter button is accessible and visible"
  },
  {
    "type": "assert",
    "selector": "text=Filter by Service",
    "description": "Verify ServiceFilter label is visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify OutageList section is present"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify outage table is rendered and accessible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Famous Outage Incidents']",
    "description": "Verify OutageList heading is legible"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Outage Timeline']",
    "description": "Verify timeline heading is visible for scatter plot context"
  }
]
```
