---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# Engagement — Timeline tooltip shows engagement level

## Context
- When hovering over a dot in the scatter plot, the tooltip should show engagement level
- Should use "High/Medium/Low" labels, not "Major/Moderate/Minor"

## Steps
1. Navigate to the homepage at /
2. Wait for the timeline scatter plot to load
3. Hover over a dot in the scatter plot
4. Read the tooltip content

## Expected
- Tooltip displays the engagement level (High, Medium, or Low)
- Tooltip does not use "Major", "Moderate", or "Minor" labels
