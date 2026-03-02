---
priority: high
type: failure-mode
confidence: direct
verification:
  - script: specs/scripts/pipeline-failure/algolia-rate-limiting.ts
---

# Pipeline-failure — Algolia HN API rate limiting is handled with retries and backoff

## Context
- Algolia API returns 429 (Too Many Requests) during scraping

## Steps
1. Run the pipeline
2. Simulate or encounter Algolia rate limiting

## Expected
- Pipeline implements exponential backoff and retries
- Scraping resumes after the rate limit window
- Progress is not lost — already fetched pages are not re-fetched
- A warning is logged about the rate limiting
