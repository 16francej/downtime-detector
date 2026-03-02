#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const README_PATH = join(process.cwd(), "README.md");

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

function main() {
  // Check README exists
  assert(existsSync(README_PATH), "README.md does not exist in project root");

  const content = readFileSync(README_PATH, "utf-8");

  // Check it's not empty
  assert(content.trim().length > 0, "README.md is empty");

  // Check it's not the default create-next-app boilerplate
  assert(
    !content.includes("This is a [Next.js](https://nextjs.org) project bootstrapped with"),
    'README.md contains default create-next-app boilerplate ("This is a [Next.js] project bootstrapped with...")'
  );

  assert(
    !content.includes("bootstrapped with [`create-next-app`]"),
    "README.md contains default create-next-app boilerplate"
  );

  // Check it mentions the project name
  const lowerContent = content.toLowerCase();
  const mentionsProject =
    lowerContent.includes("downtime detector") ||
    lowerContent.includes("hn outage tracker") ||
    lowerContent.includes("outage tracker");

  assert(
    mentionsProject,
    'README.md does not mention "Downtime Detector" or "HN Outage Tracker"'
  );

  // Check it includes a project description (at least a heading and some text)
  assert(
    content.includes("#"),
    "README.md has no headings — expected at least a project title"
  );

  assert(
    content.length > 200,
    `README.md is too short (${content.length} chars) — expected meaningful content`
  );

  // Check it includes run instructions
  const hasRunInstructions =
    lowerContent.includes("npm run dev") ||
    lowerContent.includes("npm start") ||
    lowerContent.includes("getting started") ||
    lowerContent.includes("how to run") ||
    lowerContent.includes("installation") ||
    lowerContent.includes("development");

  assert(
    hasRunInstructions,
    "README.md does not include instructions for running locally"
  );

  // Check it mentions the data source
  const mentionsDataSource =
    lowerContent.includes("hacker news") ||
    lowerContent.includes("hn") ||
    lowerContent.includes("ycombinator");

  assert(
    mentionsDataSource,
    "README.md does not mention Hacker News as a data source"
  );

  console.log("✓ README.md is project-specific with description, run instructions, and data source info");
  process.exit(0);
}

main();
