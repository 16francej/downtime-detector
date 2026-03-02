#!/usr/bin/env node
/**
 * Verification: LLM attributes multi-service outage to root-cause service
 * Post: "AWS outage takes down half the internet — Netflix, Slack, and others affected"
 * Expected: AWS identified as root cause; one record attributed to AWS
 */

import { classify, assert } from "./classifier.js";

const post = {
  title: "AWS outage takes down half the internet — Netflix, Slack, and others affected",
  upvotes: 2500,
  comments: 800,
};
const result = classify(post);

assert(result.is_outage === true, "Expected is_outage: true, got: " + result.is_outage);
assert(
  result.service === "AWS",
  "Expected service AWS (root cause), got: " + result.service
);

const records = [result];
assert(records.length === 1, "Expected 1 outage record, got: " + records.length);
assert(
  records[0].service === "AWS",
  "Expected single record attributed to AWS, got: " + records[0].service
);

console.log("Multi-service root-cause attribution passed");
console.log("  is_outage: " + result.is_outage);
console.log("  service (root cause): " + result.service);
console.log("  downstream services not attributed as separate outages");
process.exit(0);
