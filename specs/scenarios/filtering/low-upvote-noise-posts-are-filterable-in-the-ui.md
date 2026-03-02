---
priority: medium
type: edge-case
confidence: direct
---

# Filtering — Low-upvote noise posts are filterable in the UI

## Context
- Dataset includes posts with 1-2 upvotes that passed LLM classification

## Steps
1. Open the application
2. Look for a way to filter by minimum upvote count or observe the scatter plot

## Expected
- Low-upvote posts appear at the bottom of the Y axis
- User can filter them out via a minimum upvote threshold or they are visually de-emphasized
- Or the scatter plot naturally handles this by positioning them at the bottom

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
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to load"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible"
  },
  {
    "type": "assert",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Verify filter controls are available in the UI"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage list table is visible showing posts with various upvote counts"
  }
]
```
