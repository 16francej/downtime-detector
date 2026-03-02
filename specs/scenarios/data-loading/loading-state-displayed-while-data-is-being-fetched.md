---
priority: medium
type: happy-path
confidence: expanded
---

# Data-loading — Loading state displayed while data is being fetched

## Context
- User navigates to the home page
- Static JSON file is being loaded

## Steps
1. Open the application at route '/'
2. Observe the page before data finishes loading

## Expected
- A loading indicator (spinner, skeleton, or loading text) is displayed
- The loading state appears in both the scatter plot and OutageList areas
- Once data loads, the loading state is replaced by actual content

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Navigate to the home page"
  },
  {
    "type": "assert",
    "selector": "text=Loading",
    "description": "Verify loading indicator is displayed while data is being fetched"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to finish loading"
  },
  {
    "type": "wait",
    "selector": "role=table",
    "description": "Wait for the OutageList table to finish loading"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is displayed after loading completes"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the OutageList table is displayed after loading completes"
  }
]
```
