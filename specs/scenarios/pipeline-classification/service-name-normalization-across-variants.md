---
priority: medium
type: edge-case
confidence: inferred
verification:
  - script: specs/scripts/pipeline-classification/service-name-normalization.ts
---

# Pipeline-classification — Service name normalization across variants

## Context
- Multiple posts refer to the same service with different names: 'AWS', 'Amazon Web Services', 'Amazon S3'

## Steps
1. Run classification on these posts

## Expected
- LLM produces consistent or normalized service names
- Or a post-processing step normalizes variants to a canonical name
- The scatter plot shows these as the same color
