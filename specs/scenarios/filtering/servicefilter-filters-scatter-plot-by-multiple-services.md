---
priority: medium
type: happy-path
confidence: expanded
---

# Filtering — ServiceFilter filters scatter plot by multiple services

## Context
- Scatter plot displays data points for multiple services

## Steps
1. Select 'AWS' from the ServiceFilter component
2. Additionally select 'GitHub' from the ServiceFilter component

## Expected
- Only dots for AWS and GitHub are visible on the scatter plot
- OutageList shows only AWS and GitHub outages

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector application"
  },
  {
    "type": "click",
    "selector": "button[name=\"Filter: All Services\"]",
    "description": "Click the service filter dropdown button to open filter options"
  },
  {
    "type": "click",
    "selector": "text=AWS",
    "description": "Select AWS from the service filter options"
  },
  {
    "type": "click",
    "selector": "button[name=\"Filter: All Services\"]",
    "description": "Click the service filter dropdown button again to select additional service"
  },
  {
    "type": "click",
    "selector": "text=GitHub",
    "description": "Additionally select GitHub from the service filter options"
  },
  {
    "type": "assert",
    "selector": "svg[aria-labelledby=\"timeline-heading\"]",
    "description": "Verify the scatter plot is visible and only shows AWS and GitHub data points"
  },
  {
    "type": "assert",
    "selector": "role=region[name=\"Famous Outage Incidents\"]",
    "description": "Verify the OutageList section is visible and shows only AWS and GitHub outages"
  }
]
```
