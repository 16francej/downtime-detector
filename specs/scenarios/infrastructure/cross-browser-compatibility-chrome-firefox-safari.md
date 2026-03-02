---
priority: medium
type: happy-path
confidence: expanded
---

# Infrastructure — Cross-browser compatibility — Chrome, Firefox, Safari

## Context
- Application is opened in different browsers

## Steps
1. Open the application in Chrome
2. Open the application in Firefox
3. Open the application in Safari

## Expected
- Scatter plot renders correctly in all three browsers
- Hover tooltips work in all browsers
- Tailwind CSS styling is consistent
- No browser-specific JavaScript errors

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application in Chrome"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot renders correctly in Chrome"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify main heading is visible in Chrome"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter button styling is consistent in Chrome"
  },
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application in Firefox"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot renders correctly in Firefox"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify main heading is visible in Firefox"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter button styling is consistent in Firefox"
  },
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application in Safari"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot renders correctly in Safari"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify main heading is visible in Safari"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter button styling is consistent in Safari"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify table renders correctly across all browsers"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify outage list section is visible across all browsers"
  }
]
```
