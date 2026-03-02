---
priority: medium
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-google-search/deduplicate-algolia-results.ts
---

# Pipeline-google-search — Google search results that duplicate Algolia results are not re-classified

## Context
- Google search returns HN posts that were already found by Algolia search

## Steps
1. Run the Google search cross-reference step after Algolia scraping

## Expected
- Duplicate posts are identified by HN post ID or URL
- No duplicate LLM classification calls are made
- Cost is not wasted on re-processing known posts
