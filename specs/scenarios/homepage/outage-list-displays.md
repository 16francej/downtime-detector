---
priority: high
type: happy-path
confidence: direct
---

# Homepage — Outage list shows famous incidents

## Context
- User navigates to the homepage
- Hardcoded dataset of famous outages exists

## Steps
1. Navigate to the homepage at /
2. Scroll down past the timeline visualization

## Expected
- A list or table of outage incidents is visible
- The list includes the AWS S3 outage from 2017
- The list includes the Cloudflare outage from 2019
- The list includes the Facebook outage from 2021
- Each outage entry shows the service name, date, and a brief description

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the outage incidents section to be visible"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify that a list or table of outage incidents is visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify that the outage incidents table is present"
  },
  {
    "type": "assert",
    "selector": "text=AWS S3",
    "description": "Verify the list includes the AWS S3 outage"
  },
  {
    "type": "assert",
    "selector": "text=2017",
    "description": "Verify the AWS S3 outage shows the date 2017"
  },
  {
    "type": "assert",
    "selector": "text=Cloudflare",
    "description": "Verify the list includes the Cloudflare outage"
  },
  {
    "type": "assert",
    "selector": "text=2019",
    "description": "Verify the Cloudflare outage shows the date 2019"
  },
  {
    "type": "assert",
    "selector": "text=Facebook",
    "description": "Verify the list includes the Facebook outage"
  },
  {
    "type": "assert",
    "selector": "text=2021",
    "description": "Verify the Facebook outage shows the date 2021"
  }
]
```
