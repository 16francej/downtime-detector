---
priority: high
type: happy-path
confidence: expanded
verification:
  - script: specs/scripts/pipeline-scraping/algolia-pagination.ts
---

# Pipeline-scraping — Pipeline handles pagination of Algolia results

## Context
- A keyword search returns more results than a single API page

## Steps
1. Run the pipeline with a keyword that has many results (e.g., 'outage')

## Expected
- Pipeline paginates through all result pages
- No results are missed due to pagination limits
- Pagination respects API rate limits
