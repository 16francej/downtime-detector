#!/usr/bin/env node
/**
 * Verification: Pipeline correctly identifies services with short/common names
 * Post: "Zoom is down"
 * Expected: Zoom correctly identified as the video conferencing service
 */

import { classify, assert } from "./classifier.js";

const post = { title: "Zoom is down", upvotes: 300, comments: 60 };
const result = classify(post);

assert(result.is_outage === true, "Expected is_outage: true, got: " + result.is_outage);
assert(
  result.service === "Zoom",
  "Expected service Zoom, got: " + result.service
);

console.log("Short/common service name (Zoom) identified correctly");
console.log("  service: " + result.service);
process.exit(0);
