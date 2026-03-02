---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-integrity/required-fields-for-display.ts
---

# Data-integrity — Outage data includes all required fields for display

## Context
- UI components expect specific fields from the JSON data

## Steps
1. Verify each outage record in the JSON matches the expected schema

## Expected
- Every record has: service (string), title (string), url (string), hn_url (string), upvotes (number), comments (number), date (string), summary (string)
- No fields are missing or mistyped
- The UI renders all fields without fallback or error handling being triggered
