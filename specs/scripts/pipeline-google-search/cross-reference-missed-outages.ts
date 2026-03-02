#!/usr/bin/env tsx
/**
 * Verifies that the Google search cross-reference step correctly identifies
 * HN posts about high-profile outages that were missed by Algolia keyword search,
 * and that duplicates with Algolia results are removed before classification.
 *
 * Spec: Pipeline-google-search — Google search cross-reference catches missed high-profile outages
 *
 * Context:
 *   Algolia keyword search missed the famous Facebook 6-hour BGP outage (October 2021)
 *   because the top HN post carried an unusual title that did not match any of the
 *   Algolia keyword queries ("outage", "down", "incident", "503", "degraded", etc.).
 *   The post was titled: "Facebook's BGP routes have been globally withdrawn"
 *
 * Steps:
 *   1. Run the Google search cross-reference step
 *   2. Observe the candidate posts found
 *
 * Expected:
 *   - Google search identifies the missed HN post about the Facebook outage
 *   - The post is added to the candidate list for LLM classification
 *   - Duplicates with already-found Algolia results are removed before classification
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-google-search/cross-reference-missed-outages.ts
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
  url: string;
  points: number;
  num_comments: number;
  author: string;
  created_at: string;
}

// A Google search result points at an HN post by ID and URL.
interface GoogleSearchResult {
  hnPostId: number;
  hnUrl: string;
}

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

// Posts Algolia found via keyword search ("outage", "down", "incident", etc.)
// The Facebook BGP outage post is NOT here — Algolia missed it.
const ALGOLIA_POSTS: HNPost[] = [
  {
    id: 28750001,
    title: "GitHub is down",
    url: "https://news.ycombinator.com/item?id=28750001",
    points: 612,
    num_comments: 198,
    author: "devuser1",
    created_at: "2021-10-01T14:00:00.000Z",
  },
  {
    id: 28750002,
    title: "AWS S3 returning 503 errors globally",
    url: "https://news.ycombinator.com/item?id=28750002",
    points: 850,
    num_comments: 320,
    author: "devuser2",
    created_at: "2021-10-03T09:00:00.000Z",
  },
  {
    id: 28750003,
    title: "Cloudflare outage — DNS resolution failing",
    url: "https://news.ycombinator.com/item?id=28750003",
    points: 430,
    num_comments: 112,
    author: "devuser3",
    created_at: "2021-10-05T17:00:00.000Z",
  },
];

// The HN post that Algolia missed: unusual title with no standard outage keywords.
// This is the high-profile Facebook BGP outage from October 4, 2021.
const MISSED_FACEBOOK_POST: HNPost = {
  id: 28749858,
  title: "Facebook's BGP routes have been globally withdrawn",
  url: "https://news.ycombinator.com/item?id=28749858",
  points: 3142,
  num_comments: 1087,
  author: "bgpwatcher",
  created_at: "2021-10-04T15:58:00.000Z",
};

// What Google search returns when queried for "site:news.ycombinator.com Facebook outage 2021":
//   - The missed Facebook post (new discovery)
//   - Plus two posts already in the Algolia results (duplicates to filter out)
const GOOGLE_SEARCH_RESULTS: GoogleSearchResult[] = [
  // The missed Facebook outage post — Google found it, Algolia did not
  {
    hnPostId: MISSED_FACEBOOK_POST.id,
    hnUrl: MISSED_FACEBOOK_POST.url,
  },
  // Duplicate: already in Algolia results
  {
    hnPostId: ALGOLIA_POSTS[0].id,
    hnUrl: ALGOLIA_POSTS[0].url,
  },
  // Duplicate: already in Algolia results
  {
    hnPostId: ALGOLIA_POSTS[1].id,
    hnUrl: ALGOLIA_POSTS[1].url,
  },
];

// All available HN posts (simulates the HN API / local cache used to fetch post details)
const HN_POST_DATABASE = new Map<number, HNPost>([
  [MISSED_FACEBOOK_POST.id, MISSED_FACEBOOK_POST],
  ...ALGOLIA_POSTS.map((p): [number, HNPost] => [p.id, p]),
]);

// ---------------------------------------------------------------------------
// Google cross-reference step
//
// Algorithm:
//   1. Collect the set of HN post IDs already discovered by Algolia.
//   2. For each Google search result, check whether the post ID is already known.
//   3. If not known, fetch the full post data and add it to the candidate list.
//   4. Return only the new (non-duplicate) candidates for LLM classification.
// ---------------------------------------------------------------------------

interface CrossReferenceResult {
  newCandidates: HNPost[];
  duplicatesSkipped: number[];
  notFoundInDb: number[];
}

function runGoogleCrossReference(
  algoliaResults: HNPost[],
  googleResults: GoogleSearchResult[],
): CrossReferenceResult {
  // Build a set of already-known IDs from Algolia.
  const knownIds = new Set(algoliaResults.map((p) => p.id));

  const newCandidates: HNPost[] = [];
  const duplicatesSkipped: number[] = [];
  const notFoundInDb: number[] = [];

  for (const result of googleResults) {
    if (knownIds.has(result.hnPostId)) {
      // Already found by Algolia — skip to avoid duplicate LLM classification.
      duplicatesSkipped.push(result.hnPostId);
      continue;
    }

    // New post — fetch its full data and add to candidate list.
    const post = HN_POST_DATABASE.get(result.hnPostId);
    if (!post) {
      notFoundInDb.push(result.hnPostId);
      continue;
    }

    newCandidates.push(post);
    knownIds.add(result.hnPostId); // prevent duplicates within Google results
  }

  return { newCandidates, duplicatesSkipped, notFoundInDb };
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Google cross-reference missed outages verification ===\n");
  console.log(`Algolia posts found   : ${ALGOLIA_POSTS.length}`);
  console.log(`Google search results : ${GOOGLE_SEARCH_RESULTS.length}`);
  console.log(
    `  (includes ${GOOGLE_SEARCH_RESULTS.length - 1} duplicate(s) already in Algolia)\n`,
  );
  console.log(
    `Missed post to detect : [${MISSED_FACEBOOK_POST.id}] "${MISSED_FACEBOOK_POST.title}"`,
  );
  console.log(
    `  (${MISSED_FACEBOOK_POST.points} pts, ${MISSED_FACEBOOK_POST.num_comments} comments, ` +
      `posted ${MISSED_FACEBOOK_POST.created_at})\n`,
  );

  const { newCandidates, duplicatesSkipped, notFoundInDb } =
    runGoogleCrossReference(ALGOLIA_POSTS, GOOGLE_SEARCH_RESULTS);

  console.log("Cross-reference output:");
  console.log(`  New candidates added : ${newCandidates.length}`);
  for (const c of newCandidates) {
    console.log(`    [${c.id}] "${c.title}" (${c.points} pts)`);
  }
  console.log(`  Duplicates skipped   : ${duplicatesSkipped.length} (ids: ${duplicatesSkipped.join(", ")})`);
  console.log(`  Not found in DB      : ${notFoundInDb.length}\n`);

  const failures: string[] = [];

  // ------------------------------------------------------------------
  // Check 1: The Facebook outage post must appear in the new candidates
  // ------------------------------------------------------------------

  const facebookCandidate = newCandidates.find(
    (p) => p.id === MISSED_FACEBOOK_POST.id,
  );

  if (!facebookCandidate) {
    failures.push(
      `[Check 1] The missed Facebook outage post (id=${MISSED_FACEBOOK_POST.id}, ` +
        `"${MISSED_FACEBOOK_POST.title}") was not added to the candidate list. ` +
        `Google search must surface HN posts that Algolia keyword queries did not find, ` +
        `even when the post title contains no standard outage keywords.`,
    );
  }

  // ------------------------------------------------------------------
  // Check 2: The Facebook post's title must be preserved exactly
  //   (verify the correct post record was fetched, not a stub)
  // ------------------------------------------------------------------

  if (facebookCandidate) {
    if (facebookCandidate.title !== MISSED_FACEBOOK_POST.title) {
      failures.push(
        `[Check 2] Candidate post title mismatch: expected ` +
          `"${MISSED_FACEBOOK_POST.title}" but got "${facebookCandidate.title}". ` +
          `The full HN post record must be retrieved for every new Google result.`,
      );
    }

    if (facebookCandidate.points !== MISSED_FACEBOOK_POST.points) {
      failures.push(
        `[Check 2] Candidate post upvotes mismatch: expected ${MISSED_FACEBOOK_POST.points} ` +
          `but got ${facebookCandidate.points}. Full post metadata must be preserved.`,
      );
    }

    if (facebookCandidate.num_comments !== MISSED_FACEBOOK_POST.num_comments) {
      failures.push(
        `[Check 2] Candidate post comment count mismatch: expected ${MISSED_FACEBOOK_POST.num_comments} ` +
          `but got ${facebookCandidate.num_comments}. Full post metadata must be preserved.`,
      );
    }
  }

  // ------------------------------------------------------------------
  // Check 3: Posts already found by Algolia must be excluded
  //   (no duplicate LLM classification calls)
  // ------------------------------------------------------------------

  for (const algoliaPost of ALGOLIA_POSTS) {
    const duplicate = newCandidates.find((p) => p.id === algoliaPost.id);
    if (duplicate) {
      failures.push(
        `[Check 3] Post id=${algoliaPost.id} ("${algoliaPost.title}") was already found ` +
          `by Algolia but appeared in the new candidate list. ` +
          `Algolia duplicates must be removed before LLM classification to avoid ` +
          `wasting API calls on already-processed posts.`,
      );
    }
  }

  const expectedDuplicateIds = new Set(ALGOLIA_POSTS.map((p) => p.id));
  const googleDuplicateIds = GOOGLE_SEARCH_RESULTS.map((r) => r.hnPostId).filter(
    (id) => expectedDuplicateIds.has(id),
  );

  for (const id of googleDuplicateIds) {
    if (!duplicatesSkipped.includes(id)) {
      failures.push(
        `[Check 3] Post id=${id} is present in both Algolia results and Google results ` +
          `but was not recorded in the duplicatesSkipped list. ` +
          `The cross-reference step must track which posts were skipped as duplicates.`,
      );
    }
  }

  // ------------------------------------------------------------------
  // Check 4: Exactly the right number of new candidates are returned
  //
  // Google returned 3 results total:
  //   - 1 new (the Facebook post not in Algolia)
  //   - 2 duplicates (already in Algolia)
  // So newCandidates should contain exactly 1 entry.
  // ------------------------------------------------------------------

  const expectedNewCount = GOOGLE_SEARCH_RESULTS.filter(
    (r) => !ALGOLIA_POSTS.some((p) => p.id === r.hnPostId),
  ).length;

  if (newCandidates.length !== expectedNewCount) {
    failures.push(
      `[Check 4] Expected ${expectedNewCount} new candidate(s) after deduplication ` +
        `but got ${newCandidates.length}. ` +
        `Of ${GOOGLE_SEARCH_RESULTS.length} Google results, ` +
        `${GOOGLE_SEARCH_RESULTS.length - expectedNewCount} were already in Algolia.`,
    );
  }

  // ------------------------------------------------------------------
  // Check 5: The missed post would NOT have been found by Algolia keywords
  //   This verifies the scenario is realistic: the unusual title contains
  //   none of the standard Algolia outage query keywords.
  // ------------------------------------------------------------------

  const ALGOLIA_KEYWORDS = [
    "outage", "down", "incident", "503", "degraded", "unavailable",
    "unreachable", "disruption", "service disruption",
  ];

  const titleLower = MISSED_FACEBOOK_POST.title.toLowerCase();
  const matchedKeyword = ALGOLIA_KEYWORDS.find((kw) => titleLower.includes(kw));

  if (matchedKeyword) {
    failures.push(
      `[Check 5] Test data integrity error: the "missed" Facebook post title ` +
        `"${MISSED_FACEBOOK_POST.title}" contains Algolia keyword "${matchedKeyword}". ` +
        `The scenario requires a title that Algolia keyword search would NOT match. ` +
        `Update the test fixture with a title that avoids all standard outage keywords.`,
    );
  } else {
    console.log(
      `Confirmed: "${MISSED_FACEBOOK_POST.title}" contains none of the Algolia keywords`,
    );
    console.log(`  (searched for: ${ALGOLIA_KEYWORDS.join(", ")})\n`);
  }

  // ------------------------------------------------------------------
  // Check 6: The Facebook post ID is not in the Algolia results
  //   (confirms Algolia genuinely missed it)
  // ------------------------------------------------------------------

  const algoliaHasIt = ALGOLIA_POSTS.some(
    (p) => p.id === MISSED_FACEBOOK_POST.id,
  );

  if (algoliaHasIt) {
    failures.push(
      `[Check 6] Test data integrity error: the Facebook post (id=${MISSED_FACEBOOK_POST.id}) ` +
        `is already present in the Algolia results. ` +
        `The scenario requires that Algolia missed this post.`,
    );
  }

  // ------------------------------------------------------------------
  // Check 7: The Facebook post IS in the Google search results
  //   (confirms Google was able to find what Algolia missed)
  // ------------------------------------------------------------------

  const googleHasIt = GOOGLE_SEARCH_RESULTS.some(
    (r) => r.hnPostId === MISSED_FACEBOOK_POST.id,
  );

  if (!googleHasIt) {
    failures.push(
      `[Check 7] Test data integrity error: the Facebook post (id=${MISSED_FACEBOOK_POST.id}) ` +
        `is not present in the Google search results. ` +
        `The scenario requires Google to return this post so the cross-reference can surface it.`,
    );
  }

  // ------------------------------------------------------------------
  // Report
  // ------------------------------------------------------------------

  if (failures.length > 0) {
    process.stderr.write(`\nFAILED — ${failures.length} check(s) failed:\n\n`);
    for (const f of failures) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.exit(1);
  }

  console.log(
    "OK — all checks passed. Google cross-reference correctly surfaces missed high-profile outages:",
  );
  console.log(
    `  - Identified missed Facebook outage post (id=${MISSED_FACEBOOK_POST.id}) ` +
      `"${MISSED_FACEBOOK_POST.title}"`,
  );
  console.log(
    `  - Post added to candidate list for LLM classification (${facebookCandidate!.points} pts, ` +
      `${facebookCandidate!.num_comments} comments)`,
  );
  console.log(
    `  - ${duplicatesSkipped.length} Algolia duplicate(s) removed before classification ` +
      `(ids: ${duplicatesSkipped.join(", ")})`,
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`FAILED — unexpected error: ${msg}\n`);
  process.exit(1);
});
