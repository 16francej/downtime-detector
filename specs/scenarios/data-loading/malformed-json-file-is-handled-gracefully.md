---
priority: medium
type: failure-mode
confidence: expanded
---

# Data-loading — Malformed JSON file is handled gracefully

## Context
- The outage data JSON file contains invalid JSON syntax

## Steps
1. Open the application at route '/'

## Expected
- An error message is displayed to the user rather than a white screen
- Console logs the parsing error for debugging
- Application does not crash

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Open the application at route '/'"
  },
  {
    "type": "assert",
    "selector": "text=Error",
    "description": "Verify an error message is displayed to the user rather than a white screen"
  },
  {
    "type": "assert",
    "selector": "role=main",
    "description": "Verify application does not crash and main content area is still present"
  }
]
```
