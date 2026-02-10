---
priority: medium
type: happy-path
confidence: direct
---

# Homepage — Filter outages by service

## Context
- User is on the homepage
- Multiple outage entries from different services are displayed

## Steps
1. Navigate to the homepage at /
2. Wait for the page to fully load
3. Look for a filter or dropdown to select a specific service
4. Click on or select "AWS" from the filter options

## Expected
- The outage list updates to show only AWS-related incidents
- Non-AWS incidents are hidden from the list
- The timeline visualization updates to reflect the filter
