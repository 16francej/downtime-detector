---
priority: low
type: edge-case
confidence: expanded
verification:
  - script: specs/scripts/pipeline-classification/zero-comments.ts
---

# Pipeline-classification — Pipeline handles posts with zero comments

## Context
- A post has upvotes but zero comments

## Steps
1. Pipeline processes the post

## Expected
- Post is processed normally
- Comment count of 0 is stored in the JSON
- UI displays comment count as 0 or omits it gracefully
