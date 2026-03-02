---
priority: medium
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/pipeline-google-search/cross-reference-missed-outages.ts
---

# Pipeline-google-search — Google search cross-reference catches missed high-profile outages

## Context
- Algolia keyword search missed a famous outage (e.g., Facebook 6-hour outage in 2021 posted with unusual title)

## Steps
1. Run the Google search cross-reference step
2. Observe the candidate posts found

## Expected
- Google search identifies the missed HN post about the Facebook outage
- The post is added to the candidate list for LLM classification
- Duplicates with already-found Algolia results are removed before classification
