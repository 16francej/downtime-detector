---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/whitespace-clean.ts
---

# Data Quality — No whitespace issues in titles

## Context
- Some records had double spaces, leading spaces, or trailing spaces in titles
- All text fields should be properly trimmed and normalized

## Steps
1. Load the outages dataset from public/outages.json
2. Check every title for leading/trailing whitespace
3. Check every title for consecutive spaces
4. Check every summary for the same issues

## Expected
- No title has leading or trailing whitespace
- No title contains consecutive spaces
- No summary has leading or trailing whitespace
- No summary contains consecutive spaces
