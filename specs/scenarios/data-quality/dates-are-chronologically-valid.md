---
priority: medium
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/dates-valid.ts
---

# Data-quality — All dates are valid ISO 8601 and within expected range

## Context
- Dates are displayed in the table and used for scatter plot positioning
- Invalid or out-of-range dates would break the visualization

## Steps
1. Load the outage data from public/outages.json
2. Validate each date field

## Expected
- Every date matches ISO 8601 format (YYYY-MM-DD)
- No dates are in the future
- No dates are before 2010 (the reasonable start of the tracker's scope)
- Dates are parseable by JavaScript's Date constructor
