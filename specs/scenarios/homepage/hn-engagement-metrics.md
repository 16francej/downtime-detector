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
