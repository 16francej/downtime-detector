---
priority: high
type: happy-path
confidence: expanded
---

# Visualization — Scatter plot X axis correctly spans the full 10-year range

## Context
- Data spans from 2014 to 2024

## Steps
1. Open the application and examine the scatter plot X axis

## Expected
- X axis starts at approximately 10 years ago
- X axis ends at the current date
- Year labels are visible and evenly spaced
- Data points align correctly with their dates on the axis

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000",
    "description": "Open the application"
  },
  {
    "type": "wait",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Wait for the scatter plot to load"
  },
  {
    "type": "assert",
    "selector": "role=img[name='Outage Timeline']",
    "description": "Verify the scatter plot is visible"
  },
  {
    "type": "assert",
    "selector": "text=2014",
    "description": "Verify X axis starts at approximately 10 years ago (2014)"
  },
  {
    "type": "assert",
    "selector": "text=2024",
    "description": "Verify X axis ends at the current date (2024)"
  },
  {
    "type": "assert",
    "selector": "text=2015",
    "description": "Verify year label 2015 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2016",
    "description": "Verify year label 2016 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2017",
    "description": "Verify year label 2017 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2018",
    "description": "Verify year label 2018 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2019",
    "description": "Verify year label 2019 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2020",
    "description": "Verify year label 2020 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2021",
    "description": "Verify year label 2021 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2022",
    "description": "Verify year label 2022 is visible"
  },
  {
    "type": "assert",
    "selector": "text=2023",
    "description": "Verify year label 2023 is visible"
  }
]
```
