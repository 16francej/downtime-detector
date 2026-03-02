---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/no-false-positives.ts
---

# Data Quality — No opinion/discussion posts in dataset

## Context
- The outage dataset should only contain actual service outages
- "Ask HN" discussion questions and opinion pieces about quality "going down" are false positives

## Steps
1. Load the outages dataset from public/outages.json
2. Check for records that are discussion questions or opinion pieces rather than outage reports
3. Verify no such records exist

## Expected
- Zero records that are "Ask HN" discussion questions about quality decline
- Zero records that are opinion pieces like "Twitter Should Shut Me Down"
- All records represent actual service outage events
