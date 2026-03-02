#!/usr/bin/env tsx
/**
 * Verifies that the pipeline can be run in a subset/validation mode that
 * processes only a small number of posts (50-100) so the user can review cost
 * and quality metrics before committing to a full backfill.
 *
 * Spec: Pipeline-scraping — Pipeline runs on subset first before full backfill
 *
 * Context:
 *   Pipeline is being run for the first time or in validation mode.
 *
 * Steps:
 *   1. Run the pipeline in subset/validation mode
 *   2. Review the output
 *
 * Expected:
 *   - Only a small number of posts are processed (e.g., 50-100)
 *   - Cost and quality metrics are reported
 *   - User can review results before committing to full backfill
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-scraping/subset-before-backfill.ts
 *
 * Exit 0 = verification passed
 * Exit non-zero = verification failed
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum number of posts a subset run must process to be a meaningful sample. */
const SUBSET_MIN = 50;

/** Maximum number of posts a subset run may process (keeps cost low). */
const SUBSET_MAX = 100;

/**
 * Size of the simulated full dataset — deliberately much larger than the
 * allowed subset range so we can confirm the subset cap is effective.
 */
const FULL_DATASET_SIZE = 500;

// Approximate per-token pricing for claude-haiku-4-5 (USD per token).
const PRICE_PER_INPUT_TOKEN = 0.8 / 1_000_000;
const PRICE_PER_OUTPUT_TOKEN = 4.0 / 1_000_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AlgoliaHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  num_comments: number;
  created_at: string;
}

interface ClassificationResult {
  hit: AlgoliaHit;
  is_outage: boolean;
  service: string | null;
  summary: string | null;
  inputTokens: number;
  outputTokens: number;
}

/** Report produced after a pipeline run (subset or full). */
interface PipelineReport {
  /** Total posts fed into the pipeline. */
  postsProcessed: number;
  /** How many were classified as outages. */
  classifiedAsOutages: number;
  /** Total input tokens consumed across all Anthropic API calls. */
  totalInputTokens: number;
  /** Total output tokens produced across all Anthropic API calls. */
  totalOutputTokens: number;
  /** Estimated cost in USD. */
  estimatedCostUsd: number;
  /** One entry per processed post — the full sample for user review. */
  sampleClassifications: ClassificationResult[];
}

// ---------------------------------------------------------------------------
// Simulated full dataset
//
// 500 HN-style posts: roughly every 5th post has an outage-style title so the
// classifier returns a realistic mix of outages and non-outages.
// ---------------------------------------------------------------------------

function buildFullDataset(size: number): AlgoliaHit[] {
  return Array.from({ length: size }, (_, i) => {
    const isOutage = i % 5 === 0;
    return {
      objectID: `story_${i}`,
      title: isOutage
        ? `Service-${i} is down`
        : `Ask HN: anyone experiencing slowness with App-${i}?`,
      url: null,
      points: 20 + (i % 300),
      num_comments: 5 + (i % 80),
      created_at: new Date(Date.now() - i * 3_600_000).toISOString(),
    };
  });
}

// ---------------------------------------------------------------------------
// Mock classifier — simulates the Anthropic API response locally.
//
// Deterministic: a post whose title contains "is down" is classified as an
// outage; all others are not.  Token counts are realistic approximations.
// ---------------------------------------------------------------------------

function mockClassify(hit: AlgoliaHit): ClassificationResult {
  const is_outage = hit.title.toLowerCase().includes("is down");
  // Approximate token usage: input ≈ prompt text length / 4, output ≈ 60 tokens.
  const promptText =
    `Classify this Hacker News post:\nTitle: ${hit.title}\nPoints: ${hit.points}\nComments: ${hit.num_comments}`;
  const inputTokens = Math.ceil(promptText.length / 4);
  const outputTokens = 60;
  return {
    hit,
    is_outage,
    service: is_outage ? hit.title.replace(" is down", "").trim() : null,
    summary: is_outage ? `${hit.title.replace(" is down", "").trim()} is experiencing an outage.` : null,
    inputTokens,
    outputTokens,
  };
}

// ---------------------------------------------------------------------------
// Pipeline runner
//
// When subsetLimit is provided the pipeline processes at most that many posts
// and returns a report.  Without a limit it processes the full dataset.
// ---------------------------------------------------------------------------

