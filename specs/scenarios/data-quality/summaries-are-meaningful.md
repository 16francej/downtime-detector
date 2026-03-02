---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/summaries-meaningful.ts
---

# Data Quality — Summaries are meaningful, not templated

## Context
- Every outage record has a summary field
- Summaries should provide genuine insight, not just repeat the title
- Previously all summaries followed the template "{Service} experienced a service outage. {Title}"

## Steps
1. Load the outages dataset from public/outages.json
2. Check that no summary follows the fallback template pattern
3. Verify summaries don't simply repeat the title verbatim

## Expected
- Zero summaries match the pattern "{Service} experienced a service outage. {Title}"
- Each summary provides information beyond what's in the title
- Summaries are 1-2 sentences of factual description
