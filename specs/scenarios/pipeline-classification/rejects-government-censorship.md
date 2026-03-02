---
priority: medium
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classifier-false-positives.ts
---

# Pipeline Classification — Rejects government censorship and protest actions

## Context
- The classifier must filter out government actions and protest slowdowns
- "China Clamps Down on Web" and "Websites Slow Down for Net Neutrality" are not service outages

## Steps
1. Import the classify function from classifier.ts
2. Pass titles about government censorship and protest actions
3. Check classification result

## Expected
- classify() returns is_outage: false for censorship and protest titles
- Voluntary protest slowdowns are not classified as outages
