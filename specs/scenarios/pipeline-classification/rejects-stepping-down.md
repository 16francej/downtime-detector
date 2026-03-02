---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classifier-false-positives.ts
---

# Pipeline Classification — Rejects "stepping down" titles

## Context
- The classifier must filter out executive resignation posts
- These contain "stepping down" which matches "down" keyword but are not outages

## Steps
1. Import the classify function from classifier.ts
2. Pass titles containing "stepping down" (e.g., "Eric Schmidt Stepping Down at Google")
3. Check classification result

## Expected
- classify() returns is_outage: false for all "stepping down" titles
- Reason indicates false positive detection
