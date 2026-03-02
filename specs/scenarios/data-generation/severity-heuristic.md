---
priority: high
type: happy-path
confidence: direct
verification:
  - script: specs/scripts/data-generation/severity-heuristic.ts
---

# Data-generation — Severity heuristic matches upvote thresholds

## Context
- The pipeline has run and produced `public/outages.json`
- Severity is assigned based on upvote count thresholds

## Steps
1. Read `public/outages.json`
2. For each record, verify severity matches the upvote-based heuristic

## Expected
- Records with upvotes > 1000 have severity "major"
- Records with upvotes > 300 (but <= 1000) have severity "moderate"
- Records with upvotes <= 300 have severity "minor"
