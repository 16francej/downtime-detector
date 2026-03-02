---
priority: medium
type: happy-path
confidence: expanded
---

# Accessibility — ServiceFilter is keyboard accessible

## Context
- User navigates the page using only a keyboard

## Steps
1. Tab to the ServiceFilter component
2. Use keyboard to select a service
3. Use keyboard to set a date range

## Expected
- ServiceFilter receives visible focus
- Service selection can be made with keyboard (Enter/Space to toggle)
- Date inputs are keyboard navigable
- Filter changes are reflected in scatter plot and OutageList

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector application"
  },
  {
    "type": "keyboard",
    "key": "Tab",
    "description": "Tab to focus on the first interactive element"
  },
  {
    "type": "assert",
    "selector": "button[name='Filter: All Services']",
    "description": "Verify ServiceFilter button receives visible focus"
  },
  {
    "type": "keyboard",
    "key": "Enter",
    "description": "Press Enter to open the service filter dropdown"
  },
  {
    "type": "keyboard",
    "key": "ArrowDown",
    "description": "Use arrow key to navigate to a service option"
  },
  {
    "type": "keyboard",
    "key": "Enter",
    "description": "Press Enter to select a service"
  },
  {
    "type": "keyboard",
    "key": "Tab",
    "description": "Tab to navigate to date range inputs"
  },
  {
    "type": "keyboard",
    "key": "Tab",
    "description": "Tab to the next date input field"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify scatter plot is present and accessible after filter changes"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify OutageList section is visible and reflects filter changes"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is present and updated based on filters"
  }
]
```
