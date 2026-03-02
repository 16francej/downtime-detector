---
priority: high
type: failure-mode
confidence: direct
verification:
  - script: specs/scripts/pipeline-failure/anthropic-rate-limiting.ts
---

# Pipeline-failure — Anthropic API rate limiting is handled during bulk classification

## Context
- Pipeline is classifying hundreds of posts and hits Anthropic rate limits

## Steps
1. Run the full backfill pipeline

## Expected
- Pipeline respects rate limits with appropriate delays between calls
- Classification continues after backoff period
- Total processing completes without manual intervention
