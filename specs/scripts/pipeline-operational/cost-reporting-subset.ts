#!/usr/bin/env tsx
/**
 * Verifies that the pipeline correctly reports cost and quality metrics after
 * a subset validation run.
 *
 * Spec: Pipeline-operational — Pipeline cost reporting after subset run
 *
 * Context:
 *   Pipeline has completed a subset validation run
 *
 * Steps:
 *   1. Review the pipeline output/logs after subset run
 *
 * Expected:
 *   - Total number of API calls made to Anthropic is reported
 *   - Estimated cost is displayed
 *   - Number of posts processed vs classified as outages is shown
 *   - Quality metrics (e.g., sample of classifications) are available for review
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-operational/cost-reporting-subset.ts
 *
 * Requires:
 *   ANTHROPIC_API_KEY environment variable
 *
 * Exit 0 = verification passed
 * Exit 1 = verification failed
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HNPost {
  id: number;
  title: string;
  url: string;
  points: number;
  comments: number;
}

interface ClassificationResult {
  is_outage: boolean;
  service: string | null;
  summary: string | null;
}

interface ClassifiedPost {
  post: HNPost;
  classification: ClassificationResult;
  inputTokens: number;
  outputTokens: number;
}

/** Accumulated metrics produced by a pipeline subset run. */
interface PipelineRunReport {
  /** Total Anthropic API calls made (one per post). */
  apiCallCount: number;
  /** Total input tokens consumed across all calls. */
  totalInputTokens: number;
  /** Total output tokens produced across all calls. */
  totalOutputTokens: number;
  /** Estimated USD cost based on model pricing. */
  estimatedCostUsd: number;
  /** Number of posts fed into the pipeline. */
  postsProcessed: number;
  /** Number of posts the LLM classified as real outages. */
  classifiedAsOutages: number;
  /** Sample of individual classification results for manual review. */
  sampleClassifications: ClassifiedPost[];
}

// ---------------------------------------------------------------------------
// Subset of diverse HN posts (mix of real outages and non-outages)
// ---------------------------------------------------------------------------

const SUBSET_POSTS: HNPost[] = [
  {
    id: 35052503,
    title: "Twitter is down globally",
    url: "https://news.ycombinator.com/item?id=35052503",
    points: 2103,
    comments: 891,
  },
  {
    id: 31428855,
    title: "GitHub is down",
    url: "https://news.ycombinator.com/item?id=31428855",
    points: 1547,
    comments: 432,
  },
  {
    id: 38443250,
    title: "Ask HN: How do you structure a personal knowledge base?",
    url: "https://news.ycombinator.com/item?id=38443250",
    points: 312,
    comments: 178,
  },
  {
    id: 29417894,
    title: "The history of the AWS S3 outage of 2017",
    url: "https://news.ycombinator.com/item?id=29417894",
    points: 87,
    comments: 34,
  },
  {
    id: 36112791,
    title: "Cloudflare outage on June 20 2023",
    url: "https://news.ycombinator.com/item?id=36112791",
    points: 943,
    comments: 366,
  },
  {
    id: 34811545,
    title: "Show HN: I built a tool to monitor uptime for free",
    url: "https://news.ycombinator.com/item?id=34811545",
    points: 156,
    comments: 89,
  },
];

// ---------------------------------------------------------------------------
// Anthropic API
// ---------------------------------------------------------------------------

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  process.stderr.write(
    "FAILED — ANTHROPIC_API_KEY environment variable is not set.\n",
  );
  process.exit(1);
}

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Use Haiku for subset validation runs — cheaper model appropriate for a
// cost-estimation pass before committing to a full backfill with Opus.
const MODEL = "claude-haiku-4-5-20251001";

// Approximate per-token pricing (USD per token)
// claude-haiku-4-5: $0.80/M input, $4.00/M output
const PRICE_PER_INPUT_TOKEN = 0.80 / 1_000_000;
const PRICE_PER_OUTPUT_TOKEN = 4.00 / 1_000_000;

const classificationTool = {
  name: "classify_post",
  description:
    "Classify a Hacker News post to determine whether it reports an active service outage.",
  input_schema: {
    type: "object",
    properties: {
      is_outage: {
        type: "boolean",
        description:
          "True if the post reports an active, ongoing service outage. False for postmortems, retrospectives, Show HN posts, Ask HN posts, or non-outage content.",
      },
      service: {
        type: ["string", "null"],
        description:
          "The name of the affected service (e.g. 'AWS S3', 'GitHub', 'Cloudflare'). Null when is_outage is false.",
      },
      summary: {
        type: ["string", "null"],
        description:
          "A concise one-to-two sentence summary of the outage. Null when is_outage is false.",
      },
    },
    required: ["is_outage", "service", "summary"],
  },
};

