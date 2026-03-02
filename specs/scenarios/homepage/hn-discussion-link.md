---
priority: medium
type: happy-path
confidence: direct
---

# Homepage — HN discussion links

## Context
- Outage entries from Hacker News include a link back to the HN discussion thread
- Users can click through to read the original discussion

## Steps
1. Navigate to the homepage at /
2. Look at the outage list for rows with HN discussion links

## Expected
- At least one outage row contains a link to a Hacker News discussion
- The link URL contains "news.ycombinator.com"
- The link opens in a new tab (target="_blank")

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
    "description": "Wait for the outage list section to load"
  },
  {
    "type": "assert",
    "selector": "a[href*='news.ycombinator.com']",
    "description": "Verify at least one outage row contains a link to a Hacker News discussion"
  },
  {
    "type": "assert",
    "selector": "a[href*='news.ycombinator.com'][target='_blank']",
    "description": "Verify the HN link opens in a new tab with target=_blank"
  }
]
```
