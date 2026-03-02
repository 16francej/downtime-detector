---
priority: medium
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/ambiguous-keyword-match.ts
---

# Pipeline-classification — LLM handles ambiguous keyword matches correctly

## Context
- Pipeline has fetched a post titled 'Show HN: Down — a minimalist markdown editor'

## Steps
1. Pass the candidate post to the Anthropic classification model

## Expected
- Model classifies this as NOT an outage
- The word 'Down' is recognized as a product name, not an outage indicator
- Post is excluded from results
