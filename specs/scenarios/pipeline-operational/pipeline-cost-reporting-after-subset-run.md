---
priority: medium
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-operational/cost-reporting-subset.ts
---

# Pipeline-operational — Pipeline cost reporting after subset run

## Context
- Pipeline has completed a subset validation run

## Steps
1. Review the pipeline output/logs after subset run

## Expected
- Total number of API calls made to Anthropic is reported
- Estimated cost is displayed
- Number of posts processed vs classified as outages is shown
- Quality metrics (e.g., sample of classifications) are available for review
