---
priority: high
type: edge-case
confidence: inferred
verification:
  - browser
---

# Accessibility — Body text meets contrast ratio on cream background

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Examine body text against the cream background

## Expected
- Primary text color has at least 4.5:1 contrast ratio against #f6f6ef
- Secondary/lighter text (dates, labels) has at least 3:1 contrast ratio
- No text is unreadable or washed out on the cream background
