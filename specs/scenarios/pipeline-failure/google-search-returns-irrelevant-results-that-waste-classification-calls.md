---
priority: medium
type: failure-mode
confidence: direct
verification:
  - script: specs/scripts/pipeline-failure/google-irrelevant-results.ts
---

# Pipeline-failure — Google search returns irrelevant results that waste classification calls

## Context
- Google search returns HN posts about topics tangentially related to outages

## Steps
1. Run the Google cross-reference step
2. Observe classification calls on irrelevant results

## Expected
- Irrelevant posts are correctly filtered out by LLM classification (is_outage: false)
- Cost impact is logged so operators can assess whether Google search step is worthwhile
- Irrelevant results do not appear in the final dataset
