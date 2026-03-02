---
priority: medium
type: happy-path
confidence: expanded
verification:
  - browser
---

# About Page — Can navigate back to homepage

## Context
- Users on the about page need a clear way to return to the main page

## Steps
1. Navigate to /about
2. Wait for the page to load
3. Look for a link back to the homepage
4. Click the link

## Expected
- A link to the homepage (e.g., "Downtime Detector" title or "Back" link) is visible
- Clicking it navigates back to /
- The homepage loads correctly with all data
