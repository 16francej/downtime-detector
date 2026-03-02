---
priority: low
type: edge-case
confidence: expanded
verification:
  - script: specs/scripts/pipeline-classification/zero-upvotes.ts
---

# Pipeline-classification — Pipeline handles posts with zero upvotes

## Context
- Algolia returns a post with 0 upvotes that matches outage keywords

## Steps
1. Pipeline processes the zero-upvote post

## Expected
- Post is still classified by the LLM
- If classified as an outage, it is included in the dataset with upvotes = 0
- The scatter plot correctly positions it at Y = 0
