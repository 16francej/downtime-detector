---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-false-positives.ts
---

# Data Quality — No stock price "shares are down" records in dataset

## Context
- The outage dataset should only contain actual service outages
- Records about stock prices declining are false positives

## Steps
1. Load the outages dataset from public/outages.json
2. Check every record title for stock/financial "down" patterns
3. Verify no records about stock prices or financial declines exist

## Expected
- Zero records contain "shares are down", "stock down", or similar financial decline language
- All records represent actual service outages
