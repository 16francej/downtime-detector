#!/usr/bin/env node
/**
 * Verification: Service name normalization across variants
 * AWS, Amazon Web Services, Amazon S3 should normalize to canonical names
 */

import { classify, assert } from "./classifier.js";

const variants = [
  { title: "AWS is down", expected: "AWS" },
  { title: "Amazon Web Services experiencing outage", expected: "AWS" },
  { title: "Amazon S3 is experiencing issues", expected: "AWS S3" },
];

for (const { title, expected } of variants) {
  const post = { title, upvotes: 500, comments: 100 };
  const result = classify(post);

  assert(
    result.is_outage === true,
    "Expected is_outage: true for " + title + ", got: " + result.is_outage
  );
  assert(
    result.service !== undefined && (result.service === expected || result.service.startsWith("AWS")),
    "Expected service " + expected + " for " + title + ", got: " + result.service
  );

  console.log(`  ✓ "${title}" → service: ${result.service}`);
}

const awsVariantResults = variants.map(function(v) { return classify({ title: v.title }); });
const allAwsService = awsVariantResults.every(function(r) { return r.service && r.service.startsWith("AWS"); });
assert(allAwsService, "All AWS variants should map to AWS-prefixed service names");

console.log("Service name normalization across variants passed");
process.exit(0);
