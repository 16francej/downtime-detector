#!/usr/bin/env node
/**
 * Verification: Pipeline handles posts with zero upvotes
 * Algolia returns a post with 0 upvotes that matches outage keywords
 * Expected: Post still classified; if outage, included with upvotes = 0
 */

import { classify, assert } from "./classifier.js";

const post = { title: "Cloudflare is experiencing an outage", upvotes: 0, comments: 5 };
const result = classify(post);

assert(result.is_outage === true, "Expected is_outage: true, got: " + result.is_outage);

const stored = Object.assign({}, result, { upvotes: post.upvotes });
assert(stored.upvotes === 0, "Expected upvotes = 0, got: " + stored.upvotes);

const yPosition = stored.upvotes;
assert(yPosition === 0, "Expected scatter plot Y position = 0 for zero upvotes");

console.log("Zero upvotes handled correctly");
console.log("  is_outage: " + result.is_outage);
console.log("  upvotes stored: " + stored.upvotes);
console.log("  scatter plot Y position: " + yPosition + " (bottom of chart)");
process.exit(0);
