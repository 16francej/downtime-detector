---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# Data Export — Download dataset link is visible on page

## Context
- HN users value downloadable datasets
- A visible link to download the JSON data should be on the page

## Steps
1. Navigate to the homepage at /
2. Wait for the page to load
3. Look for a download link for the dataset

## Expected
- A link or button labeled "Download Dataset" or "Download JSON" is visible
- The link points to /outages.json
- The link is easy to find (in header, footer, or near the data table)
