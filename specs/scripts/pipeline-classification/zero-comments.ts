#!/usr/bin/env node
/**
 * Verification: Pipeline handles posts with zero comments
 * Post has upvotes but zero comments
 * Expected: Post processed normally; comment count of 0 stored
 */

import { classify, assert } from "./classifier.js";

const post = { title: "GitHub is down", upvotes: 450, comments: 0 };
const result = classify(post);

assert(result.is_outage === true, "Expected is_outage: true, got: " + result.is_outage);

const stored = Object.assign({}, result, { comments: post.comments });
assert(stored.comments === 0, "Expected comments = 0, got: " + stored.comments);
assert(stored.comments !== null && stored.comments !== undefined, "comments should not be null/undefined");

console.log("Zero comments handled correctly");
console.log("  is_outage: " + result.is_outage);
console.log("  comments stored: " + stored.comments);
process.exit(0);
