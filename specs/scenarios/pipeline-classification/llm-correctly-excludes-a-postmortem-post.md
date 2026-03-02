---
priority: high
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/exclude-postmortem.ts
---

# Pipeline-classification — LLM correctly excludes a postmortem post

## Context
- Pipeline has fetched a post titled 'Postmortem: What caused the AWS outage last week'

## Steps
1. Pass the candidate post to the Anthropic classification model

## Expected
- Model identifies this as NOT an active outage (is_outage: false)
- Post is excluded from the final dataset
- Reason for exclusion is logged
