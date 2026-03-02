---
priority: medium
type: failure-mode
confidence: direct
verification:
  - script: specs/scripts/pipeline-failure/deleted-missing-posts.ts
---

# Pipeline-failure — Deleted or missing HN posts are handled in scraping

## Context
- Algolia returns a post ID that has been deleted or has missing fields

## Steps
1. Pipeline encounters a post with null title or missing URL

## Expected
- Post is skipped with a logged warning
- Pipeline continues processing other posts
- No null/undefined values propagate to the final JSON
