---
priority: high
type: happy-path
confidence: direct
---

# Homepage — Large dataset renders cleanly

## Context
- The app now has 30+ outage entries from both hardcoded data and HN scraping
- The timeline and list must handle larger datasets without visual or technical issues

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load
3. Scroll through the entire outage list

## Expected
- The timeline visualization displays 30+ data points without overflow or clipping
- The outage list displays 30+ rows
- No console errors appear during page load or scrolling
- The page remains responsive and usable
