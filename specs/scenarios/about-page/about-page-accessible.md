---
priority: high
type: happy-path
confidence: direct
verification:
  - browser
---

# About Page — About page is accessible and loads

## Context
- A separate /about page explains methodology, data sources, and limitations
- It should be linked from the main page header

## Steps
1. Navigate to /about
2. Wait for the page to load

## Expected
- Page loads without errors
- Page displays a heading like "About" or "Methodology"
- Page contains information about data sources (Hacker News Algolia API)
- Page contains information about the classification pipeline
- Page contains a section about limitations or caveats
