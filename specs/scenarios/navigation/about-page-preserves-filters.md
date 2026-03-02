---
priority: low
type: edge-case
confidence: inferred
verification:
  - browser
---

# Navigation — Navigating to about and back preserves filter state

## Context
- If a user has filters applied, navigating to /about and back should preserve them
- Filter state is stored in URL parameters

## Steps
1. Navigate to the homepage at /
2. Select a service filter (e.g., "AWS")
3. Note the URL has ?services=AWS
4. Click the "About" link
5. Navigate back to the homepage using browser back or home link

## Expected
- After returning to homepage, the AWS filter is still applied
- URL still contains ?services=AWS
- Table shows only AWS outages
