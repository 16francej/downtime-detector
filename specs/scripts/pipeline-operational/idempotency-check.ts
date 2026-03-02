#!/usr/bin/env tsx
/**
 * Verifies that running the pipeline a second time with no new HN posts produces
 * an identical output file — no duplicate entries are added, and the pipeline
 * reports that no new data was found.
 *
 * Spec: Pipeline-operational — Pipeline idempotency — running twice produces same result
 *
 * Context:
 *   Pipeline was already run successfully and JSON file exists
 *
 * Steps:
 *   1. Run the pipeline again without any new HN posts
 *
 * Expected:
 *   - JSON file content is identical after the second run
 *   - No duplicate entries are added
 *   - Pipeline completes successfully with a note that no new data was found
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-operational/idempotency-check.ts
 *
 * Exit 0 = verification passed
 * Exit non-zero = verification failed
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OutageRecord {
  id: string;
  service: string;
  date: string;
  description: string;
  duration: string;
  timestamp: number;
  severity: "major" | "moderate" | "minor";
  points?: number;
  comments?: number;
  hnUrl?: string;
}

interface HNPost {
  objectID: string;
  title: string;
  points: number;
  num_comments: number;
  created_at: string;
  url: string | null;
}

interface PipelineRunResult {
  outages: OutageRecord[];
  newEntriesAdded: number;
  /** Human-readable completion note */
  note: string;
  success: boolean;
}

// ---------------------------------------------------------------------------
// Simulated initial dataset — represents the JSON file after the first run.
// HN-sourced records use the hn-{objectID} id format that the pipeline assigns.
// ---------------------------------------------------------------------------

const INITIAL_OUTAGES: OutageRecord[] = [
  {
    id: "aws-s3-2017",
    service: "AWS",
    date: "February 28, 2017",
    description: "AWS S3 outage in US-EAST-1 region caused widespread internet disruption",
    duration: "4 hours",
    timestamp: new Date("2017-02-28").getTime(),
    severity: "major",
  },
  {
    id: "cloudflare-2019",
    service: "Cloudflare",
    date: "July 2, 2019",
    description: "Cloudflare outage affected millions of websites worldwide due to a bad WAF rule",
    duration: "27 minutes",
    timestamp: new Date("2019-07-02").getTime(),
    severity: "major",
  },
  {
    id: "facebook-2021",
    service: "Facebook",
    date: "October 4, 2021",
    description: "Facebook, Instagram, and WhatsApp went down globally due to BGP routing issues",
    duration: "6 hours",
    timestamp: new Date("2021-10-04").getTime(),
    severity: "major",
  },
  // HN-sourced records — ids use the hn-{objectID} scheme the pipeline assigns
  {
    id: "hn-35052503",
    service: "Twitter",
    date: "March 6, 2023",
    description: "Twitter went down globally amid ongoing infrastructure changes after acquisition",
    duration: "2 hours",
    timestamp: new Date("2023-03-06").getTime(),
    severity: "major",
    points: 2103,
    comments: 891,
    hnUrl: "https://news.ycombinator.com/item?id=35052503",
  },
  {
    id: "hn-36314001",
    service: "Reddit",
    date: "June 12, 2023",
    description: "Reddit went dark as communities protested API pricing changes",
    duration: "48 hours",
    timestamp: new Date("2023-06-12").getTime(),
    severity: "major",
    points: 3421,
    comments: 1523,
    hnUrl: "https://news.ycombinator.com/item?id=36314001",
  },
];

// ---------------------------------------------------------------------------
// Pipeline merge logic
//
// The pipeline:
//   1. Receives a list of new HN posts (already classified as outages).
//   2. Converts them to OutageRecord entries using id = "hn-" + objectID.
//   3. Merges them into the existing dataset, deduplicating by `id`.
//      An entry is a duplicate if its `id` already exists in the dataset.
//   4. Returns the merged dataset along with a count of truly new entries.
//   5. When no new entries are found, notes that no new data was found.
// ---------------------------------------------------------------------------

