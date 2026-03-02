---
priority: high
type: infrastructure
confidence: expanded
verification:
  - script: specs/scripts/data-quality/service-depth.ts
---

# Data-quality — High-traffic services have multiple outage entries

## Context
- Major cloud providers and platforms have had many outages over the years
- Services like AWS, Google, GitHub, Cloudflare should have substantial representation

## Steps
1. Load the outage data from public/outages.json
2. Count entries per service

## Expected
- AWS has at least 5 outage entries
- Google has at least 4 outage entries
- GitHub has at least 4 outage entries
- Cloudflare has at least 3 outage entries
- No more than 50% of services have only a single entry
