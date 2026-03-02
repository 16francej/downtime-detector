---
priority: medium
type: edge-case
confidence: expanded
verification:
  - browser
---

# Accessibility — Table uses semantic HTML

## Context
- App is loaded with outage data

## Steps
1. Navigate to the homepage
2. Inspect the incident table HTML structure

## Expected
- Table uses proper `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements
- Table header cells use `<th>` with appropriate scope attributes
- Table is wrapped in a section with a heading for context
