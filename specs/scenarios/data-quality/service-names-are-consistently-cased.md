---
priority: medium
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/service-name-consistency.ts
---

# Data-quality — Service names are consistently cased and not duplicated

## Context
- The ServiceFilter uses exact string matching on service names
- "AWS" and "aws" or "Github" and "GitHub" would appear as separate services

## Steps
1. Load the outage data from public/outages.json
2. Check for case-insensitive duplicate service names

## Expected
- No two service names differ only by casing (e.g., "AWS" vs "aws")
- No service name has leading or trailing whitespace
- Service names use their canonical/official casing
