---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classify-active-outage.ts
---

# Pipeline-classification — LLM correctly classifies an active outage post

## Context
- Pipeline has fetched a candidate HN post with title 'AWS S3 is down'

## Steps
1. Pass the candidate post to the Anthropic classification model

## Expected
- Model identifies the post as an active outage (is_outage: true)
- Service is extracted as 'AWS S3' or 'AWS'
- A concise summary of the outage is generated
- The classification is stored with the post metadata
