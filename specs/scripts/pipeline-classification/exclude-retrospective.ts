#!/usr/bin/env node
/**
 * Verification: LLM correctly excludes a retrospective or tangential mention
 * Post: "The history of major internet outages"
 * Expected: classified as not active, excluded
 */

import { classify, assert } from "./classifier.js";

const post = {
  title: "The history of major internet outages",
  upvotes: 300,
  comments: 80,
};
const result = classify(post);

assert(result.is_outage === false, "Expected is_outage: false, got: " + result.is_outage);

console.log("Retrospective exclusion passed");
console.log("  is_outage: " + result.is_outage);
console.log("  reason: " + result.reason);
process.exit(0);
