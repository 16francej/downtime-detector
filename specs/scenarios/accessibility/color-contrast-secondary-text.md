---
priority: medium
type: edge-case
confidence: inferred
verification:
  - browser
---

# Accessibility — Secondary text has sufficient color contrast

## Context
- Secondary text color (#666660 on #f6f6ef) may fail WCAG AA contrast requirements
- Minimum contrast ratio is 4.5:1 for normal text, 3:1 for large text

## Steps
1. Navigate to the homepage at /
2. Wait for the page to load
3. Inspect secondary/muted text elements (dates, labels, descriptions)

## Expected
- All text is readable against its background
- Secondary text has a contrast ratio of at least 4.5:1
- No text appears washed out or difficult to read
