---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classifier-false-positives.ts
---

# Pipeline Classification — Still correctly classifies real outages

## Context
- After adding new false positive patterns, real outages must still be classified correctly
- Must not over-filter legitimate outage reports

## Steps
1. Import the classify function from classifier.ts
2. Pass known real outage titles (e.g., "GitHub is down", "AWS S3 outage", "Cloudflare incident")
3. Check classification result

## Expected
- classify() returns is_outage: true for genuine outage reports
- "GitHub is down" is classified as a GitHub outage
- "AWS S3 outage affecting multiple services" is classified as an AWS S3 outage
- "Cloudflare incident causing widespread issues" is classified as a Cloudflare outage
