---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-scraping/subset-before-backfill.ts
---

# Pipeline-scraping — Pipeline runs on subset first before full backfill

## Context
- Pipeline is being run for the first time or in validation mode

## Steps
1. Run the pipeline in subset/validation mode
2. Review the output

## Expected
- Only a small number of posts are processed (e.g., 50-100)
- Cost and quality metrics are reported
- User can review results before committing to full backfill
