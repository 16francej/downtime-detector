#!/usr/bin/env node
/**
 * Verification: LLM handles ambiguous keyword matches correctly
 * Post: "Show HN: Down — a minimalist markdown editor"
 * Expected: NOT an outage; "Down" recognized as a product name
 */

import { classify, assert } from "./classifier.js";

const post = {
  title: "Show HN: Down — a minimalist markdown editor",
  upvotes: 150,
  comments: 30,
};
const result = classify(post);

assert(
  result.is_outage === false,
  "Expected is_outage: false for Show HN product, got: " + result.is_outage
);

console.log("Ambiguous keyword match handled correctly");
console.log("  is_outage: " + result.is_outage);
console.log("  reason: " + result.reason);
process.exit(0);
