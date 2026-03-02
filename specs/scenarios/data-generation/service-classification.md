---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-generation/service-classification.ts
---

# Data-generation — Service classification is correct

## Context
- The pipeline has run and produced `public/outages.json`
- All entries must have a recognized service name

## Steps
1. Read `public/outages.json`
2. Check no entries have "Unknown Service" as the service name
3. Check service names match canonical forms
4. Check common services have sufficient entries

## Expected
- No "Unknown Service" entries exist
- Service names use canonical forms (e.g. "AWS" not "amazon web services")
- AWS, Google, GitHub, Cloudflare, and Facebook each have at least 3 entries
