---
priority: low
type: edge-case
confidence: inferred
verification:
  - script: specs/scripts/pipeline-classification/short-common-service-names.ts
---

# Pipeline-classification — Pipeline correctly identifies services with short/common names

## Context
- Post title mentions 'Zoom is down' where 'Zoom' could be ambiguous

## Steps
1. Pipeline classifies the post

## Expected
- LLM correctly identifies 'Zoom' as the video conferencing service
- Context from the post title and content disambiguates the service name
- Service name is stored accurately