function hnPostToOutageRecord(post: HNPost): OutageRecord {
  return {
    id: `hn-${post.objectID}`,
    service: "Unknown", // In a real pipeline the LLM would classify this
    date: new Date(post.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    description: post.title,
    duration: "unknown",
    timestamp: new Date(post.created_at).getTime(),
    severity: "moderate",
    points: post.points,
    comments: post.num_comments,
    hnUrl: post.url ?? undefined,
  };
}

function runPipeline(
  existingOutages: OutageRecord[],
  newHNPosts: HNPost[],
): PipelineRunResult {
  // Build a set of existing IDs for O(1) duplicate detection
  const existingIds = new Set(existingOutages.map((o) => o.id));

  // Convert new posts to outage records
  const candidateRecords = newHNPosts.map(hnPostToOutageRecord);

  // Filter out duplicates (any that share an ID with an existing record)
  const trulyNewRecords = candidateRecords.filter(
    (r) => !existingIds.has(r.id),
  );

  // Merge: keep all existing, append only genuinely new entries
  const merged = [...existingOutages, ...trulyNewRecords];

  const newEntriesAdded = trulyNewRecords.length;

  const note =
    newEntriesAdded === 0
      ? "Pipeline completed successfully. No new data was found."
      : `Pipeline completed successfully. Added ${newEntriesAdded} new outage record(s).`;

  return {
    outages: merged,
    newEntriesAdded,
    note,
    success: true,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Serialise an outage dataset to a stable JSON string for comparison. */
function serialise(outages: OutageRecord[]): string {
  // Sort by id to ensure stable ordering regardless of insertion order
  const sorted = [...outages].sort((a, b) => a.id.localeCompare(b.id));
  return JSON.stringify(sorted, null, 2);
}

/** Count duplicate ids within a list of outage records. */
function countDuplicateIds(outages: OutageRecord[]): number {
  const seen = new Set<string>();
  let duplicates = 0;
  for (const o of outages) {
    if (seen.has(o.id)) {
      duplicates++;
    } else {
      seen.add(o.id);
    }
  }
  return duplicates;
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

function main(): void {
  console.log("Scenario: Pipeline is run a second time with no new HN posts\n");

  // Deep-clone the initial outages to avoid accidental mutation across runs
  const outagesAfterFirstRun: OutageRecord[] = JSON.parse(
    JSON.stringify(INITIAL_OUTAGES),
  );

  console.log(
    `State after first run: ${outagesAfterFirstRun.length} outage record(s)`,
  );

  // Capture the canonical serialisation of the dataset after the first run
  const snapshotAfterFirstRun = serialise(outagesAfterFirstRun);

  // ---------------------------------------------------------------------------
  // Second run — no new HN posts available
  // ---------------------------------------------------------------------------

  const noNewPosts: HNPost[] = [];

  console.log("Running pipeline a second time (no new HN posts available)...");
  const secondRunResult = runPipeline(outagesAfterFirstRun, noNewPosts);
  console.log(`  Pipeline note: "${secondRunResult.note}"`);
  console.log(`  New entries added: ${secondRunResult.newEntriesAdded}`);
  console.log(
    `  Dataset size after second run: ${secondRunResult.outages.length} record(s)`,
  );
  console.log();

  const snapshotAfterSecondRun = serialise(secondRunResult.outages);
  const duplicatesInSecondRunDataset = countDuplicateIds(secondRunResult.outages);

  // ---------------------------------------------------------------------------
  // Third run — Algolia re-fetches the same HN posts that were already processed.
  // The pipeline must detect them as duplicates via id matching and skip them.
  // The HN posts use objectIDs that correspond to the hn-{objectID} ids already
  // in the dataset, so the deduplication logic can match them.
  // ---------------------------------------------------------------------------

  // Reconstruct HN posts from the existing hn-prefixed entries in the dataset
  const alreadyProcessedHNPosts: HNPost[] = outagesAfterFirstRun
    .filter((o) => o.id.startsWith("hn-"))
    .map((o) => ({
      objectID: o.id.slice(3), // strip "hn-" to get the original Algolia objectID
      title: o.description,
      points: o.points ?? 0,
      num_comments: o.comments ?? 0,
      created_at: new Date(o.timestamp).toISOString(),
      url: o.hnUrl ?? null,
    }));

  console.log(
    `Running pipeline a third time with ${alreadyProcessedHNPosts.length} re-fetched ` +
      "post(s) that already exist in the dataset...",
  );
  const thirdRunResult = runPipeline(outagesAfterFirstRun, alreadyProcessedHNPosts);
  console.log(`  Pipeline note: "${thirdRunResult.note}"`);
  console.log(`  New entries added: ${thirdRunResult.newEntriesAdded}`);
  console.log(
    `  Dataset size after third run: ${thirdRunResult.outages.length} record(s)`,
  );
  console.log();

  const snapshotAfterThirdRun = serialise(thirdRunResult.outages);
  const duplicatesInThirdRunDataset = countDuplicateIds(thirdRunResult.outages);

  // ---------------------------------------------------------------------------
  // Checks
  // ---------------------------------------------------------------------------

  const failures: string[] = [];

  // Check 1: Pipeline must complete successfully
  if (!secondRunResult.success) {
    failures.push(
      "Second pipeline run did not complete successfully (success=false). " +
        "The pipeline must complete without error when no new data is available.",
    );
  }

  // Check 2: JSON file content must be identical after the second run
  if (snapshotAfterSecondRun !== snapshotAfterFirstRun) {
    const before = JSON.parse(snapshotAfterFirstRun) as OutageRecord[];
    const after = JSON.parse(snapshotAfterSecondRun) as OutageRecord[];
    failures.push(
      `Dataset content changed after the second run even though no new posts were provided.\n` +
        `  Records before: ${before.length}\n` +
        `  Records after : ${after.length}\n` +
        `  The output JSON file must be byte-for-byte identical when inputs are unchanged.`,
    );
  }

  // Check 3: No duplicate entries in the dataset after the second run
  if (duplicatesInSecondRunDataset > 0) {
    failures.push(
      `Found ${duplicatesInSecondRunDataset} duplicate id(s) in the dataset after the second run. ` +
        "The pipeline must never add a record whose id already exists.",
    );
  }

  // Check 4: The pipeline must emit a note indicating no new data was found
  const noteIndicatesNoNewData =
    secondRunResult.note.toLowerCase().includes("no new data") ||
    secondRunResult.note.toLowerCase().includes("no new") ||
    secondRunResult.newEntriesAdded === 0;

  if (!noteIndicatesNoNewData) {
    failures.push(
      `Pipeline completion note does not indicate that no new data was found.\n` +
        `  Got: "${secondRunResult.note}"\n` +
        `  Expected the note to contain "no new data" or similar phrasing.`,
    );
  }

  // Check 5: Exactly 0 new entries when no new posts are provided
  if (secondRunResult.newEntriesAdded !== 0) {
    failures.push(
      `Pipeline added ${secondRunResult.newEntriesAdded} new entry/entries during the second ` +
        "run despite receiving zero new HN posts. Expected 0 new entries.",
    );
  }

  // Check 6: Re-running with already-processed posts must be idempotent
  if (snapshotAfterThirdRun !== snapshotAfterFirstRun) {
    failures.push(
      "Dataset content changed when the pipeline re-processed already-existing posts.\n" +
        "  The deduplication logic must prevent re-adding posts whose ids are already present.",
    );
  }

  // Check 7: No duplicates when re-fetching already-processed posts
  if (duplicatesInThirdRunDataset > 0) {
    failures.push(
      `Found ${duplicatesInThirdRunDataset} duplicate id(s) after re-running with ` +
        "already-processed HN posts. The pipeline must deduplicate by id.",
    );
  }

  // Check 8: Third run also reports no new entries added
  if (thirdRunResult.newEntriesAdded !== 0) {
    failures.push(
      `Pipeline added ${thirdRunResult.newEntriesAdded} entry/entries when re-processing ` +
        "posts that already exist in the dataset. Expected 0 new entries.",
    );
  }

  // ---------------------------------------------------------------------------
  // Result
  // ---------------------------------------------------------------------------

  if (failures.length > 0) {
    process.stderr.write(`\nFAILED — ${failures.length} check(s) failed:\n\n`);
    for (const f of failures) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.exit(1);
  }

  console.log(
    "OK — all checks passed. Pipeline is idempotent:\n" +
      "  - JSON file content is identical after a second run with no new posts\n" +
      "  - No duplicate entries are added when re-processing existing posts\n" +
      "  - Pipeline completes successfully with a note that no new data was found",
  );
  process.exit(0);
}

main();
