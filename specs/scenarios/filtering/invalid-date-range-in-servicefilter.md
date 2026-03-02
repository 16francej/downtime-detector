---
priority: medium
type: edge-case
confidence: expanded
---

# Filtering — Invalid date range in ServiceFilter

## Context
- User attempts to set end date before start date

## Steps
1. Set start date to '2023-01-01'
2. Set end date to '2022-01-01'

## Expected
- A validation message appears indicating the date range is invalid
- Or the end date is automatically adjusted to be at or after the start date
- The scatter plot does not crash or show incorrect data

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Navigate to the Downtime Detector application"
  },
  {
    "type": "fill",
    "selector": "input[type='date'][name='startDate'], input[placeholder*='start' i], input[aria-label*='start' i]",
    "value": "2023-01-01",
    "description": "Set start date to 2023-01-01"
  },
  {
    "type": "fill",
    "selector": "input[type='date'][name='endDate'], input[placeholder*='end' i], input[aria-label*='end' i]",
    "value": "2022-01-01",
    "description": "Set end date to 2022-01-01 (before start date)"
  },
  {
    "type": "assert",
    "selector": "text=/invalid|error|must be after|cannot be before/i",
    "description": "Verify validation message appears indicating the date range is invalid"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is still rendered and has not crashed"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the outage list section is still visible and functioning"
  }
]
```
