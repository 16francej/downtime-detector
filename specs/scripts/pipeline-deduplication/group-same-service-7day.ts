#!/usr/bin/env node
/**
 * Verification: Deduplication groups posts about same service within 7-day window
 * Three GitHub posts on Jan 1, Jan 3, Jan 5 with upvotes 500, 1200, 300
 * Expected: One record kept -- the Jan 3 post with 1200 upvotes
*/

import { deduplicate, assert } from "./deduplicator.js";

const posts = [
  {
    id: "github-jan1",
    service: "GitHub",
    title: "GitHub is down",
    date: "2023-01-01",
    timestamp: new Date("2023-01-01").getTime(),
    upvotes: 500,
    comments: 120,
  },
  {
    id: "github-jan3",
    service: "GitHub",
    title: "GitHub still experiencing issues",
    date: "2023-01-03",
    timestamp: new Date("2023-01-03").getTime(),
    upvotes: 1200,
    comments: 400,
  },
  {
    id: "github-jan5",
    service: "GitHub",
    title: "GitHub outage continues",
    date: "2023-01-05",
    timestamp: new Date("2023-01-05").getTime(),
    upvotes: 300,
    comments: 80,
  },
];

const result = deduplicate(posts);

assert(result.length === 1, `Expected 1 record after deduplication, got: ${result.length}`);
assert(
  result[0].id === 'github-jan3',
  `Expected the Jan 3 post (1200 upvotes) to be kept, got: ${result[0].id}`
  );
assert(result[0].upvotes === 1200, `Expected 1200 upvotes, got: ${result[0].upvotes}`);

console.log("✓ Deduplication groups posts within 7-day window correctly");
console.log(`  Input: ${posts.length} posts`);
console.log(`  Output: ${result.length} post`);
console.log(`  Kept: ${result[0].date} post with ${result[0].upvotes} upvotes`);
process.exit(0);
