---
priority: high
type: happy-path
confidence: expanded
verification:
  - browser
---

# Filter-design — Service dropdown opens and lists services

## Context
- App is loaded at the root URL

## Steps
1. Navigate to the homepage
2. Click the service filter dropdown

## Expected
- Dropdown opens showing a list of available services
- Services are listed with readable names
- Search/typeahead functionality works to narrow the list
- Selecting a service updates both the chart and the table
