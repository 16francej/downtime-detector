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
