---
priority: medium
type: edge-case
confidence: expanded
---

# Filtering — ServiceFilter handles very long list of services

## Context
- Dataset contains 100+ unique service names

## Steps
1. Open the ServiceFilter dropdown or list

## Expected
- Service list is scrollable or searchable
- User can find a specific service without excessive scrolling
- Performance is not impacted by the long list

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the main page"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Open the ServiceFilter dropdown"
  },
  {
    "type": "wait",
    "selector": "role=option",
    "description": "Wait for service options to appear"
  },
  {
    "type": "assert",
    "selector": "role=option",
    "description": "Verify that service options are rendered and visible"
  },
  {
    "type": "keyboard",
    "key": "PageDown",
    "description": "Attempt to scroll through the service list"
  },
  {
    "type": "assert",
    "selector": "role=option",
    "description": "Verify the list is scrollable and more options are accessible"
  }
]
```
