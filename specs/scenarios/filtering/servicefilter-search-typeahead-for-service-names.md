---
priority: medium
type: happy-path
confidence: inferred
---

# Filtering — ServiceFilter search/typeahead for service names

## Context
- User knows the service they want to filter by

## Steps
1. Type 'Cloud' in the ServiceFilter search box

## Expected
- Filter suggestions narrow to services containing 'Cloud' (e.g., Cloudflare, Google Cloud, iCloud)
- User can select from the narrowed results
- Typing clears with backspace and restores full list

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector homepage"
  },
  {
    "type": "click",
    "selector": "button[name='Filter: All Services']",
    "description": "Click the service filter button to open the dropdown"
  },
  {
    "type": "fill",
    "selector": "role=textbox[name='Filter by Service']",
    "value": "Cloud",
    "description": "Type 'Cloud' in the ServiceFilter search box"
  },
  {
    "type": "assert",
    "selector": "text=Cloudflare",
    "description": "Verify Cloudflare appears in filtered suggestions"
  },
  {
    "type": "assert",
    "selector": "text=Google Cloud",
    "description": "Verify Google Cloud appears in filtered suggestions"
  },
  {
    "type": "assert",
    "selector": "text=iCloud",
    "description": "Verify iCloud appears in filtered suggestions"
  },
  {
    "type": "keyboard",
    "key": "Backspace",
    "description": "Press backspace to clear one character"
  },
  {
    "type": "keyboard",
    "key": "Backspace",
    "description": "Press backspace to clear another character"
  },
  {
    "type": "keyboard",
    "key": "Backspace",
    "description": "Press backspace to clear another character"
  },
  {
    "type": "keyboard",
    "key": "Backspace",
    "description": "Press backspace to clear another character"
  },
  {
    "type": "keyboard",
    "key": "Backspace",
    "description": "Press backspace to clear the last character"
  },
  {
    "type": "wait",
    "selector": "role=option",
    "description": "Wait for the full service list to be restored"
  },
  {
    "type": "assert",
    "selector": "role=option",
    "description": "Verify full list of services is restored after clearing search"
  }
]
```
