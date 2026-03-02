---
priority: medium
type: failure-mode
confidence: inferred
verification:
  - script: specs/scripts/pipeline-operational/resume-after-failure.ts
---

# Pipeline-operational — Pipeline resume capability after partial failure

## Context
- Pipeline crashed mid-run after processing 500 of 2000 posts

## Steps
1. Restart the pipeline after the crash

## Expected
- Pipeline detects previously processed posts and skips them
- Or pipeline provides a checkpoint/resume mechanism
- Already classified posts are not re-sent to Anthropic API
- Final result includes all posts from both runs
