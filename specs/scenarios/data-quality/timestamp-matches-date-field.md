---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/timestamp-date-sync.ts
---

# Data-quality — Timestamp field matches the date field for every record

## Context
- Each record has both a `date` (ISO string) and `timestamp` (epoch ms) field
- These must be consistent — the scatter plot uses timestamp for positioning

## Steps
1. Load the outage data from public/outages.json
2. For each record, convert date to epoch ms and compare with timestamp

## Expected
- For every record, `new Date(date).getTime()` equals the `timestamp` value
- No records have a timestamp that drifts more than 24 hours from the date
