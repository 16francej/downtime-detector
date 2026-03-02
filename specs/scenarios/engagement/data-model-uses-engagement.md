---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/engagement-labels.ts
---

# Engagement — Data model uses "high/medium/low" values

## Context
- The severity field values should change from "major/moderate/minor" to "high/medium/low"
- Or the field should be renamed from "severity" to "engagement"

## Steps
1. Load the outages dataset from public/outages.json
2. Check the severity/engagement field values on all records

## Expected
- All records use consistent engagement values
- Values are from the set: "high", "medium", "low"
- No records use "major", "moderate", or "minor"
