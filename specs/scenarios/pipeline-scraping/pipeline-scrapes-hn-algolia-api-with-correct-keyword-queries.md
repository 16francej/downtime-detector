---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-scraping/algolia-keyword-queries.ts
---

# Pipeline-scraping — Pipeline scrapes HN Algolia API with correct keyword queries

## Context
- ANTHROPIC_API_KEY is set in environment
- Pipeline script is executed

## Steps
1. Run the scraping pipeline script
2. Observe the API queries made to Algolia HN Search

## Expected
- Queries include keywords: 'outage', 'down', 'incident', '503', 'degraded' and similar terms
- Results are filtered to posts from the last 10 years
- API responses include title, URL, upvotes, comment count, date, and HN link for each post
