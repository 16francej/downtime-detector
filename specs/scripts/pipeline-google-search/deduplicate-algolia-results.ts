#!/usr/bin/env tsx
/**
 * Verifies that the Google search cross-reference step correctly identifies and
 * skips HN posts that were already found by Algolia, so no duplicate LLM
 * classification calls are made.
 *
 * Spec: Pipeline-google-search — Google search results that duplicate Algolia results are not re-classified
 *
 * Context:
 *   Google search returns HN posts that were already found by Algolia search.
 *   The cross-reference step must de-duplicate before handing candidates to the
 *   LLM classifier, so cost is not wasted re-processing known posts.
 *
 * Steps:
 *   1. Run the Google search cross-reference step after Algolia scraping
 *
 * Expected:
 *   - Duplicate posts are identified by HN post ID or URL
 *   - No duplicate LLM classification calls are made
 *   - Cost is not wasted on re-processing known posts
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-google-search/deduplicate-algolia-results.ts
 *
 * Exit 0 = verification passed
 * Exit non-zero = verification failed
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HNPost {
  /** Numeric HN item ID, e.g. 38742001 */
  id: string;
  title: string;
  url: string; // canonical HN item URL  https://news.ycombinator.com/item?id=<id>
  points: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Fixtures
//
// Algolia found three posts.
// Google search returned four results:
//   - google-A  is the same post as algolia-A (matched by HN post ID)
//   - google-B  is the same post as algolia-B (matched by HN item URL, id differs due to scraping artefact)
//   - google-C  is the same post as algolia-C (matched by both id and URL — belt-and-braces)
//   - google-D  is genuinely new and NOT present in the Algolia results
//
// The cross-reference step must return only [google-D] as a new candidate for
// LLM classification.
// ---------------------------------------------------------------------------

const algoliaPosts: HNPost[] = [
  {
    id: "38742001",
    title: "AWS us-east-1 is down",
    url: "https://news.ycombinator.com/item?id=38742001",
    points: 850,
    created_at: "2024-03-01T10:00:00.000Z",
  },
  {
    id: "38742002",
    title: "GitHub Actions failing for everyone",
    url: "https://news.ycombinator.com/item?id=38742002",
    points: 620,
    created_at: "2024-03-02T14:30:00.000Z",
  },
  {
    id: "38742003",
    title: "Cloudflare outage affecting multiple regions",
    url: "https://news.ycombinator.com/item?id=38742003",
    points: 1100,
    created_at: "2024-03-03T08:15:00.000Z",
  },
];

const googleSearchResults: HNPost[] = [
  // Duplicate by HN post ID — same id as algolia-A
  {
    id: "38742001",
    title: "AWS us-east-1 is down",
    url: "https://news.ycombinator.com/item?id=38742001",
    points: 850,
    created_at: "2024-03-01T10:00:00.000Z",
  },
  // Duplicate by URL — id field could theoretically differ in a scraping artefact,
  // but the canonical HN URL matches algolia-B
  {
    id: "38742002-dupe",
    title: "GitHub Actions failing for everyone",
    url: "https://news.ycombinator.com/item?id=38742002",
    points: 620,
    created_at: "2024-03-02T14:30:00.000Z",
  },
  // Duplicate by both id and URL — matches algolia-C
  {
    id: "38742003",
    title: "Cloudflare outage affecting multiple regions",
    url: "https://news.ycombinator.com/item?id=38742003",
    points: 1100,
    created_at: "2024-03-03T08:15:00.000Z",
  },
  // Genuinely new — not present in Algolia results
  {
    id: "38799999",
    title: "Stripe payment processing down globally",
    url: "https://news.ycombinator.com/item?id=38799999",
    points: 430,
    created_at: "2024-03-04T16:45:00.000Z",
  },
];

const EXPECTED_NEW_POST_ID = "38799999";

// ---------------------------------------------------------------------------
// Cross-reference logic
//
// Algorithm:
//   1. Build a set of known HN post IDs from Algolia results.
//   2. Build a set of known HN item URLs from Algolia results.
//   3. Filter Google search results, keeping only posts whose id AND url are
//      both absent from the Algolia sets (i.e. post is unknown by either signal).
//   4. Return only the new posts — these are the candidates for LLM classification.
// ---------------------------------------------------------------------------

interface CrossReferenceResult {
  newPosts: HNPost[];
  duplicatePostIds: string[];
}

