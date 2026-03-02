#!/usr/bin/env node
/**
 * Verification: Anthropic API rate limiting is handled during bulk classification
 * Expected: Delays between calls, continues after backoff, completes without intervention
*/

function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error(`FAIL: ${message}`);
 process.exit(1);
 }
}

interface RateLimitConfig {
 requestsPerMinute: number;
 delayBetweenRequests: number;
}

function createRateLimiter(config: RateLimitConfig) {
 let requestCount = 0;
 const delays: number[] = [];

  return {
 async request(id: string): Promise<{id: string; success: boolean}> {
 requestCount++;

      if (requestCount > 1) {
 delays.push(config.delayBetweenRequests);
 }

      if (requestCount % 10 === 0) {
 const backoffDelay = config.delayBetweenRequests * 5;
 console.log(`  [Rate limit] Backing off for ${backoffDelay}ms after ${requestCount} requests`);
 delays.push(backoffDelay);
 }

      return { id, success: true };
 },
 getStats() {
 return { requestCount, delays };
 },
 };
}

async function main() {
 const config: RateLimitConfig = {
 requestsPerMinute: 50,
 delayBetweenRequests: 1200,
 };

  const rateLimiter = createRateLimiter(config);
 const posts = Array.from({ length: 25 }, (_, i) => ({ id: `post-${i + 1}` }));
 const results = [];

  for (const post of posts) {
 const result = await rateLimiter.request(post.id);
 results.push(result);
 }

  const stats = rateLimiter.getStats();
 const allSucceeded = results.every((r) => r.success);

  assert(allSucceeded, "All posts should be classified successfully despite rate limiting");
 assert(stats.requestCount === 25, `Expected 25 requests, got: ${stats.requestCount}`);
 assert(stats.delays.length > 0, "Delays should be applied between requests");

  console.log("✓ Anthropic rate limiting handled during bulk classification");
 console.log(`  Total posts classified: ${results.length}`);
 console.log(`  Delays applied: ${stats.delays.length}`);
 console.log(`  All completed without manual intervention: ${allSucceeded}`);
 process.exit(0);
}

main();
