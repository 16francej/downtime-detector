---
priority: medium
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/exclude-retrospective.ts
---

# Pipeline-classification — LLM correctly excludes a retrospective or tangential mention

## Context
- Pipeline has fetched a post titled 'The history of major internet outages'

## Steps
1. Pass the candidate post to the Anthropic classification model

## Expected
- Model classifies this as not an active outage
- Post is excluded from the final dataset