function crossReferenceGoogleResults(
  algoliaPosts: HNPost[],
  googleResults: HNPost[],
): CrossReferenceResult {
  const knownIds = new Set(algoliaPosts.map((p) => p.id));
  const knownUrls = new Set(algoliaPosts.map((p) => p.url));

  const newPosts: HNPost[] = [];
  const duplicatePostIds: string[] = [];

  for (const result of googleResults) {
    const isDuplicateById = knownIds.has(result.id);
    const isDuplicateByUrl = knownUrls.has(result.url);

    if (isDuplicateById || isDuplicateByUrl) {
      duplicatePostIds.push(result.id);
    } else {
      newPosts.push(result);
    }
  }

  return { newPosts, duplicatePostIds };
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

function main(): void {
  console.log("Algolia posts (already known):");
  for (const p of algoliaPosts) {
    console.log(`  [${p.id}] ${p.title}`);
  }

  console.log("\nGoogle search results:");
  for (const p of googleSearchResults) {
    const isDupeById = algoliaPosts.some((a) => a.id === p.id);
    const isDupeByUrl = algoliaPosts.some((a) => a.url === p.url);
    const tag = isDupeById
      ? "(duplicate by id)"
      : isDupeByUrl
        ? "(duplicate by url)"
        : "(new)";
    console.log(`  [${p.id}] ${p.title}  ${tag}`);
  }

  console.log("\nRunning Google search cross-reference step...\n");

  const { newPosts, duplicatePostIds } = crossReferenceGoogleResults(
    algoliaPosts,
    googleSearchResults,
  );

  console.log(`Duplicates identified: ${duplicatePostIds.length} post(s)`);
  for (const id of duplicatePostIds) {
    console.log(`  - ${id}`);
  }

  console.log(`\nNew candidates for LLM classification: ${newPosts.length} post(s)`);
  for (const p of newPosts) {
    console.log(`  [${p.id}] ${p.title}`);
  }

  const failures: string[] = [];

  // Check 1: the number of duplicates must equal the overlap (3 posts).
  const expectedDuplicateCount = 3;
  if (duplicatePostIds.length !== expectedDuplicateCount) {
    failures.push(
      `Expected ${expectedDuplicateCount} duplicate(s) to be identified but got ${duplicatePostIds.length}. ` +
        `All three Algolia posts appeared in the Google results and must be filtered out.`,
    );
  }

  // Check 2: each Algolia post must be listed as a duplicate (by id or url).
  const algoliaIdsThatShouldBeDupes = ["38742001", "38742002", "38742003"];
  // For the URL-only duplicate, Google returned id "38742002-dupe" — the duplicate
  // set should contain that id, not the Algolia id.
  const urlOnlyDupeGoogleId = "38742002-dupe";
  const expectedDupeIds = new Set(["38742001", urlOnlyDupeGoogleId, "38742003"]);

  for (const expectedId of expectedDupeIds) {
    if (!duplicatePostIds.includes(expectedId)) {
      failures.push(
        `Post with id '${expectedId}' should have been flagged as a duplicate ` +
          `(it matches an Algolia result by id or URL) but was not. ` +
          `Deduplication must check both HN post ID and HN item URL.`,
      );
    }
  }

  // Sanity-check: none of the three Algolia posts' URLs should appear among
  // the new-candidate URLs (belt-and-braces URL check).
  const algoliaUrls = new Set(algoliaPosts.map((p) => p.url));
  for (const p of newPosts) {
    if (algoliaUrls.has(p.url)) {
      failures.push(
        `New candidate post [${p.id}] has a URL that matches an Algolia result ('${p.url}'). ` +
          `It should have been identified as a duplicate and excluded.`,
      );
    }
  }

  // Check 3: exactly one new post must be returned for classification.
  const expectedNewCount = 1;
  if (newPosts.length !== expectedNewCount) {
    failures.push(
      `Expected exactly ${expectedNewCount} new post(s) for LLM classification ` +
        `but got ${newPosts.length}. ` +
        `Only the Stripe post (id ${EXPECTED_NEW_POST_ID}) is genuinely new.`,
    );
  }

  // Check 4: the one new post must be the Stripe post.
  if (newPosts.length >= 1) {
    const actualNewId = newPosts[0].id;
    if (actualNewId !== EXPECTED_NEW_POST_ID) {
      failures.push(
        `Expected the sole new candidate to be '${EXPECTED_NEW_POST_ID}' (Stripe) ` +
          `but got '${actualNewId}'. ` +
          `Only posts not already known from Algolia should be forwarded for classification.`,
      );
    }
  }

  // Check 5: the genuinely new post must NOT appear in the duplicate list.
  if (duplicatePostIds.includes(EXPECTED_NEW_POST_ID)) {
    failures.push(
      `Post '${EXPECTED_NEW_POST_ID}' (Stripe) was incorrectly flagged as a duplicate. ` +
        `It is not present in the Algolia results and must be forwarded for LLM classification.`,
    );
  }

  // Check 6: verify that deduplication by ID alone is not sufficient — the
  // URL-only duplicate must also be caught.
  const urlOnlyDupeCaught = duplicatePostIds.includes(urlOnlyDupeGoogleId);
  if (!urlOnlyDupeCaught) {
    failures.push(
      `Google result with id '${urlOnlyDupeGoogleId}' has a URL that matches an Algolia post ` +
        `(https://news.ycombinator.com/item?id=38742002) but was NOT flagged as a duplicate. ` +
        `Deduplication must also match on HN item URL, not just on post ID.`,
    );
  }

  // Check 7: zero Algolia posts should appear in the newPosts list.
  const algoliaIdSet = new Set(algoliaPosts.map((p) => p.id));
  for (const p of newPosts) {
    if (algoliaIdSet.has(p.id)) {
      failures.push(
        `Algolia post '${p.id}' leaked into the new-candidates list. ` +
          `All posts already found by Algolia must be excluded from re-classification.`,
      );
    }
  }

  if (failures.length > 0) {
    process.stderr.write(`\nFAILED — ${failures.length} check(s) failed:\n\n`);
    for (const f of failures) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.exit(1);
  }

  console.log(
    "\nOK — Google cross-reference correctly identified 3 duplicate post(s) " +
      "(matched by id or URL against Algolia results) and forwarded only 1 " +
      "genuinely new post for LLM classification. No duplicate classification " +
      "calls would be made.",
  );
  process.exit(0);
}

main();
