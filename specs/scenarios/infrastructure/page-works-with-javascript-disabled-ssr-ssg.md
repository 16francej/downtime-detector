---
priority: low
type: edge-case
confidence: inferred
---

# Infrastructure — Page works with JavaScript disabled (SSR/SSG)

## Context
- Next.js static site generation or server rendering is configured
- User has JavaScript disabled

## Steps
1. Open the application with JavaScript disabled

## Expected
- At minimum, the OutageList renders with static content
- Scatter plot may not be interactive but some data should be visible
- Page is not completely blank

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application with JavaScript disabled"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify OutageList section renders with static content"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Famous Outage Incidents']",
    "description": "Verify OutageList heading is visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is present and visible"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot SVG is visible with some data"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify page header is visible and not blank"
  },
  {
    "type": "assert",
    "selector": "text=Track and explore famous service outages",
    "description": "Verify main description text is visible"
  }
]
```
