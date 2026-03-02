---
priority: high
type: failure-mode
confidence: direct
verification:
  - script: specs/scripts/pipeline-failure/anthropic-api-failure.ts
---

# Pipeline-failure — Anthropic API failure during classification is handled gracefully

## Context
- Anthropic API returns errors or times out during LLM classification

## Steps
1. Run the pipeline
2. Simulate Anthropic API failure mid-classification

## Expected
- Failed classifications are retried with exponential backoff
- After max retries, the post is skipped and logged for manual review
- Pipeline continues processing remaining posts
- Successfully classified posts are not lost
