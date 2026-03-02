---
priority: medium
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-false-positives.ts
---

# Data Quality — No government censorship or political protest records

## Context
- The outage dataset should only contain actual service outages
- Government censorship ("clamps down") and protest slowdowns are not service outages

## Steps
1. Load the outages dataset from public/outages.json
2. Check for records about government censorship, net neutrality protests, or political actions
3. Verify no such records exist

## Expected
- Zero records about government censorship (e.g., "China Clamps Down")
- Zero records about protest slowdowns (e.g., "Websites Slow Down for Net Neutrality")
- Only genuine technical service outages remain
