---
priority: low
type: edge-case
confidence: expanded
verification:
  - script: specs/scripts/pipeline-classification/extremely-long-titles.ts
---

# Pipeline-classification — Pipeline handles extremely long post titles

## Context
- HN post has an unusually long title (200+ characters)

## Steps
1. Pipeline processes the long-titled post

## Expected
- Title is stored in full in the JSON
- UI truncates or wraps the title gracefully in tooltip and OutageList
- No layout breaking occurs