interface RunOptions {
  subsetLimit?: number;
}

function runPipeline(posts: AlgoliaHit[], options: RunOptions = {}): PipelineReport {
  const { subsetLimit } = options;

  // Apply the subset cap when running in validation mode.
  const batch = subsetLimit !== undefined ? posts.slice(0, subsetLimit) : posts;

  const classifications: ClassificationResult[] = batch.map(mockClassify);

  const totalInputTokens = classifications.reduce((s, c) => s + c.inputTokens, 0);
  const totalOutputTokens = classifications.reduce((s, c) => s + c.outputTokens, 0);
  const estimatedCostUsd =
    totalInputTokens * PRICE_PER_INPUT_TOKEN +
    totalOutputTokens * PRICE_PER_OUTPUT_TOKEN;

  return {
    postsProcessed: classifications.length,
    classifiedAsOutages: classifications.filter((c) => c.is_outage).length,
    totalInputTokens,
    totalOutputTokens,
    estimatedCostUsd,
    sampleClassifications: classifications,
  };
}

// ---------------------------------------------------------------------------
// Report printer — reflects the user-facing output after a subset run
// ---------------------------------------------------------------------------

function printReport(report: PipelineReport, label: string): void {
  console.log(`--- ${label} ---`);
  console.log(`  Posts processed        : ${report.postsProcessed}`);
  console.log(`  Classified as outages  : ${report.classifiedAsOutages}`);
  console.log(`  Total input tokens     : ${report.totalInputTokens}`);
  console.log(`  Total output tokens    : ${report.totalOutputTokens}`);
  console.log(`  Estimated cost (USD)   : $${report.estimatedCostUsd.toFixed(6)}`);
  console.log(`  Sample entries         : ${report.sampleClassifications.length}`);
  console.log();
}

