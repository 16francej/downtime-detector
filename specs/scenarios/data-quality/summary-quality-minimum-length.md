---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/summary-quality.ts
---

# Data-quality — Summaries meet minimum quality standards

## Context
- Each outage has an LLM-generated summary displayed in the table and tooltip
- Summaries that are too short are uninformative; too long overwhelms the UI

## Steps
1. Load the outage data from public/outages.json
2. Check each summary for length and content quality

## Expected
- Every summary is at least 50 characters long
- Every summary is no more than 300 characters long
- No two summaries are identical
- Every summary contains the service name or a clear reference to the affected service
