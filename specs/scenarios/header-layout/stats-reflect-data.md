---
priority: high
type: infrastructure
confidence: expanded
verification:
  - browser
---

# Header-layout — Stats are dynamically computed from data

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Read the inline stats in the header

## Expected
- The incident count matches the actual number of records in the dataset
- The service count matches the number of unique services in the dataset
- The "since" year matches the earliest outage date in the dataset