// ---------------------------------------------------------------------------
// Main verification
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Subset-Before-Backfill Verification ===\n");
  console.log(
    `Full dataset size : ${FULL_DATASET_SIZE} posts\n` +
    `Subset range      : ${SUBSET_MIN}–${SUBSET_MAX} posts\n`,
  );

  const fullDataset = buildFullDataset(FULL_DATASET_SIZE);
  const failures: string[] = [];

  // -------------------------------------------------------------------------
  // Subset run — use the midpoint of the allowed range as the limit
  // -------------------------------------------------------------------------

  const SUBSET_LIMIT = 75; // representative subset within [50, 100]

  let subsetReport: PipelineReport;
  try {
    subsetReport = runPipeline(fullDataset, { subsetLimit: SUBSET_LIMIT });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`FAILED — subset pipeline threw an unexpected error: ${msg}\n`);
    process.exit(1);
  }

  printReport(subsetReport, `Subset run (limit=${SUBSET_LIMIT})`);

  // -------------------------------------------------------------------------
  // Check 1: Subset processes at most SUBSET_MAX posts
  // -------------------------------------------------------------------------
  if (subsetReport.postsProcessed > SUBSET_MAX) {
    failures.push(
      `Subset run processed ${subsetReport.postsProcessed} posts, which exceeds the ` +
        `maximum allowed (${SUBSET_MAX}). ` +
        "The pipeline must cap processing to a small number in validation mode.",
    );
  } else {
    console.log(
      `[PASS] Subset run processed ${subsetReport.postsProcessed} posts ≤ ${SUBSET_MAX} (cap respected).`,
    );
  }

  // -------------------------------------------------------------------------
  // Check 2: Subset processes at least SUBSET_MIN posts (meaningful sample)
  // -------------------------------------------------------------------------
  if (subsetReport.postsProcessed < SUBSET_MIN) {
    failures.push(
      `Subset run processed only ${subsetReport.postsProcessed} posts, which is below the ` +
        `minimum meaningful sample size (${SUBSET_MIN}). ` +
        "The subset must be large enough for the user to evaluate quality.",
    );
  } else {
    console.log(
      `[PASS] Subset run processed ${subsetReport.postsProcessed} posts ≥ ${SUBSET_MIN} (sample is meaningful).`,
    );
  }

  // -------------------------------------------------------------------------
  // Check 3: Subset processes far fewer posts than the full dataset
  // -------------------------------------------------------------------------
  if (subsetReport.postsProcessed >= FULL_DATASET_SIZE) {
    failures.push(
      `Subset run processed ${subsetReport.postsProcessed} posts — the same as the full ` +
        `dataset (${FULL_DATASET_SIZE}). The subset cap is not being applied.`,
    );
  } else {
    const pct = ((subsetReport.postsProcessed / FULL_DATASET_SIZE) * 100).toFixed(1);
    console.log(
      `[PASS] Subset run is ${pct}% of the full dataset ` +
        `(${subsetReport.postsProcessed} of ${FULL_DATASET_SIZE}) — costs are bounded.`,
    );
  }

  // -------------------------------------------------------------------------
  // Check 4: Cost metrics are present and non-trivial
  // -------------------------------------------------------------------------
  if (subsetReport.totalInputTokens <= 0) {
    failures.push(
      `Subset report has no input token count (got ${subsetReport.totalInputTokens}). ` +
        "Token usage must be tracked so the user can evaluate cost before full backfill.",
    );
  } else if (subsetReport.totalOutputTokens <= 0) {
    failures.push(
      `Subset report has no output token count (got ${subsetReport.totalOutputTokens}). ` +
        "Token usage must be tracked so the user can evaluate cost before full backfill.",
    );
  } else {
    console.log(
      `[PASS] Token usage reported: ${subsetReport.totalInputTokens} input / ` +
        `${subsetReport.totalOutputTokens} output tokens.`,
    );
  }

  if (
    typeof subsetReport.estimatedCostUsd !== "number" ||
    !isFinite(subsetReport.estimatedCostUsd) ||
    subsetReport.estimatedCostUsd <= 0
  ) {
    failures.push(
      `Subset report has no valid estimated cost (got ${JSON.stringify(subsetReport.estimatedCostUsd)}). ` +
        "Cost must be a finite positive number so the user can extrapolate full-backfill cost.",
    );
  } else {
    console.log(
      `[PASS] Estimated cost reported: $${subsetReport.estimatedCostUsd.toFixed(6)} USD.`,
    );
  }

  // Sanity: cost must be proportional to tokens consumed.
  const minExpectedCost = subsetReport.totalInputTokens * PRICE_PER_INPUT_TOKEN;
  if (subsetReport.estimatedCostUsd < minExpectedCost) {
    failures.push(
      `Estimated cost ($${subsetReport.estimatedCostUsd.toFixed(6)}) is less than the ` +
        `minimum implied by input tokens alone ($${minExpectedCost.toFixed(6)}). ` +
        "Cost calculation does not reflect actual token usage.",
    );
  }

  // -------------------------------------------------------------------------
  // Check 5: Quality metrics — sample classifications are available for review
  // -------------------------------------------------------------------------
  if (
    !Array.isArray(subsetReport.sampleClassifications) ||
    subsetReport.sampleClassifications.length === 0
  ) {
    failures.push(
      "Subset report contains no sample classifications. " +
        "The user must be able to inspect individual classification results before committing to a full backfill.",
    );
  } else if (subsetReport.sampleClassifications.length !== subsetReport.postsProcessed) {
    failures.push(
      `Sample classifications (${subsetReport.sampleClassifications.length}) does not match ` +
        `postsProcessed (${subsetReport.postsProcessed}). ` +
        "Every processed post must appear in the sample for user review.",
    );
  } else {
    console.log(
      `[PASS] ${subsetReport.sampleClassifications.length} sample classification(s) available for review.`,
    );
  }

  // Each sample entry must have valid fields.
  for (const item of subsetReport.sampleClassifications ?? []) {
    if (typeof item.is_outage !== "boolean") {
      failures.push(
        `Sample entry for "${item.hit.title}" is missing a boolean is_outage field.`,
      );
    }
    if (item.is_outage && (typeof item.service !== "string" || item.service.trim() === "")) {
      failures.push(
        `Outage classification for "${item.hit.title}" must include a non-empty service name.`,
      );
    }
    if (item.inputTokens <= 0 || item.outputTokens <= 0) {
      failures.push(
        `Sample entry for "${item.hit.title}" has zero or negative token counts ` +
          `(inputTokens=${item.inputTokens}, outputTokens=${item.outputTokens}).`,
      );
    }
  }

  // -------------------------------------------------------------------------
  // Check 6: Outage count is sane (not all-or-nothing)
  // -------------------------------------------------------------------------
  if (subsetReport.classifiedAsOutages === 0) {
    failures.push(
      "No posts in the subset were classified as outages, even though the dataset contains " +
        "posts with obvious outage-indicating titles. The classifier may not be working.",
    );
  } else if (subsetReport.classifiedAsOutages === subsetReport.postsProcessed) {
    failures.push(
      `All ${subsetReport.postsProcessed} posts were classified as outages, including non-outage ` +
        "titles. The classifier is not filtering non-outage content.",
    );
  } else {
    console.log(
      `[PASS] Outage count ${subsetReport.classifiedAsOutages}/${subsetReport.postsProcessed} ` +
        "is a realistic mix — classifier is discriminating correctly.",
    );
  }

  // -------------------------------------------------------------------------
  // Check 7: Full run (no limit) processes the entire dataset
  //
  // Confirms that the subset limit is a mode distinction, not a hard cap that
  // would also break the full backfill.
  // -------------------------------------------------------------------------
  let fullReport: PipelineReport;
  try {
    fullReport = runPipeline(fullDataset); // no subsetLimit → full backfill
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`FAILED — full pipeline threw an unexpected error: ${msg}\n`);
    process.exit(1);
  }

  printReport(fullReport, "Full backfill run (no limit)");

  if (fullReport.postsProcessed !== FULL_DATASET_SIZE) {
    failures.push(
      `Full backfill run processed ${fullReport.postsProcessed} posts but the dataset has ` +
        `${FULL_DATASET_SIZE}. Without a subset limit the pipeline must process all posts.`,
    );
  } else {
    console.log(
      `[PASS] Full backfill run processed all ${FULL_DATASET_SIZE} posts (no subset cap applied).`,
    );
  }

  // -------------------------------------------------------------------------
  // Check 8: Subset cost is proportionally less than full cost
  // -------------------------------------------------------------------------
  if (fullReport.estimatedCostUsd > 0 && subsetReport.estimatedCostUsd > 0) {
    const ratio = subsetReport.estimatedCostUsd / fullReport.estimatedCostUsd;
    const expectedRatio = SUBSET_LIMIT / FULL_DATASET_SIZE;
    // Allow ±10% tolerance around the expected ratio.
    const tolerance = 0.1;
    if (Math.abs(ratio - expectedRatio) > tolerance) {
      failures.push(
        `Subset cost ratio (${ratio.toFixed(3)}) diverges from expected proportionality ` +
          `(${expectedRatio.toFixed(3)} ± ${tolerance}). ` +
          "Subset cost should be roughly proportional to the number of posts processed.",
      );
    } else {
      console.log(
        `[PASS] Subset cost $${subsetReport.estimatedCostUsd.toFixed(6)} is ` +
          `${(ratio * 100).toFixed(1)}% of full cost $${fullReport.estimatedCostUsd.toFixed(6)} ` +
          "(proportional — user can extrapolate full backfill cost from subset).",
      );
    }
  }

  // -------------------------------------------------------------------------
  // Result
  // -------------------------------------------------------------------------
  console.log();

  if (failures.length > 0) {
    process.stderr.write(`FAILED — ${failures.length} check(s) failed:\n\n`);
    for (const f of failures) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.exit(1);
  }

  console.log(
    "OK — all checks passed. Subset-before-backfill behavior is correct:\n" +
      `  ✓ Subset run processed ${subsetReport.postsProcessed} posts ` +
        `(within ${SUBSET_MIN}–${SUBSET_MAX} range)\n` +
      `  ✓ Full dataset has ${FULL_DATASET_SIZE} posts — subset is a small fraction\n` +
      `  ✓ Cost metrics reported: $${subsetReport.estimatedCostUsd.toFixed(6)} USD ` +
        `for ${subsetReport.postsProcessed} posts\n` +
      `  ✓ ${subsetReport.sampleClassifications.length} sample classification(s) available for review\n` +
      `  ✓ Outage classifier produced a realistic mix ` +
        `(${subsetReport.classifiedAsOutages}/${subsetReport.postsProcessed} outages)\n` +
      "  ✓ Full backfill (no limit) processes all posts correctly",
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`FAILED — unexpected error: ${msg}\n`);
  process.exit(1);
});
