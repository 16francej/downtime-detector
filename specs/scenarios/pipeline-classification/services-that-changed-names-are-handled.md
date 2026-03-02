---
priority: low
type: edge-case
confidence: direct
verification:
  - script: specs/scripts/pipeline-classification/service-name-changes.ts
---

# Pipeline-classification — Services that changed names are handled

## Context
- A post from 2015 references 'Heroku' and a post from 2023 references a broader Salesforce outage affecting Heroku

## Steps
1. Run classification on both posts

## Expected
- Each post is attributed to the most specific relevant service name
- 'Heroku' remains 'Heroku' and 'Salesforce' remains 'Salesforce' unless the LLM determines they should be grouped
