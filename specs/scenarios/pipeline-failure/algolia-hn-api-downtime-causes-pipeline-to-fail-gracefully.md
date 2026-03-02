---
priority: high
type: failure-mode
confidence: direct
verification:
  - script: specs/scripts/pipeline-failure/algolia-downtime-graceful.ts
---

# Pipeline-failure — Algolia HN API downtime causes pipeline to fail gracefully

## Context
- Algolia API is completely down returning 500 errors

## Steps
1. Run the pipeline while Algolia is unavailable

## Expected
- Pipeline logs a clear error message about Algolia unavailability
- Pipeline exits gracefully without corrupting existing data
- Partial results (if any) are optionally saved for later resumption
