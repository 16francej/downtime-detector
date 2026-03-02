#!/usr/bin/env node
/**
 * Verification: LLM correctly excludes a postmortem post
 * Post: "Postmortem: What caused the AWS outage last week"
 * Expected: is_outage: false, excluded, reason logged
 */

import { classify, assert } from "./classifier.js";

const post = {
  title: "Postmortem: What caused the AWS outage last week",
  upvotes: 200,
  comments: 50,
};
const result = classify(post);

assert(result.is_outage === false, "Expected is_outage: false, got: " + result.is_outage);
assert(
  typeof result.reason === "string" && result.reason.length > 0,
  "Expected a reason for exclusion, got: " + result.reason
);

console.log("Postmortem exclusion passed");
console.log("  is_outage: " + result.is_outage);
console.log("  reason: " + result.reason);
process.exit(0);
