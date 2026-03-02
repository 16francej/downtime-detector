---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classifier-false-positives.ts
---

# Pipeline Classification — Rejects opinion and discussion posts

## Context
- The classifier must filter out discussion questions and opinion pieces
- "Do you feel Google search result quality has gone down?" is a discussion, not an outage

## Steps
1. Import the classify function from classifier.ts
2. Pass discussion/opinion titles (e.g., "Ask HN: do you feel quality has gone down?")
3. Check classification result

## Expected
- classify() returns is_outage: false for opinion and discussion titles
- "Should Shut Me Down" opinion pieces are not classified as outages
