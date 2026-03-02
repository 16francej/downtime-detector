---
priority: low
type: edge-case
confidence: expanded
verification:
  - script: specs/scripts/pipeline-classification/unicode-special-characters.ts
---

# Pipeline-classification — Pipeline handles Unicode and special characters in post titles

## Context
- HN post title contains Unicode characters, emojis, or special characters

## Steps
1. Pipeline fetches a post with title containing '🔥 AWS is DOWN 🔥'

## Expected
- Title is stored correctly with Unicode characters intact
- LLM classification is not confused by special characters
- UI renders the title correctly in tooltip and OutageList
