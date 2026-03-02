#!/usr/bin/env node
/**
 * Verification: LLM correctly classifies an active outage post
 * Post: "AWS S3 is down"
 * Expected: is_outage: true, service = "AWS S3" or "AWS", summary generated
 */

import { classify, assert } from "./classifier.js";

const post = { title: "AWS S3 is down", upvotes: 500, comments: 120 };
const result = classify(post);

assert(result.is_outage === true, "Expected is_outage: true, got: " + result.is_outage);
assert(
  result.service !== undefined &&
    (result.service.includes("AWS") || result.service.includes("S3")),
  "Expected service to contain AWS or S3, got: " + result.service
);
assert(
  typeof result.summary === "string" && result.summary.length > 0,
  "Expected a non-empty summary, got: " + result.summary
);

console.log("Active outage classification passed");
console.log("  is_outage: " + result.is_outage);
console.log("  service: " + result.service);
console.log("  summary: " + result.summary);
process.exit(0);
