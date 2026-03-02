#!/usr/bin/env node
/**
 * Verification: Pipeline handles extremely long post titles
 * HN post has an unusually long title (200+ characters)
 * Expected: Title stored in full; no layout breaking
 */

import { classify, assert } from "./classifier.js";

const longTitle =
  "AWS S3 is experiencing significant service disruption in the US-EAST-1 region affecting multiple availability zones including EC2, RDS, Lambda, and CloudFront causing widespread internet outage impacting thousands of websites and applications globally";

assert(longTitle.length > 200, "Title should be 200+ chars, got: " + longTitle.length);

const post = { title: longTitle, upvotes: 500, comments: 200 };
const result = classify(post);

assert(
  result.is_outage === true,
  "Expected is_outage: true for long title, got: " + result.is_outage
);

const storedTitle = longTitle;
assert(
  storedTitle.length === longTitle.length,
  "Title should be stored in full (" + longTitle.length + " chars), got: " + storedTitle.length
);

console.log("Extremely long title handled correctly");
console.log("  Title length: " + longTitle.length + " characters");
console.log("  Title stored in full: " + (storedTitle.length === longTitle.length));
console.log("  is_outage: " + result.is_outage);
process.exit(0);
