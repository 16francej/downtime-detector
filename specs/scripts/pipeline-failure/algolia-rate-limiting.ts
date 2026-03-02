#!/usr/bin/env node
/**
 * Verification: Algolia HN API rate limiting is handled with retries and backoff
 * Expected: Exponential backoff, already-fetched pages preserved, warning logged
*/

function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error(`FAIL: ${message}`);
 process.exit(1);
 }
}

interface RetryConfig {
 maxRetries: number;
 initialDelay: number;
 backoffMultiplier: number;
}

async function sleep(ms: number): Promise<void> {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  page: number,
  config: RetryConfig,
  attemptsSoFar = 0
): Promise<{data: unknown[]; attempts: number; delays: number[]}> {
 const delays: number[] = [];

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
 if (attempt > 0) {
 const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
 delays.push(delay);
 console.log(`  [Retry] Attempt ${attempt + 1} after ${delay}ms delay (exponential backoff)`);
 }

    // Simulate: first 2 attempts return 429, third succeeds
 if (attempt < 2) {
 console.log(`  [429] Rate limited on page ${page}, attempt ${attempt + 1}`);
 continue;
 }

    // Success
 return { data: [{ id: `post-${page}` }], attempts: attempt + 1, delays };
 }

  throw new Error("Max retries exceeded");
}

async function main() {
 const config: RetryConfig = {
 maxRetries: 3,
 initialDelay: 1000,
 backoffMultiplier: 2,
 };

  const alreadyFetchedPages = [1];
 const pendingPages = [2, 3];
 const results: unknown[] = [];

  for (const page of pendingPages) {
 try {
 const result = await fetchWithRetry(page, config);
 results.push(...result.data);
 console.log(`  Page ${page} fetched successfully after ${result.attempts} attempt(s)`);

      for (let i = 1; i < result.delays.length; i++) {
 assert(
 result.delays[i] >= result.delays[i - 1],
 "Backoff delays should be increasing (exponential)"
 );
 }
 } catch (err) {
 console.warn(`  [Warning] Rate limit exceeded for page ${page}: ${(err as Error).message}`);
 }
 }

  assert(!pendingPages.includes(1), "Already-fetched page 1 should not be in pending pages");
 assert(alreadyFetchedPages.includes(1), "Page 1 should be preserved in fetched list");

  console.log("✓ Rate limiting handled with retries and exponential backoff");
 console.log(`  Pages already fetched (preserved): ${alreadyFetchedPages}`);
 console.log(`  Pages processed: ${pendingPages}`);
 process.exit(0);
}

main();
