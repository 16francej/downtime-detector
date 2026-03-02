---
priority: medium
type: happy-path
confidence: direct
---

# Visualization — Clicking HN link in tooltip opens the correct HN post

## Context
- Tooltip is visible after hovering over a data point

## Steps
1. Click the HN post link inside the tooltip

## Expected
- A new browser tab opens navigating to the correct Hacker News post URL

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector page"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the timeline chart to load"
  },
  {
    "type": "click",
    "selector": "text=HN",
    "description": "Click the HN post link inside the tooltip"
  },
  {
    "type": "assert",
    "selector": "text=Hacker News",
    "description": "Verify that a new tab opens with Hacker News content"
  }
]
```
