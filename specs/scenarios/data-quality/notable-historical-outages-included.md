---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/data-quality/notable-outages.ts
---

# Data-quality — Notable historical outages are included in the dataset

## Context
- The tracker bills itself as covering "famous service outages"
- Well-known outages that made major news should be present

## Steps
1. Load the outage data from public/outages.json
2. Check for the presence of well-known outages

## Expected
- Dataset includes the Dyn DNS attack (2016) that took down Twitter, GitHub, Netflix
- Dataset includes the CrowdStrike/Windows BSOD incident (2024)
- Dataset includes the Atlassian outage (2022) that lasted ~2 weeks
- Dataset includes the Let's Encrypt certificate expiry issue (2021)
- At least 3 of these 4 notable outages are present
