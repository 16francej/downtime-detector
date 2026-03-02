#!/usr/bin/env node
/**
 * Verification: Deduplication does NOT merge posts outside 7-day window
 * GitHub outages on Jan 1 and Jan 15 remain two separate records
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
    id: "github-jan15",
    service: "GitHub",
    title: "GitHub outage -- second incident",
    date: "2023-01-15",
    timestamp: new Date("2023-01-15").getTime(),
    upvotes: 800,
    comments: 250,
  },
];

const result = deduplicate(posts);

assert(
  result.length === 2,
  `Expected 2 separate records (outside 7-day window), got: ${result.length}`
  );

const ids = result.map((r) => r.id);
assert(ids.includes("github-jan1"), "Expected Jan 1 post to be in result");
assert(ids.includes("github-jan15"), "Expected Jan 15 post to be in result");

console.log("✓ Posts outside 7-day window are NOT merged");
console.log(`  Input: ${posts.length} posts`);
console.log(`  Output: ${result.length} posts (correctly separate)`);
process.exit(0);
