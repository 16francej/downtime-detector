---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-generation/output-schema.ts
---

# Data-generation — Output schema is valid

## Context
- The pipeline has run and produced `public/outages.json`
- Every record must conform to the Outage interface

## Steps
1. Read `public/outages.json`
2. Validate every record has all required fields
3. Validate field types and formats

## Expected
- Every record has: id, service, date, title, url, hn_url, upvotes, comments, summary, timestamp, severity
- `date` is ISO 8601 format (YYYY-MM-DD)
- `severity` is one of "major", "moderate", "minor"
- `upvotes` >= 50 for all records
- `summary` is 10-300 characters long
- `id`, `service`, `title`, `url`, `hn_url` are non-empty strings
- `upvotes`, `comments`, `timestamp` are numbers