async function classifyPost(post: HNPost): Promise<ClassifiedPost> {
  const systemPrompt =
    "You are an outage classification assistant. Given a Hacker News post title, " +
    "determine whether the post is reporting an active service outage happening right now. " +
    "Exclude postmortems (historical analysis), retrospectives, Ask HN, Show HN, and posts " +
    "that merely mention a service without reporting a current outage.";

  const userMessage =
    `Classify the following Hacker News post:\n\n` +
    `Title: ${post.title}\n` +
    `URL: ${post.url}\n` +
    `Upvotes: ${post.points}\n` +
    `Comments: ${post.comments}`;

  const body = {
    model: MODEL,
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    tools: [classificationTool],
    tool_choice: { type: "tool", name: "classify_post" },
  };

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error calling Anthropic API: ${msg}`);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "(unreadable body)");
    throw new Error(
      `Anthropic API returned HTTP ${response.status}: ${text}`,
    );
  }

  const data = (await response.json()) as {
    content: Array<{
      type: string;
      name?: string;
      input?: Record<string, unknown>;
    }>;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };

  const toolUseBlock = data.content.find(
    (b) => b.type === "tool_use" && b.name === "classify_post",
  );
  if (!toolUseBlock || !toolUseBlock.input) {
    throw new Error(
      `Model did not return a classify_post tool call. Content: ${JSON.stringify(data.content)}`,
    );
  }

  const input = toolUseBlock.input as ClassificationResult;

  return {
    post,
    classification: {
      is_outage: input.is_outage,
      service: input.service ?? null,
      summary: input.summary ?? null,
    },
    inputTokens: data.usage.input_tokens,
    outputTokens: data.usage.output_tokens,
  };
}

// ---------------------------------------------------------------------------
// Subset pipeline runner — collects metrics and produces a report
// ---------------------------------------------------------------------------

async function runSubsetPipeline(posts: HNPost[]): Promise<PipelineRunReport> {
  const classified: ClassifiedPost[] = [];

  for (const post of posts) {
    const result = await classifyPost(post);
    classified.push(result);
  }

  const totalInputTokens = classified.reduce((s, r) => s + r.inputTokens, 0);
  const totalOutputTokens = classified.reduce((s, r) => s + r.outputTokens, 0);
  const estimatedCostUsd =
    totalInputTokens * PRICE_PER_INPUT_TOKEN +
    totalOutputTokens * PRICE_PER_OUTPUT_TOKEN;

  const outages = classified.filter((r) => r.classification.is_outage);

  return {
    apiCallCount: classified.length,
    totalInputTokens,
    totalOutputTokens,
    estimatedCostUsd,
    postsProcessed: posts.length,
    classifiedAsOutages: outages.length,
    sampleClassifications: classified,
  };
}

// ---------------------------------------------------------------------------
// Reporting — formats and prints the pipeline run report
// ---------------------------------------------------------------------------

function printReport(report: PipelineRunReport): void {
  console.log("=== Pipeline Subset Run Report ===\n");

  console.log("API Usage:");
  console.log(`  Total Anthropic API calls : ${report.apiCallCount}`);
  console.log(`  Total input tokens        : ${report.totalInputTokens}`);
  console.log(`  Total output tokens       : ${report.totalOutputTokens}`);
  console.log(
    `  Estimated cost            : $${report.estimatedCostUsd.toFixed(6)} USD`,
  );

  console.log("\nClassification Summary:");
  console.log(`  Posts processed           : ${report.postsProcessed}`);
  console.log(`  Classified as outages     : ${report.classifiedAsOutages}`);
  console.log(
    `  Not classified as outages : ${report.postsProcessed - report.classifiedAsOutages}`,
  );

  console.log("\nQuality Metrics — Sample of Classifications:");
  for (const item of report.sampleClassifications) {
    const label = item.classification.is_outage ? "OUTAGE" : "non-outage";
    const service = item.classification.service ?? "—";
    console.log(`  [${label}] "${item.post.title}"`);
    console.log(
      `           service=${service}  tokens=${item.inputTokens}in/${item.outputTokens}out`,
    );
    if (item.classification.summary) {
      console.log(`           summary: ${item.classification.summary}`);
    }
  }

  console.log();
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`Running subset pipeline on ${SUBSET_POSTS.length} posts using ${MODEL}...\n`);

  let report: PipelineRunReport;
  try {
    report = await runSubsetPipeline(SUBSET_POSTS);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`FAILED — pipeline error: ${msg}\n`);
    process.exit(1);
  }

  printReport(report);

  const failures: string[] = [];

  // Check 1: Total number of API calls made to Anthropic is reported.
  // Must equal the number of posts processed (one call per post).
  if (typeof report.apiCallCount !== "number" || report.apiCallCount <= 0) {
    failures.push(
      `API call count must be a positive number but got ${JSON.stringify(report.apiCallCount)}`,
    );
  }
  if (report.apiCallCount !== SUBSET_POSTS.length) {
    failures.push(
      `Expected apiCallCount=${SUBSET_POSTS.length} (one per post) but got ${report.apiCallCount}`,
    );
  }

  // Check 2: Estimated cost is displayed.
  // Must be a finite, non-negative number and reflect actual token consumption.
  if (
    typeof report.estimatedCostUsd !== "number" ||
    !isFinite(report.estimatedCostUsd) ||
    report.estimatedCostUsd < 0
  ) {
    failures.push(
      `Estimated cost must be a finite non-negative number but got ${JSON.stringify(report.estimatedCostUsd)}`,
    );
  }
  if (report.totalInputTokens <= 0) {
    failures.push(
      `Total input tokens must be positive (cost calculation requires real token counts) ` +
        `but got ${report.totalInputTokens}`,
    );
  }
  if (report.totalOutputTokens <= 0) {
    failures.push(
      `Total output tokens must be positive but got ${report.totalOutputTokens}`,
    );
  }
  // Cost must be non-trivially computed — at least proportional to token usage.
  const minExpectedCost = report.totalInputTokens * PRICE_PER_INPUT_TOKEN;
  if (report.estimatedCostUsd < minExpectedCost) {
    failures.push(
      `Estimated cost $${report.estimatedCostUsd.toFixed(6)} is less than the minimum expected ` +
        `from input tokens alone ($${minExpectedCost.toFixed(6)}). ` +
        `Cost calculation does not reflect actual token usage.`,
    );
  }

  // Check 3: Number of posts processed vs classified as outages is shown.
  // Processed count must equal the subset size; outage count must be sane.
  if (report.postsProcessed !== SUBSET_POSTS.length) {
    failures.push(
      `Expected postsProcessed=${SUBSET_POSTS.length} but got ${report.postsProcessed}`,
    );
  }
  if (
    typeof report.classifiedAsOutages !== "number" ||
    report.classifiedAsOutages < 0 ||
    report.classifiedAsOutages > report.postsProcessed
  ) {
    failures.push(
      `classifiedAsOutages must be a number between 0 and postsProcessed (${report.postsProcessed}) ` +
        `but got ${JSON.stringify(report.classifiedAsOutages)}`,
    );
  }
  // The subset contains obvious outage posts and obvious non-outage posts —
  // a working classifier should find at least one of each.
  if (report.classifiedAsOutages === 0) {
    failures.push(
      `No posts were classified as outages in a subset containing known active outage titles. ` +
        `The classifier may not be working correctly.`,
    );
  }
  if (report.classifiedAsOutages === report.postsProcessed) {
    failures.push(
      `All ${report.postsProcessed} posts were classified as outages, including posts that are ` +
        `Ask HN, Show HN, and postmortem/retrospective titles. ` +
        `The classifier is not filtering non-outage content.`,
    );
  }

  // Check 4: Quality metrics (sample of classifications) are available for review.
  // Every post must appear in the sample with a valid classification structure.
  if (
    !Array.isArray(report.sampleClassifications) ||
    report.sampleClassifications.length === 0
  ) {
    failures.push(
      `sampleClassifications must be a non-empty array but got ` +
        `${JSON.stringify(report.sampleClassifications)}`,
    );
  } else {
    if (report.sampleClassifications.length !== SUBSET_POSTS.length) {
      failures.push(
        `sampleClassifications should contain one entry per post ` +
          `(expected ${SUBSET_POSTS.length}, got ${report.sampleClassifications.length})`,
      );
    }
    for (const item of report.sampleClassifications) {
      if (typeof item.classification.is_outage !== "boolean") {
        failures.push(
          `Classification for post "${item.post.title}" is missing is_outage boolean`,
        );
      }
      if (item.classification.is_outage) {
        if (
          typeof item.classification.service !== "string" ||
          item.classification.service.trim().length === 0
        ) {
          failures.push(
            `Outage classification for "${item.post.title}" must have a non-empty service name`,
          );
        }
        if (
          typeof item.classification.summary !== "string" ||
          item.classification.summary.trim().length === 0
        ) {
          failures.push(
            `Outage classification for "${item.post.title}" must have a non-empty summary`,
          );
        }
      }
      if (typeof item.inputTokens !== "number" || item.inputTokens <= 0) {
        failures.push(
          `Sample entry for "${item.post.title}" is missing positive inputTokens count`,
        );
      }
      if (typeof item.outputTokens !== "number" || item.outputTokens <= 0) {
        failures.push(
          `Sample entry for "${item.post.title}" is missing positive outputTokens count`,
        );
      }
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`FAILED — ${failures.length} check(s) failed:\n\n`);
    for (const f of failures) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.exit(1);
  }

  console.log(
    "OK — all checks passed. Pipeline correctly reports cost metrics after subset run:\n" +
      `  - API call count reported  : ${report.apiCallCount}\n` +
      `  - Estimated cost reported  : $${report.estimatedCostUsd.toFixed(6)} USD\n` +
      `  - Posts processed          : ${report.postsProcessed}\n` +
      `  - Classified as outages    : ${report.classifiedAsOutages}\n` +
      `  - Sample classifications   : ${report.sampleClassifications.length} entries`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`FAILED — unexpected error: ${msg}\n`);
  process.exit(1);
});
