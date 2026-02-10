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
