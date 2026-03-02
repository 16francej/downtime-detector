---
priority: high
type: happy-path
confidence: direct
---

# Filtering — ServiceFilter date range narrows displayed outages

## Context
- Scatter plot has data spanning 10 years

## Steps
1. Set the date range start to '2020-01-01'
2. Set the date range end to '2022-12-31'

## Expected
- Scatter plot only displays outages between January 2020 and December 2022
- X axis adjusts to show only the selected date range
- OutageList updates to reflect the same date filter

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
    "value": "2020-01-01",
    "description": "Set the date range start to 2020-01-01"
  },
  {
    "type": "fill",
    "selector": "input[type='date'][name='endDate'], input[placeholder*='end' i], input[aria-label*='end' i]",
    "value": "2022-12-31",
    "description": "Set the date range end to 2022-12-31"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to update with filtered data"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible and updated with filtered data"
  },
  {
    "type": "assert",
    "selector": "text=2020",
    "description": "Verify X axis shows 2020 as part of the selected date range"
  },
  {
    "type": "assert",
    "selector": "text=2022",
    "description": "Verify X axis shows 2022 as part of the selected date range"
  },
  {
    "type": "assert",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Verify the OutageList section is present and updated"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table reflects the filtered date range"
  }
]
```
