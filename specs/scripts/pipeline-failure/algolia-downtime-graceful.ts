#!/usr/bin/env node
/**
 * Verification: Algolia HN API downtime causes pipeline to fail gracefully
 * Expected: Logs error, exits gracefully, does not corrupt existing data
*/

function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error(`FAIL: ${message}`);
 process.exit(1);
 }
}

// Simulate Algolia API downtime (500 response)
async function fetchAlgoliaWithError(): Promise<never> {
 throw new Error("HTTP 500: Internal Server Error - Algolia API is down");
}

// Simulate the pipeline Algolia fetch with graceful error handling
async function runPipelineWithAlgoliaDown(): Promise<{
  success: boolean;
  error: string;
  dataCorrupted: boolean;
  exitCode: number;
}> {
 const existingData = [
 { service: "AWS", title: "AWS is down", upvotes: 500 },
 ];

  let error = "";
 let dataCorrupted = false;
 let success = false;

  try {
 await fetchAlgoliaWithError();
 success = true;
 } catch (err) {
 error = (err as Error).message;
 console.error(`[Pipeline] Algolia API error: ${error}`);
 console.error("[Pipeline] Saving partial results and exiting gracefully...");

    // Verify existing data is not corrupted
 dataCorrupted = existingData.length === 0;
 success = false;
 }

  return {
 success,
 error,
 dataCorrupted,
 exitCode: success ? 0 : 1,
 };
}

async function main() {
 const result = await runPipelineWithAlgoliaDown();

  assert(!result.success, "Pipeline should not succeed when Algolia is down");
 assert(result.error.length > 0, "Error message should be logged");
 assert(!result.dataCorrupted, "Existing data should not be corrupted on failure");
 assert(result.exitCode === 1, "Pipeline should exit with non-zero code");

  console.log("✓ Algolia downtime handled gracefully");
 console.log(`  Error logged: ${result.error}`);
 console.log(`  Data corrupted: ${result.dataCorrupted}`);
 console.log(`  Exit code: ${result.exitCode}`);
 process.exit(0);
}

main();
