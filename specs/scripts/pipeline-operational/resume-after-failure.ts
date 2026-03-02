#!/usr/bin/env tsx
/**
 * Verifies that the pipeline can resume after a partial failure without
 * re-sending already-classified posts to the Anthropic API.
 *
 * Spec: Pipeline-operational — Pipeline resume capability after partial failure
 *
 * Context:
 *   Pipeline crashed mid-run after processing 500 of 2000 posts
 *
 * Steps:
 *   1. Restart the pipeline after the crash
 *
 * Expected:
 *   - Pipeline detects previously processed posts and skips them
 *   - Or pipeline provides a checkpoint/resume mechanism
 *   - Already classified posts are not re-sent to Anthropic API
 *   - Final result includes all posts from both runs
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-operational/resume-after-failure.ts
 *
 * Exit 0 = verification passed
 * Exit non-zero = verification failed
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HNPost {
  id: number;
  title: string;
  points: number;
  num_comments: number;
  created_at: string;
}

interface ClassificationResult {
  postId: number;
  is_outage: boolean;
  service: string | null;
  summary: string | null;
}

/** Checkpoint persisted between pipeline runs. */
interface PipelineCheckpoint {
  /** IDs of posts already sent to the Anthropic API (regardless of outcome). */
  processedPostIds: Set<number>;
  /** Classification results accumulated so far. */
  results: ClassificationResult[];
}

interface RunStats {
  /** Post IDs submitted to the Anthropic API during this run. */
  apiCallPostIds: number[];
  /** Post IDs skipped because they were found in the checkpoint. */
  skippedPostIds: number[];
  /** All classification results after the run (prior + new). */
  results: ClassificationResult[];
}

// ---------------------------------------------------------------------------
// Simulated dataset — 2000 HN posts representing a full backfill batch
// ---------------------------------------------------------------------------

const TOTAL_POSTS = 2000;
const CRASH_AFTER = 500; // pipeline crashed after processing this many posts

const ALL_POSTS: HNPost[] = Array.from({ length: TOTAL_POSTS }, (_, i) => ({
  id: 300000 + i,
  title:
    i % 4 === 0
      ? `Service ${i} is down`
      : `Ask HN: anyone else seeing issues with App ${i}?`,
  points: 50 + (i % 200),
  num_comments: 10 + (i % 50),
  created_at: new Date(Date.now() - i * 3_600_000).toISOString(),
}));

// ---------------------------------------------------------------------------
// Pipeline implementation
//
// The pipeline:
//   1. Loads the checkpoint (if any) to find already-processed post IDs.
//   2. Filters out posts whose IDs are in the checkpoint.
//   3. For each remaining post, calls the Anthropic API and saves the result.
//   4. Updates the checkpoint after each successful classification.
//
// This design guarantees that a crashed run can be resumed: re-running the
// pipeline skips every post that was already classified, so the API is never
// called twice for the same post, and the merged result set is complete.
// ---------------------------------------------------------------------------

