---
priority: medium
type: happy-path
confidence: expanded
---

# Accessibility — OutageList items are accessible with screen reader

## Context
- User is navigating OutageList with a screen reader

## Steps
1. Navigate to the OutageList component
2. Move through the list items

## Expected
- Each outage item is announced with service name, title, date, and upvote count
- Links to HN posts are clearly identified as links
- List is semantically marked up using proper HTML list elements

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the OutageList component page"
  },
  {
    "type": "wait",
    "selector": "region[name='Famous Outage Incidents']",
    "description": "Wait for the outage list section to be visible"
  },
  {
    "type": "assert",
    "selector": "region[name='Famous Outage Incidents']",
    "description": "Verify the outage list region is present with proper ARIA label"
  },
  {
    "type": "assert",
    "selector": "heading[name='Famous Outage Incidents']",
    "description": "Verify the section heading is accessible"
  },
  {
    "type": "assert",
    "selector": "table",
    "description": "Verify the list is marked up as a table for semantic structure"
  },
  {
    "type": "keyboard",
    "key": "Tab",
    "description": "Tab through the first outage item to navigate with keyboard (simulating screen reader navigation)"
  },
  {
    "type": "assert",
    "selector": "link",
    "description": "Verify that HN post links are identified as links with proper role"
  }
]
```
