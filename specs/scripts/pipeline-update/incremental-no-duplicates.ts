#!/usr/bin/env tsx
/**
 * Verifies that running the pipeline in monthly update mode correctly appends
 * new posts to the existing dataset without duplicating existing entries, and
 * that deduplication still applies to new posts within 7-day windows.
 *
 * Spec: Pipeline-update — Pipeline incremental update does not duplicate existing data
 *
 * Context:
 *   Pipeline has been run before and JSON file contains existing outage data.
 *   Pipeline runs again for a monthly update.
 *
 * Steps:
 *   1. Run the pipeline in monthly update mode
 *
 * Expected:
 *   - New posts are appended to the existing dataset
 *   - Existing posts are not duplicated
 *   - Deduplication still applies for posts within 7-day windows of new data
 *   - The JSON file is updated atomically
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-update/incremental-no-duplicates.ts
 *
 * Exit 0 = verification passed
 * Exit non-zero = verification failed
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

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
  service: string;
  points: number;
  num_comments: number;
  created_at: string;
  url: string | null;
  severity: "major" | "moderate" | "minor";
  duration: string;
}

interface PipelineRunResult {
  outages: OutageRecord[];
  newEntriesAdded: number;
  note: string;
  success: boolean;
  /** Path of the file that was atomically written, if any */
  outputPath?: string;
}

// ---------------------------------------------------------------------------
// Simulated initial dataset — represents the JSON file after the first run.
// HN-sourced records use the hn-{objectID} id format the pipeline assigns.
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
// Monthly update: new HN posts fetched by Algolia
//
// Mix of:
//   A) Brand-new posts not in the dataset (should be appended)
//   B) Already-processed posts (same objectID as existing hn-* records; should be skipped)
//   C) Two new posts about the same service within a 7-day window (only the
//      higher-upvoted one should survive deduplication)
// ---------------------------------------------------------------------------

const YEAR = 2024;

// A) Genuinely new outage posts
const NEW_UNIQUE_POST: HNPost = {
  objectID: "38900001",
  title: "GitHub Actions down for several hours",
  service: "GitHub",
  points: 760,
  num_comments: 295,
  created_at: new Date(`${YEAR}-01-20T10:00:00.000Z`).toISOString(),
  url: "https://news.ycombinator.com/item?id=38900001",
  severity: "moderate",
  duration: "3 hours",
};

// B) Re-fetched posts that already exist in the dataset
const ALREADY_EXISTING_POSTS: HNPost[] = [
  {
    objectID: "35052503", // corresponds to existing id "hn-35052503"
    title: "Twitter went down globally amid ongoing infrastructure changes after acquisition",
    service: "Twitter",
    points: 2103,
    num_comments: 891,
    created_at: new Date("2023-03-06").toISOString(),
    url: "https://news.ycombinator.com/item?id=35052503",
    severity: "major",
    duration: "2 hours",
  },
  {
    objectID: "36314001", // corresponds to existing id "hn-36314001"
    title: "Reddit went dark as communities protested API pricing changes",
    service: "Reddit",
    points: 3421,
    num_comments: 1523,
    created_at: new Date("2023-06-12").toISOString(),
    url: "https://news.ycombinator.com/item?id=36314001",
    severity: "major",
    duration: "48 hours",
  },
];

// C) Two new posts about the same service (Slack) within a 7-day window.
//    Post on Jan 22 has more upvotes — it should be kept as the representative.
//    Post on Jan 25 should be merged/discarded.
const SLACK_POST_JAN22: HNPost = {
  objectID: "38911000",
  title: "Slack is down for many users",
  service: "Slack",
  points: 940,
  num_comments: 312,
  created_at: new Date(`${YEAR}-01-22T08:00:00.000Z`).toISOString(),
  url: "https://news.ycombinator.com/item?id=38911000",
  severity: "major",
  duration: "2 hours",
};

const SLACK_POST_JAN25: HNPost = {
  objectID: "38920000",
  title: "Slack experiencing ongoing connectivity issues",
  service: "Slack",
  points: 420,
  num_comments: 156,
  created_at: new Date(`${YEAR}-01-25T14:00:00.000Z`).toISOString(),
  url: "https://news.ycombinator.com/item?id=38920000",
  severity: "moderate",
  duration: "1 hour",
};

