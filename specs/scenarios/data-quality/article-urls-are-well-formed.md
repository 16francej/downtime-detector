---
priority: medium
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/article-urls.ts
---

# Data-quality — Article URLs are well-formed and use HTTPS

## Context
- Each outage record has a `url` field linking to the original article or status page
- Broken or malformed URLs degrade trust and usefulness

## Steps
1. Load the outage data from public/outages.json
2. Validate each url field

## Expected
- Every url is a valid URL (parseable by URL constructor)
- Every url uses HTTPS protocol
- No two records share the same article url
- No url is empty or a placeholder
