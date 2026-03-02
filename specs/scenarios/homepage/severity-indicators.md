---
priority: medium
type: happy-path
confidence: direct
---

# Homepage — Severity indicators on outage entries

## Context
- Each outage entry has been categorized with a severity level
- Severity is displayed as a color-coded badge in the table

## Steps
1. Navigate to the homepage at /
2. Look at the outage list table

## Expected
- The outage table has a "Severity" column
- Entries show one of "major", "moderate", or "minor" as severity values
- Severity badges are color-coded with distinct colors for each level (e.g., red for major, yellow/orange for moderate, green/blue for minor)

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3000/",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=region[name='Famous Outage Incidents']",
    "description": "Wait for the outage list section to be visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is visible"
  },
  {
    "type": "assert",
    "selector": "text=Severity",
    "description": "Verify the Severity column header exists in the table"
  },
  {
    "type": "assert",
    "selector": "text=major",
    "description": "Verify at least one entry shows 'major' severity"
  },
  {
    "type": "assert",
    "selector": "text=moderate",
    "description": "Verify at least one entry shows 'moderate' severity"
  },
  {
    "type": "assert",
    "selector": "text=minor",
    "description": "Verify at least one entry shows 'minor' severity"
  }
]
```
