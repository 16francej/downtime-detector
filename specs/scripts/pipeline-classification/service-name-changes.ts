#!/usr/bin/env node
/**
 * Verification: Services that changed names are handled
 * 2015 Heroku post vs 2023 Salesforce outage affecting Heroku
 * Expected: Each attributed to most specific relevant service name
 */

import { classify, assert } from "./classifier.js";

const herokuPost2015 = {
  title: "Heroku is down — database connectivity issues",
  upvotes: 300,
  comments: 100,
  date: "2015-03-15",
};

const salesforceHerokuPost2023 = {
  title: "Salesforce outage affecting Heroku and related services",
  upvotes: 400,
  comments: 120,
  date: "2023-03-22",
};

const result2015 = classify(herokuPost2015);
const result2023 = classify(salesforceHerokuPost2023);

assert(result2015.is_outage === true, "Expected 2015 Heroku post to be an outage");
assert(
  result2015.service === "Heroku",
  "Expected 2015 post attributed to Heroku, got: " + result2015.service
);

assert(result2023.is_outage === true, "Expected 2023 Salesforce/Heroku post to be an outage");
assert(
  result2023.service === "Salesforce" || result2023.service === "Heroku",
  "Expected 2023 post attributed to Salesforce or Heroku, got: " + result2023.service
);

console.log("Service name changes handled correctly");
console.log("  2015 post -> service: " + result2015.service);
console.log("  2023 post -> service: " + result2023.service);
process.exit(0);
