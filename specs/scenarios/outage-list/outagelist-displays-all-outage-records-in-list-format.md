---
priority: high
type: happy-path
confidence: direct
---

# Outage-list — OutageList displays all outage records in list format

## Context
- Static JSON file contains outage data
- User is on the home page

## Steps
1. Scroll to the OutageList component section

## Expected
- Each outage is shown as a list item
- Each item displays: service name, HN post title, upvote count, comment count, date, and LLM-generated summary
- Each item has a link to the HN post

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the home page"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the OutageList component section to be visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify OutageList section is displayed"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify outage data is displayed as a list (table)"
  },
  {
    "type": "assert",
    "selector": "text=service",
    "description": "Verify service name column is present"
  },
  {
    "type": "assert",
    "selector": "text=post title",
    "description": "Verify HN post title column is present"
  },
  {
    "type": "assert",
    "selector": "text=upvote",
    "description": "Verify upvote count column is present"
  },
  {
    "type": "assert",
    "selector": "text=comment",
    "description": "Verify comment count column is present"
  },
  {
    "type": "assert",
    "selector": "text=date",
    "description": "Verify date column is present"
  },
  {
    "type": "assert",
    "selector": "text=summary",
    "description": "Verify LLM-generated summary column is present"
  },
  {
    "type": "assert",
    "selector": "role=link",
    "description": "Verify each item has a link to the HN post"
  }
]
```
