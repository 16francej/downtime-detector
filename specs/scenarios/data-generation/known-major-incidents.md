---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-generation/known-major-incidents.ts
---

# Data-generation — Known major incidents are present in generated data

## Context
- The pipeline has run and produced `public/outages.json`
- Certain well-known major outages must be present to validate coverage

## Steps
1. Read `public/outages.json`
2. Check for presence of known major incidents by service and year

## Expected
- Facebook BGP outage (2021) is present
- CrowdStrike BSOD incident (2024) is present
- AWS S3 outage (2017) is present
- Dyn DNS DDoS attack (2016) is present
- Cloudflare WAF outage (2019) is present
- GitLab database deletion (2017) is present
