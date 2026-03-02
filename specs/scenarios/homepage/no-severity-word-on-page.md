---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Homepage — Word "severity" does not appear on the page

## Context
- After renaming severity to engagement, the word "severity" should not appear anywhere
- This includes table headers, badges, tooltips, and aria labels

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load
3. Search the visible page content for the word "severity"

## Expected
- The word "severity" does not appear anywhere on the page
- The word "major" does not appear as an engagement label
- The word "moderate" does not appear as an engagement label
- The word "minor" does not appear as an engagement label
