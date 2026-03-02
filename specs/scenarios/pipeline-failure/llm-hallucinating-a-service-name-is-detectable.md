---
priority: medium
type: failure-mode
confidence: direct
verification:
  - script: specs/scripts/pipeline-failure/llm-hallucination-detection.ts
---

# Pipeline-failure — LLM hallucinating a service name is detectable

## Context
- LLM classifies a post about a GitHub outage but returns service name 'GitLab'

## Steps
1. Run classification on the post
2. Review the output

## Expected
- Ideally, a validation step cross-checks the service name against the post title and URL
- Mismatches are flagged for manual review
- If no validation exists, the hallucinated name propagates to the dataset (known limitation)
