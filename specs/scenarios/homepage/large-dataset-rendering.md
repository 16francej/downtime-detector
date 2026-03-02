---
priority: high
type: happy-path
confidence: direct
---

# Homepage — Large dataset renders cleanly

## Context
- The app now has 30+ outage entries from both hardcoded data and HN scraping
- The timeline and list must handle larger datasets without visual or technical issues

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load
3. Scroll through the entire outage list

## Expected
- The timeline visualization displays 30+ data points without overflow or clipping
- The outage list displays 30+ rows
- No console errors appear during page load or scrolling
- The page remains responsive and usable

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Wait for the page to fully load by checking for the main heading"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the timeline visualization to render"
  },
  {
    "type": "wait",
    "selector": "role=table",
    "description": "Wait for the outage list table to render"
  },
  {
    "type": "keyboard",
    "key": "End",
    "description": "Scroll to the bottom of the page to ensure all content is loaded"
  },
  {
    "type": "wait",
    "selector": "timeout=1000",
    "description": "Wait a moment after scrolling"
  },
  {
    "type": "keyboard",
    "key": "Home",
    "description": "Scroll back to the top of the page"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the timeline visualization is visible and rendered"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage list table is visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the outage list section is present and accessible"
  }
]
```
