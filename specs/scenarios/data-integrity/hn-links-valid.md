---
priority: high
type: happy-path
confidence: direct
---

# Data Integrity — HN links point to valid pages

## Context
- Each outage row has an "HN" link to a Hacker News discussion or search
- Links should resolve to real pages, not 404s or unrelated content

## Steps
1. Navigate to the homepage at /
2. Collect all HN discussion links from the outage table
3. Verify each link resolves to a valid Hacker News page

## Expected
- Every HN link in the table has a valid href
- Links pointing to news.ycombinator.com/item resolve to an existing HN story (not a 404 or dead page)
- Links pointing to hn.algolia.com resolve to a search results page
- No HN link href is empty or malformed
