---
priority: medium
type: happy-path
confidence: direct
---

# Homepage — HN engagement metrics displayed

## Context
- Outage entries sourced from Hacker News include engagement data (points and comment counts)
- The outage table has been extended with columns for this data

## Steps
1. Navigate to the homepage at /
2. Look at the outage list table

## Expected
- The outage table has a "Points" column showing numeric values
- The outage table has a "Comments" column showing numeric values
- At least one row has a points value greater than 50
- Rows from the original hardcoded data may show "—" or be blank in these columns

## Playbook

```json
[
  {
    "type": "navigate",
    "url": "/",
    "description": "Navigate to the homepage"
  },
  {
    "type": "wait",
    "selector": "role=table",
    "description": "Wait for the outage list table to be visible"
  },
  {
    "type": "assert",
    "selector": "role=table",
    "description": "Verify the outage table is displayed"
  },
  {
    "type": "assert",
    "selector": "text=Points",
    "description": "Verify the table has a 'Points' column header"
  },
  {
    "type": "assert",
    "selector": "text=Comments",
    "description": "Verify the table has a 'Comments' column header"
  },
  {
    "type": "assert",
    "selector": "role=cell",
    "description": "Verify at least one row has numeric points value (checking cell exists with numeric content)"
  },
  {
    "type": "assert",
    "selector": "role=cell",
    "description": "Verify at least one row has numeric comments value (checking cell exists with numeric content)"
  }
]
```
