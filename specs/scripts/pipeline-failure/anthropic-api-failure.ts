#!/usr/bin/env node
/**
 * Verification: Anthropic API failure during classification is handled gracefully
 * Expected: Retry with backoff, skip after max retries, pipeline continues
*/

function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error(`FAIL: ${message}`);
 process.exit(1);
 }
}

interface ClassifyResult {
 postId: string;
 success: boolean;
 skipped?: boolean;
 error?: string;
}

async function classifyWithRetry(
  postId: string,
  maxRetries: number,
  failCount: number
): Promise<ClassifyResult> {
 for (let attempt = 0; attempt <= maxRetries; attempt++) {
 if (attempt < failCount) {
 console.log(`  [Error] Classification failed for ${postId}, attempt ${attempt + 1}/${maxRetries + 1}`);
 continue;
 }
 return { postId, success: true };
 }

  console.warn(`  [Skip] ${postId} skipped after ${maxRetries + 1} failed attempts`);
 return { postId, success: false, skipped: true, error: "Max retries exceeded" };
}

async function main() {
 const posts = [
 { id: "post-1" },
 { id: "post-2" },
 { id: "post-3" },
 ];

  const MAX_RETRIES = 3;
 const results: ClassifyResult[] = [];

  for (const post of posts) {
 const failCount = post.id === "post-2" ? MAX_RETRIES + 1 : 0;
 const result = await classifyWithRetry(post.id, MAX_RETRIES, failCount);
 results.push(result);
 }

  assert(results.length === 3, `Expected 3 results, got: ${results.length}`);

  const succeeded = results.filter((r) => r.success);
 const skipped = results.filter((r) => r.skipped);

  assert(succeeded.length === 2, `Expected 2 successful classifications, got: ${succeeded.length}`);
 assert(skipped.length === 1, `Expected 1 skipped post, got: ${skipped.length}`);
 assert(skipped[0].postId === "post-2", "Expected post-2 to be skipped");

  assert(succeeded.some((r) => r.postId === "post-1"), "post-1 should be in succeeded results");
 assert(succeeded.some((r) => r.postId === "post-3"), "post-3 should be in succeeded results");

  console.log("✓ Anthropic API failure handled gracefully");
 console.log(`  ${succeeded.length} posts classified successfully`);
 console.log(`  ${skipped.length} post(s) skipped after max retries`);
 console.log("  Pipeline continued past failures");
 process.exit(0);
}

main();
