---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classifier-false-positives.ts
---

# Pipeline Classification — Rejects product announcements mentioning "down"

## Context
- The classifier must filter out product launches that mention "down" in marketing context
- "Makes Sure Your Team Knows When A Server Goes Down" is marketing, not an outage

## Steps
1. Import the classify function from classifier.ts
2. Pass product announcement titles that incidentally contain "down"
3. Check classification result

## Expected
- classify() returns is_outage: false for product marketing titles
- PagerDuty product launch is not classified as a PagerDuty outage