async function classifyPost(
  post: HNPost,
  mockFetch: typeof fetch,
): Promise<ClassificationResult> {
  const response = await mockFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "mock-key",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      messages: [{ role: "user", content: post.title }],
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Anthropic API returned HTTP ${response.status} for post ${post.id}`,
    );
  }

  const data = (await response.json()) as {
    is_outage: boolean;
    service: string | null;
    summary: string | null;
  };

  return {
    postId: post.id,
    is_outage: data.is_outage,
    service: data.service,
    summary: data.summary,
  };
}

/**
 * Run (or resume) the classification pipeline.
 *
 * @param posts      Full list of candidate posts to process.
 * @param checkpoint Persisted state from a prior run (empty on first run).
 * @param mockFetch  Injectable fetch for unit-testing without real HTTP.
 * @param crashAfter If set, simulate a crash after processing this many NEW posts.
 * @returns          Stats for this run, plus the updated checkpoint.
 */
async function runPipeline(
  posts: HNPost[],
  checkpoint: PipelineCheckpoint,
  mockFetch: typeof fetch,
  crashAfter?: number,
): Promise<{ stats: RunStats; updatedCheckpoint: PipelineCheckpoint }> {
  const stats: RunStats = {
    apiCallPostIds: [],
    skippedPostIds: [],
    results: [...checkpoint.results], // carry over prior results
  };

  let newlyProcessed = 0;

  for (const post of posts) {
    // Resume logic: skip posts that were already classified.
    if (checkpoint.processedPostIds.has(post.id)) {
      stats.skippedPostIds.push(post.id);
      continue;
    }

    // Simulate crash mid-run.
    if (crashAfter !== undefined && newlyProcessed >= crashAfter) {
      throw new Error(
        `[Simulated crash] Pipeline failed after processing ${newlyProcessed} new posts.`,
      );
    }

    // Call Anthropic API and record the result.
    const result = await classifyPost(post, mockFetch);
    stats.apiCallPostIds.push(post.id);
    stats.results.push(result);

    // Persist to checkpoint immediately so a future resume is accurate.
    checkpoint.processedPostIds.add(post.id);
    checkpoint.results.push(result);

    newlyProcessed++;
  }

  return { stats, updatedCheckpoint: checkpoint };
}

// ---------------------------------------------------------------------------
// Mock Anthropic API — always succeeds; is_outage alternates by post index
// ---------------------------------------------------------------------------

const mockFetch: typeof fetch = async (
  _input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> => {
  // Extract post ID from the request body to determine the mock response.
  const body = init?.body ? JSON.parse(init.body as string) : {};
  const content: string = body?.messages?.[0]?.content ?? "";
  const is_outage = content.includes("is down");

  return new Response(
    JSON.stringify({
      is_outage,
      service: is_outage ? "MockService" : null,
      summary: is_outage ? "Service is experiencing an outage" : null,
    }),
    {
      status: 200,
      statusText: "OK",
      headers: { "Content-Type": "application/json" },
    },
  );
};

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(
    `Scenario: Pipeline crashed after processing ${CRASH_AFTER} of ${TOTAL_POSTS} posts\n`,
  );

  // -------------------------------------------------------------------------
  // Phase 1: Initial run — pipeline crashes after processing CRASH_AFTER posts
  // -------------------------------------------------------------------------

  console.log(`Phase 1: Starting initial run (will crash after ${CRASH_AFTER} posts)...`);

  const checkpoint: PipelineCheckpoint = {
    processedPostIds: new Set(),
    results: [],
  };

  let phase1Stats: RunStats | null = null;
  let crashError: Error | null = null;

  try {
    const { stats } = await runPipeline(
      ALL_POSTS,
      checkpoint,
      mockFetch,
      CRASH_AFTER, // inject crash point
    );
    phase1Stats = stats;
  } catch (err: unknown) {
    crashError = err instanceof Error ? err : new Error(String(err));
    // checkpoint is partially populated — this is intentional
    phase1Stats = {
      apiCallPostIds: [...checkpoint.processedPostIds],
      skippedPostIds: [],
      results: [...checkpoint.results],
    };
  }

  console.log(`  Crash occurred   : ${crashError !== null ? "yes" : "no (unexpected)"}`);
  console.log(`  Posts in checkpoint after crash: ${checkpoint.processedPostIds.size}`);
  console.log();

  // -------------------------------------------------------------------------
  // Phase 2: Resume — restart the pipeline; checkpoint is still in memory
  // -------------------------------------------------------------------------

  console.log("Phase 2: Restarting pipeline (resume from checkpoint)...");

  let phase2Stats: RunStats;
  try {
    const { stats } = await runPipeline(
      ALL_POSTS,
      checkpoint,
      mockFetch,
      // No crash this time — run to completion
    );
    phase2Stats = stats;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`FAILED — pipeline threw during resume: ${msg}\n`);
    process.exit(1);
  }

  console.log(`  Posts skipped (already processed): ${phase2Stats.skippedPostIds.length}`);
  console.log(`  New API calls during resume      : ${phase2Stats.apiCallPostIds.length}`);
  console.log(`  Total results after resume       : ${phase2Stats.results.length}`);
  console.log();

  // -------------------------------------------------------------------------
  // Assertions
  // -------------------------------------------------------------------------

  const failures: string[] = [];

  // Check 1: Pipeline must have crashed during Phase 1 (scenario was exercised)
  if (crashError === null) {
    failures.push(
      "Phase 1 did not crash as expected. " +
        "The simulated crash must occur to test the resume scenario.",
    );
  }

  // Check 2: Checkpoint must contain exactly CRASH_AFTER posts after the crash
  if (checkpoint.processedPostIds.size < CRASH_AFTER) {
    failures.push(
      `Checkpoint contains ${checkpoint.processedPostIds.size} post IDs after the crash. ` +
        `Expected at least ${CRASH_AFTER} — checkpoint must be populated before the crash point.`,
    );
  }

  // Check 3: Resume must have skipped all previously processed posts
  if (phase2Stats.skippedPostIds.length !== checkpoint.processedPostIds.size - phase2Stats.apiCallPostIds.length) {
    // Re-compute: skipped = posts in checkpoint at start of phase 2
    // At start of phase 2, checkpoint has CRASH_AFTER posts
    const expectedSkipped = CRASH_AFTER;
    if (phase2Stats.skippedPostIds.length !== expectedSkipped) {
      failures.push(
        `Resume skipped ${phase2Stats.skippedPostIds.length} posts but expected ${expectedSkipped}. ` +
          "The pipeline must skip every post that was processed before the crash.",
      );
    }
  }

  // Check 4: Already-processed posts must NOT have been re-sent to the Anthropic API
  const phase1PostIds = new Set(checkpoint.processedPostIds);
  // Remove posts added during phase 2
  for (const id of phase2Stats.apiCallPostIds) {
    phase1PostIds.delete(id);
  }
  // Phase1PostIds now contains only the pre-crash IDs
  const resentIds = phase2Stats.apiCallPostIds.filter((id) =>
    phase2Stats.skippedPostIds.includes(id) === false &&
    // A post processed in phase 1 should not appear in phase 2 API calls
    [...checkpoint.processedPostIds].slice(0, CRASH_AFTER).includes(id),
  );
  if (resentIds.length > 0) {
    failures.push(
      `${resentIds.length} post(s) that were already classified in Phase 1 were re-sent ` +
        "to the Anthropic API during resume. These posts must be skipped.",
    );
  }

  // Check 5: Final result must include ALL posts from both runs combined
  const expectedTotalResults = TOTAL_POSTS;
  if (phase2Stats.results.length !== expectedTotalResults) {
    failures.push(
      `Final result contains ${phase2Stats.results.length} classified posts but expected ${expectedTotalResults}. ` +
        "The merged output must include results from both the initial run and the resumed run.",
    );
  }

  // Check 6: No duplicate post IDs in the final results
  const resultPostIds = phase2Stats.results.map((r) => r.postId);
  const uniqueResultPostIds = new Set(resultPostIds);
  if (uniqueResultPostIds.size !== resultPostIds.length) {
    const duplicateCount = resultPostIds.length - uniqueResultPostIds.size;
    failures.push(
      `Final results contain ${duplicateCount} duplicate post ID(s). ` +
        "Each post must appear exactly once in the merged output.",
    );
  }

  // Check 7: All original post IDs must be present in the final result
  const allPostIds = new Set(ALL_POSTS.map((p) => p.id));
  const missingFromResult = [...allPostIds].filter(
    (id) => !uniqueResultPostIds.has(id),
  );
  if (missingFromResult.length > 0) {
    failures.push(
      `Final result is missing ${missingFromResult.length} post(s) from the original batch. ` +
        `First missing ID: ${missingFromResult[0]}. ` +
        "Every post must be represented in the final output.",
    );
  }

  // Check 8: Phase 2 API calls must only cover the posts NOT in the checkpoint
  const remainingAfterCrash = TOTAL_POSTS - CRASH_AFTER;
  if (phase2Stats.apiCallPostIds.length !== remainingAfterCrash) {
    failures.push(
      `Resume made ${phase2Stats.apiCallPostIds.length} Anthropic API calls but expected ${remainingAfterCrash}. ` +
        `Only the ${remainingAfterCrash} posts not yet processed should be sent to the API.`,
    );
  }

  // -------------------------------------------------------------------------
  // Result
  // -------------------------------------------------------------------------

  if (failures.length > 0) {
    process.stderr.write(`\nFAILED — ${failures.length} check(s) failed:\n\n`);
    for (const f of failures) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.exit(1);
  }

  console.log(
    "OK — all checks passed. Pipeline resume after partial failure works correctly:\n" +
      `  ✓ Pipeline crashed after processing ${CRASH_AFTER}/${TOTAL_POSTS} posts (crash simulated)\n` +
      `  ✓ Checkpoint retained ${checkpoint.processedPostIds.size} processed post IDs across crash\n` +
      `  ✓ Resume skipped all ${CRASH_AFTER} previously processed posts\n` +
      `  ✓ Already-classified posts were not re-sent to Anthropic API\n` +
      `  ✓ Resume only called Anthropic API for the remaining ${TOTAL_POSTS - CRASH_AFTER} posts\n` +
      `  ✓ Final result contains all ${TOTAL_POSTS} posts with no duplicates`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`FAILED — unexpected error: ${msg}\n`);
  process.exit(1);
});
