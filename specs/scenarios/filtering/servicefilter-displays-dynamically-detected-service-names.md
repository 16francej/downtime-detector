---
priority: high
type: happy-path
confidence: direct
---

# Filtering — ServiceFilter displays dynamically detected service names

## Context
- LLM has dynamically assigned service names with no curated list

## Steps
1. Open the application and view the ServiceFilter options

## Expected
- All unique service names from the dataset appear as filter options
- Service names are sorted alphabetically or by frequency
- No hardcoded service list — new services appear automatically as data is updated

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Click the service filter button to view options"
  },
  {
    "type": "wait",
    "selector": "role=option",
    "description": "Wait for filter options to appear"
  },
  {
    "type": "assert",
    "selector": "role=option",
    "description": "Verify that service filter options are displayed"
  },
  {
    "type": "assert",
    "selector": "role=option",
    "description": "Verify all unique service names from the dataset appear as filter options (multiple options exist)"
  }
]
```
