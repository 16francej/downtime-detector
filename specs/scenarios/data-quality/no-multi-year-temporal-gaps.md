---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-multi-year-gaps.ts
---

# Data-quality — No multi-year temporal gaps in outage data

## Context
- The outage dataset should provide continuous coverage across its date range
- Large temporal gaps make the scatter plot look sparse and undermine credibility

## Steps
1. Load the outage data from public/outages.json
2. Sort all records by date
3. Check the gap between consecutive years

## Expected
- Every calendar year between the earliest and latest record has at least one outage entry
- No gap of more than 18 months exists between consecutive outage records
- The scatter plot X axis has data points distributed across the full range
