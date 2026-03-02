---
priority: high
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/multi-service-root-cause.ts
---

# Pipeline-classification — LLM attributes multi-service outage to root-cause service

## Context
- Pipeline has fetched a post titled 'AWS outage takes down half the internet — Netflix, Slack, and others affected'

## Steps
1. Pass the candidate post to the Anthropic classification model

## Expected
- Model identifies 'AWS' as the root-cause service, not Netflix or Slack
- Summary mentions downstream effects but attribution is to AWS
- Only one outage record is created attributed to AWS
