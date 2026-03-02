---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-false-positives.ts
---

# Data Quality — No product launch or marketing records in dataset

## Context
- The outage dataset should only contain actual service outages
- Records about product launches, Show HN posts, or marketing are false positives

## Steps
1. Load the outages dataset from public/outages.json
2. Check for records that are product announcements, marketing, or "makes sure...goes down" patterns
3. Verify no such records exist

## Expected
- Zero records that are product launches or marketing material
- Records like "PagerDuty Makes Sure Your Team Knows When A Server Goes Down" are excluded
