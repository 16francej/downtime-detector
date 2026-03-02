#!/usr/bin/env node
/**
 * Verification: Deduplication handles different outages of same service in same 7-day window
 * Two distinct GitHub incidents within 3 days -- grouped (most upvoted retained), limitation logged
*/

import { deduplicate, assert } from "./deduplicator.js";

const posts = [
  {
    id: "github-dns-issue",
    service: "GitHub",
    title: "GitHub DNS resolution failure",
    date: "2023-03-01",
    timestamp: new Date("2023-03-01").getTime(),
    upvotes: 600,
    comments: 150,
  },
  {
    id: "github-db-issue",
    service: "GitHub",
    title: "GitHub database issues affecting pull requests",
    date: "2023-03-03",
    timestamp: new Date("2023-03-03").getTime(),
    upvotes: 450,
    comments: 100,
  },
];

const result = deduplicate(posts);

// Per business rules: group by service + 7-day window, keep most upvoted
assert(
  result.length === 1,
  `Expected 1 record (grouped within 7-day window), got: ${result.length}`
  );
assert(
  result[0].id === 'github-dns-issue',
  `Expected most upvoted post (DNS, 600 upvotes) to be retained, got: ${result[0].id}`
  );

// Log known limitation
console.log(
  "NOTE: Known limitation -- two distinct incidents within 7-day window are merged."
);
console.log(
  "  The deduplication logic groups by service+window and retains most upvoted."
);
console.log("✓ Different outages in same 7-day window deduplicated with known limitation");
process.exit(0);
