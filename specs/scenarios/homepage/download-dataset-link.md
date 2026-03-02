---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Homepage — Download dataset link is present

## Context
- Users should be able to download the raw JSON dataset
- Link should be visible and accessible

## Steps
1. Navigate to the homepage at /
2. Wait for the page to load
3. Look for a download link

## Expected
- A link or button to download the dataset is visible on the page
- The link href points to /outages.json or triggers a download of the JSON file
