---
priority: medium
type: edge-case
confidence: expanded
verification:
  - browser
---

# Accessibility — Engagement badges convey info beyond color alone

## Context
- Engagement badges use color (red/orange/green) to indicate level
- Color alone is not sufficient for colorblind users

## Steps
1. Navigate to the homepage at /
2. Wait for the outage table to load
3. Inspect the engagement badges

## Expected
- Each badge displays text label ("High", "Medium", "Low") alongside color
- Information is not conveyed by color alone
- A colorblind user can determine the engagement level from text
