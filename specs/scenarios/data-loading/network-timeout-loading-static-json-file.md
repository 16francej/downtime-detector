---
priority: medium
type: failure-mode
confidence: expanded
---

# Data-loading — Network timeout loading static JSON file

## Context
- Network is very slow or the JSON file request times out

## Steps
1. Open the application on a slow network connection

## Expected
- Loading state persists until data arrives or timeout occurs
- If timeout occurs, an error message is shown with option to retry
- Page does not appear broken during slow loading

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application on a slow network connection"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for loading state to appear or content to load"
  },
  {
    "type": "assert",
    "selector": "role=main",
    "description": "Verify page structure is not broken during loading"
  },
  {
    "type": "assert",
    "selector": "role=heading[name='Downtime Detector']",
    "description": "Verify main heading is visible during loading"
  },
  {
    "type": "wait",
    "selector": "text=retry",
    "description": "Wait for timeout error message with retry option to appear"
  },
  {
    "type": "assert",
    "selector": "text=error",
    "description": "Verify error message is shown after timeout"
  },
  {
    "type": "assert",
    "selector": "text=retry",
    "description": "Verify retry option is available"
  }
]
```
