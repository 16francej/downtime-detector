---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-false-positives.ts
---

# Data Quality — No DMCA/copyright "take down" records in dataset

## Context
- The outage dataset should only contain actual service outages
- Records about DMCA takedowns or copyright removals are false positives

## Steps
1. Load the outages dataset from public/outages.json
2. Check every record title for DMCA/copyright takedown patterns like "take down", "takes down" in non-outage contexts
3. Verify no records about copyright or legal content removal exist

## Expected
- Zero records about DMCA notices, copyright takedowns, or content removal
- "take down" only appears in genuine outage contexts (e.g., "DDoS takes down service")
