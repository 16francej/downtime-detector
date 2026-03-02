---
priority: medium
type: edge-case
confidence: inferred
verification:
  - script: specs/scripts/pipeline-operational/idempotency-check.ts
---

# Pipeline-operational — Pipeline idempotency — running twice produces same result

## Context
- Pipeline was already run successfully and JSON file exists

## Steps
1. Run the pipeline again without any new HN posts

## Expected
- JSON file content is identical after the second run
- No duplicate entries are added
- Pipeline completes successfully with a note that no new data was found
