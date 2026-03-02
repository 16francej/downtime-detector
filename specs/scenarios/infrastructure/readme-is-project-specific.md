---
priority: high
type: infrastructure
confidence: direct
verification:
  - script: specs/scripts/infrastructure/readme-check.ts
---

# Infrastructure — README describes the project, not boilerplate

## Context
- The README.md was previously the default create-next-app boilerplate
- It should describe the Downtime Detector project specifically

## Steps
1. Read README.md from the project root
2. Check content is project-specific

## Expected
- README mentions "Downtime Detector" or "HN Outage Tracker"
- README does not contain "This is a [Next.js] project bootstrapped with create-next-app"
- README includes a project description
- README includes instructions for running locally
- README mentions the data source (Hacker News)
