---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Engagement — Badges show High/Medium/Low labels

## Context
- Engagement badges replace the old severity badges
- Labels should be "High", "Medium", "Low" instead of "Major", "Moderate", "Minor"

## Steps
1. Navigate to the homepage at /
2. Wait for the outage table to load
3. Inspect the engagement badge labels in the table rows

## Expected
- Badges display "High", "Medium", or "Low" text
- No badges display "Major", "Moderate", or "Minor" text
- Badge colors remain: red for High, orange for Medium, green for Low
