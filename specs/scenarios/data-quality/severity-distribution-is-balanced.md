---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/severity-distribution.ts
---

# Data-quality — Severity distribution is balanced across major, moderate, and minor

## Context
- Each outage is categorized as major, moderate, or minor
- An imbalanced distribution suggests poor classification

## Steps
1. Load the outage data from public/outages.json
2. Count records per severity level

## Expected
- All three severity levels (major, moderate, minor) are represented
- No single severity level accounts for more than 60% of all records
- The "minor" severity has at least 3 records
