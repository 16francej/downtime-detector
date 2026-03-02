---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/id-uniqueness.ts
---

# Data-quality — All record IDs are unique

## Context
- Each outage record must have a unique identifier
- Duplicate IDs would cause React key conflicts and data inconsistencies

## Steps
1. Load the outage data from public/outages.json
2. Extract all id fields
3. Check for duplicates

## Expected
- No two records share the same id value
- Every record has a non-empty id field
