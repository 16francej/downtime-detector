---
priority: medium
type: edge-case
confidence: expanded
verification:
  - browser
---

# Severity-system — Only three severity levels used

## Context
- App is loaded with all outage data

## Steps
1. Navigate to the homepage
2. Observe all severity indicators in the table and chart

## Expected
- Exactly three engagement levels exist: High, Medium, Low
- No other levels appear (no "critical", "warning", "major", "moderate", "minor", etc.)
- Every incident has one of these three levels assigned
