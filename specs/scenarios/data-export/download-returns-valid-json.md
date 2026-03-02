---
priority: high
type: happy-path
confidence: expanded
verification:
  - script: specs/scripts/data-quality/download-valid.ts
---

# Data Export — Downloaded JSON is valid and parseable

## Context
- The /outages.json endpoint should return valid JSON
- The data should match what's displayed on the page

## Steps
1. Fetch /outages.json
2. Parse the response as JSON
3. Validate the structure

## Expected
- Response is valid JSON
- Data is an array of objects
- Each object has all required fields (id, service, date, title, url, hn_url, upvotes, comments, summary, timestamp, severity)
- Array is not empty