const ALL_NEW_POSTS: HNPost[] = [
  NEW_UNIQUE_POST,
  ...ALREADY_EXISTING_POSTS,
  SLACK_POST_JAN22,
  SLACK_POST_JAN25,
];

// ---------------------------------------------------------------------------
// Pipeline logic
//
// Monthly update mode:
//   1. Load existing outage records from the JSON file.
//   2. Receive new HN posts from Algolia for the current month.
//   3. Convert posts to OutageRecord entries (id = "hn-" + objectID).
//   4. Skip posts whose id already exists in the dataset (no duplicates).
//   5. Apply 7-day deduplication to the remaining candidate records:
//      - Group by service, cluster into 7-day windows.
//      - Within each window, keep the highest-upvoted post.
//   6. Append surviving records to the existing dataset.
//   7. Write the updated dataset atomically (tmp file → rename).
// ---------------------------------------------------------------------------

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function hnPostToOutageRecord(post: HNPost): OutageRecord {
  return {
    id: `hn-${post.objectID}`,
    service: post.service,
    date: new Date(post.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    description: post.title,
    duration: post.duration,
    timestamp: new Date(post.created_at).getTime(),
    severity: post.severity,
    points: post.points,
    comments: post.num_comments,
    hnUrl: post.url ?? undefined,
  };
}

function deduplicateCandidates(records: OutageRecord[]): OutageRecord[] {
  // Sort ascending by timestamp
  const sorted = [...records].sort((a, b) => a.timestamp - b.timestamp);

  // Group by service (case-insensitive)
  const byService = new Map<string, OutageRecord[]>();
  for (const record of sorted) {
    const key = record.service.toLowerCase().trim();
    if (!byService.has(key)) byService.set(key, []);
    byService.get(key)!.push(record);
  }

  const survivors: OutageRecord[] = [];

  for (const [, servicePosts] of byService) {
    const clusters: OutageRecord[][] = [];
    let currentCluster: OutageRecord[] = [];
    let windowStart: number | null = null;

    for (const record of servicePosts) {
      if (windowStart === null) {
        windowStart = record.timestamp;
        currentCluster = [record];
      } else if (record.timestamp - windowStart <= SEVEN_DAYS_MS) {
        currentCluster.push(record);
      } else {
        clusters.push(currentCluster);
        currentCluster = [record];
        windowStart = record.timestamp;
      }
    }
    if (currentCluster.length > 0) {
      clusters.push(currentCluster);
    }

    // Keep the highest-upvoted post per cluster
    for (const cluster of clusters) {
      const representative = cluster.reduce((best, r) =>
        (r.points ?? 0) > (best.points ?? 0) ? r : best,
      );
      survivors.push(representative);
    }
  }

  return survivors;
}

function runMonthlyUpdate(
  existingOutages: OutageRecord[],
  newHNPosts: HNPost[],
  outputFilePath: string,
): PipelineRunResult {
  // Build a set of existing ids for O(1) duplicate detection
  const existingIds = new Set(existingOutages.map((o) => o.id));

  // Convert new posts to outage records
  const candidateRecords = newHNPosts.map(hnPostToOutageRecord);

  // Step 1: filter out any record whose id already exists in the dataset
  const nonDuplicateCandidates = candidateRecords.filter(
    (r) => !existingIds.has(r.id),
  );

  // Step 2: deduplicate candidates by 7-day window within each service
  const deduplicatedNew = deduplicateCandidates(nonDuplicateCandidates);

  // Step 3: merge with existing records
  const merged = [...existingOutages, ...deduplicatedNew];
  const newEntriesAdded = deduplicatedNew.length;

  // Step 4: atomic write — write to a temp file, then rename
  const dir = path.dirname(outputFilePath);
  const tmpFile = path.join(dir, `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
  const payload = JSON.stringify(merged, null, 2);
  fs.writeFileSync(tmpFile, payload, "utf-8");
  fs.renameSync(tmpFile, outputFilePath);

  const note =
    newEntriesAdded === 0
      ? "Monthly update completed. No new outage records found."
      : `Monthly update completed. Added ${newEntriesAdded} new outage record(s).`;

  return {
    outages: merged,
    newEntriesAdded,
    note,
    success: true,
    outputPath: outputFilePath,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countDuplicateIds(outages: OutageRecord[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const o of outages) {
    counts.set(o.id, (counts.get(o.id) ?? 0) + 1);
  }
  const duplicates = new Map<string, number>();
  for (const [id, count] of counts) {
    if (count > 1) duplicates.set(id, count);
  }
  return duplicates;
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

function main(): void {
  console.log("Scenario: Pipeline monthly update with mixed new and existing posts\n");

  const existingOutages: OutageRecord[] = JSON.parse(
    JSON.stringify(INITIAL_OUTAGES),
  );

  console.log(`Initial dataset: ${existingOutages.length} outage record(s)`);
  for (const o of existingOutages) {
    console.log(`  [${o.id}] ${o.service} — ${o.date}`);
  }

  console.log(`\nNew HN posts from monthly Algolia fetch: ${ALL_NEW_POSTS.length} post(s)`);
  for (const p of ALL_NEW_POSTS) {
    const existingId = `hn-${p.objectID}`;
    const status = existingOutages.some((o) => o.id === existingId)
      ? "already exists"
      : "new";
    console.log(`  [hn-${p.objectID}] ${p.service} — ${p.created_at} — ${p.points} pts (${status})`);
  }

  // Set up a temporary output file to verify atomic write
  const tmpDir = os.tmpdir();
  const outputFilePath = path.join(tmpDir, `downtime-detector-test-${Date.now()}.json`);

  console.log(`\nRunning monthly update pipeline...`);
  const result = runMonthlyUpdate(existingOutages, ALL_NEW_POSTS, outputFilePath);
  console.log(`  Note: "${result.note}"`);
  console.log(`  New entries added: ${result.newEntriesAdded}`);
  console.log(`  Dataset size after update: ${result.outages.length} record(s)`);
  console.log();

  // ---------------------------------------------------------------------------
  // Checks
  // ---------------------------------------------------------------------------

  const failures: string[] = [];

  // Check 1: Pipeline must succeed
  if (!result.success) {
    failures.push(
      "Pipeline did not complete successfully (success=false).",
    );
  }

  // Check 2: Existing posts must not be duplicated
  const duplicates = countDuplicateIds(result.outages);
  if (duplicates.size > 0) {
    for (const [id, count] of duplicates) {
      failures.push(
        `Existing post '${id}' appears ${count} times in the updated dataset. ` +
          "Existing posts must not be duplicated during an incremental update.",
      );
    }
  }

  // Check 3: All original records must still be present
  for (const original of INITIAL_OUTAGES) {
    const found = result.outages.find((o) => o.id === original.id);
    if (!found) {
      failures.push(
        `Original outage record '${original.id}' (${original.service}) is missing ` +
          "from the dataset after the monthly update. Existing records must be preserved.",
      );
    }
  }

  // Check 4: The brand-new post must have been appended
  const newUniqueId = `hn-${NEW_UNIQUE_POST.objectID}`;
  if (!result.outages.find((o) => o.id === newUniqueId)) {
    failures.push(
      `New post '${newUniqueId}' (${NEW_UNIQUE_POST.service}) was not appended to the dataset. ` +
        "Genuinely new posts must be added during an incremental update.",
    );
  }

  // Check 5: Re-fetched posts (already existing) must NOT have been added again
  for (const existing of ALREADY_EXISTING_POSTS) {
    const existingId = `hn-${existing.objectID}`;
    const occurrences = result.outages.filter((o) => o.id === existingId).length;
    if (occurrences > 1) {
      failures.push(
        `Post '${existingId}' (${existing.service}) already existed and was duplicated ` +
          `(found ${occurrences} times). Already-existing posts must be skipped.`,
      );
    }
  }

  // Check 6: Slack posts — the two posts are within a 7-day window (3 days apart).
  //   Only one Slack outage event should appear in the new additions.
  //   The Jan 22 post (940 pts) has more upvotes than Jan 25 (420 pts), so it
  //   should be the survivor.
  const slack22Id = `hn-${SLACK_POST_JAN22.objectID}`;
  const slack25Id = `hn-${SLACK_POST_JAN25.objectID}`;
  const slackEntries = result.outages.filter(
    (o) => o.id === slack22Id || o.id === slack25Id,
  );
  const daysBetweenSlackPosts =
    (new Date(SLACK_POST_JAN25.created_at).getTime() -
      new Date(SLACK_POST_JAN22.created_at).getTime()) /
    (24 * 60 * 60 * 1000);

  if (slackEntries.length !== 1) {
    failures.push(
      `Expected exactly 1 Slack outage entry after deduplication of two posts ` +
        `${daysBetweenSlackPosts} days apart (within 7-day window), ` +
        `but found ${slackEntries.length} Slack entries (ids: ${slackEntries.map((e) => e.id).join(", ")}). ` +
        "Deduplication must merge posts about the same service within a 7-day window.",
    );
  } else {
    // Check that the surviving post is the higher-upvoted one
    const survivor = slackEntries[0];
    if (survivor.id !== slack22Id) {
      failures.push(
        `Expected the surviving Slack post to be '${slack22Id}' ` +
          `(${SLACK_POST_JAN22.points} pts, Jan 22) but got '${survivor.id}' ` +
          `(${survivor.points ?? 0} pts). ` +
          "The highest-upvoted post must be kept as the representative.",
      );
    }
  }

  // Check 7: Total dataset size should be exactly:
  //   initial records + 1 new unique + 1 slack survivor (deduped from 2)
  //   = 5 + 1 + 1 = 7
  const expectedTotal = INITIAL_OUTAGES.length + 1 + 1; // 7
  if (result.outages.length !== expectedTotal) {
    failures.push(
      `Expected dataset to contain ${expectedTotal} record(s) after the monthly update ` +
        `(${INITIAL_OUTAGES.length} existing + 1 new unique + 1 deduplicated Slack) ` +
        `but got ${result.outages.length} record(s).`,
    );
  }

  // Check 8: Atomic write — the output file must exist and contain valid JSON
  //   that matches the in-memory result.
  let fileContent: OutageRecord[] | null = null;
  if (!fs.existsSync(outputFilePath)) {
    failures.push(
      `Output file '${outputFilePath}' does not exist. ` +
        "The pipeline must write the updated dataset to the output file.",
    );
  } else {
    try {
      const raw = fs.readFileSync(outputFilePath, "utf-8");
      fileContent = JSON.parse(raw) as OutageRecord[];
    } catch (err) {
      failures.push(
        `Output file '${outputFilePath}' contains invalid JSON: ${(err as Error).message}. ` +
          "Atomic write must produce a valid JSON file.",
      );
    }

    if (fileContent !== null) {
      // File must contain exactly the same records as the in-memory result
      if (fileContent.length !== result.outages.length) {
        failures.push(
          `Output file contains ${fileContent.length} record(s) but the in-memory ` +
            `result has ${result.outages.length} record(s). ` +
            "The file must be written atomically with the complete merged dataset.",
        );
      }

      // The tmp file must no longer exist (rename completed)
      const tmpFiles = fs.readdirSync(os.tmpdir()).filter((f) =>
        f.startsWith(".tmp-") && f.endsWith(".json"),
      );
      // We can't be sure no other process left a tmp file, but our specific one must be gone
      const ourTmpPattern = path.basename(outputFilePath).replace(
        "downtime-detector-test-",
        ".tmp-",
      );
      const ourTmpExists = tmpFiles.some((f) => f === ourTmpPattern);
      if (ourTmpExists) {
        failures.push(
          "Temporary file still exists after the atomic write. " +
            "The atomic write (tmp → rename) must clean up the temp file.",
        );
      }
    }
  }

  // Cleanup
  try {
    if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
  } catch {
    // best-effort cleanup
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
    "OK — all checks passed. Monthly incremental update behaves correctly:\n" +
      `  - New post '${newUniqueId}' was appended to the dataset\n` +
      "  - Existing posts were not duplicated\n" +
      `  - Two Slack posts within ${daysBetweenSlackPosts}-day window were deduplicated to 1\n` +
      "  - The JSON file was written atomically",
  );
  process.exit(0);
}

main();
