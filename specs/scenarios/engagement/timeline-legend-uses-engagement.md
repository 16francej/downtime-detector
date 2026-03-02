---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Engagement — Timeline legend uses engagement labels

## Context
- The scatter plot legend should use "High/Medium/Low" engagement labels
- This matches the table column rename

## Steps
1. Navigate to the homepage at /
2. Wait for the timeline scatter plot to load
3. Inspect the legend in the top-right area of the chart

## Expected
- Legend shows "High" with red dot (not "Major")
- Legend shows "Medium" with orange dot (not "Moderate")
- Legend shows "Low" with green dot (not "Minor")
