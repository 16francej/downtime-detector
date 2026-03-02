---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classifier-false-positives.ts
---

# Pipeline Classification — Rejects DMCA/copyright takedown titles

## Context
- The classifier must filter out DMCA and copyright takedown posts
- Titles like "HBO Asks Google to Take Down VLC" match "take down" but are not outages

## Steps
1. Import the classify function from classifier.ts
2. Pass titles about DMCA takedowns (e.g., "HBO Asks Google to Take Down 'Infringing' VLC")
3. Check classification result

## Expected
- classify() returns is_outage: false for DMCA/copyright takedown titles
- Titles about legal content removal are not classified as outages
