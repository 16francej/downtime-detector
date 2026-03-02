---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-update/incremental-no-duplicates.ts
---

# Pipeline-update — Pipeline incremental update does not duplicate existing data

## Context
- Pipeline has been run before and JSON file contains existing outage data
- Pipeline runs again for a monthly update

## Steps
1. Run the pipeline in monthly update mode

## Expected
- New posts are appended to the existing dataset
- Existing posts are not duplicated
- Deduplication still applies for posts within 7-day windows of new data
- The JSON file is updated atomically
