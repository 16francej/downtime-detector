---
priority: high
type: failure-mode
confidence: expanded
verification:
  - script: specs/scripts/pipeline-failure/missing-api-key.ts
---

# Pipeline-failure — Missing ANTHROPIC_API_KEY environment variable fails immediately

## Context
- ANTHROPIC_API_KEY is not set in the environment

## Steps
1. Run the pipeline script without setting ANTHROPIC_API_KEY

## Expected
- Pipeline exits immediately with a clear error message: 'ANTHROPIC_API_KEY environment variable is not set'
- No API calls are attempted
- No partial data is written
