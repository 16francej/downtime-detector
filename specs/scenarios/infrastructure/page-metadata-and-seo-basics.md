---
priority: low
type: happy-path
confidence: inferred
---

# Infrastructure — Page metadata and SEO basics

## Context
- The page is a publicly accessible Next.js page

## Steps
1. Open the page and inspect the HTML head

## Expected
- Page has a descriptive <title> tag (e.g., 'HN Outage Tracker')
- Meta description is present
- Open Graph tags are set for social sharing

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the homepage to inspect page metadata"
  },
  {
    "type": "assert",
    "selector": "text=Downtime Detector",
    "description": "Verify the page has loaded by checking the main heading is visible"
  },
  {
    "type": "wait",
    "selector": "role=main",
    "description": "Wait for the main content to be visible"
  },
  {
    "type": "assert",
    "selector": "title",
    "value": "HN Outage Tracker",
    "description": "Verify page has a descriptive title tag"
  },
  {
    "type": "assert",
    "selector": "meta[name='description']",
    "description": "Verify meta description tag is present in the HTML head"
  },
  {
    "type": "assert",
    "selector": "meta[property='og:title']",
    "description": "Verify Open Graph title tag is set for social sharing"
  },
  {
    "type": "assert",
    "selector": "meta[property='og:description']",
    "description": "Verify Open Graph description tag is set for social sharing"
  },
  {
    "type": "assert",
    "selector": "meta[property='og:type']",
    "description": "Verify Open Graph type tag is set for social sharing"
  }
]
```
