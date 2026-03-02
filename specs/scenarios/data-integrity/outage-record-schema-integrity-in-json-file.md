---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-integrity/schema-integrity.ts
---

# Data-integrity — Outage record schema integrity in JSON file

## Context
- Pipeline has completed and generated the static JSON file

## Steps
1. Inspect the generated JSON file

## Expected
- Every record contains: service name (string), HN post title (string), HN post URL (valid URL), upvote count (number ≥ 0), comment count (number ≥ 0), date (ISO 8601 string), LLM-generated summary (string)
- No records have null or undefined required fields
- Dates are parseable and within the expected 10-year range
