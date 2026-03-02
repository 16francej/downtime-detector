---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/classifier-false-positives.ts
---

# Pipeline Classification — Rejects stock price decline titles

## Context
- The classifier must filter out stock market posts
- "Shares are down" matches "down" keyword but describes financial movements, not outages

## Steps
1. Import the classify function from classifier.ts
2. Pass titles about stock prices (e.g., "Nvidia shares are down after report...")
3. Check classification result

## Expected
- classify() returns is_outage: false for stock/financial decline titles
- Reason indicates false positive detection
