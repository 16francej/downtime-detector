---
priority: low
type: happy-path
confidence: inferred
---

# Ui-styling — Data freshness indicator shows when data was last updated

## Context
- Static JSON file was last generated on a specific date

## Steps
1. Open the application and look for a data freshness indicator

## Expected
- A timestamp or 'Last updated' label is visible on the page
- User understands the data may not include very recent outages

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
    "selector": "role=main",
    "description": "Wait for main content to load"
  },
  {
    "type": "assert",
    "selector": "text=/Last updated|Data as of|Updated on/i",
    "description": "Verify that a 'Last updated' timestamp or label is visible on the page"
  }
]
```
