---
priority: medium
type: happy-path
confidence: direct
---

# Homepage — Filter outages by service

## Context
- User is on the homepage
- Multiple outage entries from different services are displayed

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load
3. Look for a filter or dropdown to select a specific service
4. Click on or select "AWS" from the filter options

## Expected
- The outage list updates to show only AWS-related incidents
- Non-AWS incidents are hidden from the list
- The timeline visualization updates to reflect the filter

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000/",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the page to fully load by waiting for the outage list section"
  },
  {
    "type": "click",
    "selector": "role=button[name='Filter: All Services']",
    "description": "Click on the filter dropdown button to open service options"
  },
  {
    "type": "click",
    "selector": "text=AWS",
    "description": "Select AWS from the filter options"
  },
  {
    "type": "assert",
    "selector": "text=AWS",
    "description": "Verify that AWS-related incidents are visible in the list"
  },
  {
    "type": "assert",
    "selector": "role=button[name=/Filter.*AWS/]",
    "description": "Verify the filter button reflects AWS selection"
  }
]
```
