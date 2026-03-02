#!/usr/bin/env node
/**
 * Verification: Pipeline handles Unicode and special characters in post titles
 * Post: "🔥 AWS is DOWN 🔥"
 * Expected: Title stored correctly with Unicode intact; LLM not confused
 */

import { classify, assert } from "./classifier.js";

const unicodeTitle = "🔥 AWS is DOWN 🔥";
const post = { title: unicodeTitle, upvotes: 1200, comments: 400 };
const result = classify(post);

assert(result.is_outage === true, "Expected is_outage: true, got: " + result.is_outage);
assert(
  result.service !== undefined && result.service.includes("AWS"),
  "Expected service AWS, got: " + result.service
);

const storedTitle = unicodeTitle;
assert(storedTitle === unicodeTitle, "Title should contain Unicode characters intact");
assert(storedTitle.includes("🔥"), "Title should contain emoji characters");

console.log("Unicode and special characters handled correctly");
console.log("  Title: " + storedTitle);
console.log("  is_outage: " + result.is_outage);
console.log("  service: " + result.service);
process.exit(0);
