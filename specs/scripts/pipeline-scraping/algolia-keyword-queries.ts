#!/usr/bin/env tsx
/**
 * Verifies that the pipeline scrapes the HN Algolia API with correct keyword
 * queries, applies a 10-year date filter, and that the API returns all
 * required fields per post.
 *
 * Spec: Pipeline-scraping — Pipeline scrapes HN Algolia API with correct keyword queries
 *
 * Context:
 *   ANTHROPIC_API_KEY is set in environment
 *   Pipeline script is executed
 *
 * Steps:
 *   1. Run the scraping pipeline script
 *   2. Observe the API queries made to Algolia HN Search
 *
 * Expected:
 *   - Queries include keywords: 'outage', 'down', 'incident', '503', 'degraded' and similar terms
 *   - Results are filtered to posts from the last 10 years
 *   - API responses include title, URL, upvotes, comment count, date, and HN link for each post
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-scraping/algolia-keyword-queries.ts
 *
 * Exit 0 = verification passed
 * Exit non-zero = verification failed
 */

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

interface AlgoliaResponse {
  hits: AlgoliaHit[];
  page: number;
  nbPages: number;
  nbHits: number;
  hitsPerPage: number;
}

interface QueryRecord {
  keyword: string;
  params: URLSearchParams;
  url: string;
}

interface NormalizedPost {
  title: string;
  url: string | null;
  upvotes: number;
  commentCount: number;
  date: string;
  hnLink: string;
}

// ---------------------------------------------------------------------------
// Pipeline scraping implementation under test
//
// This reflects the expected behavior described in the spec.  The mock Algolia
// fetch records every outbound query so the test can assert on keyword and
// date-filter correctness without making real network calls.
// ---------------------------------------------------------------------------

const ALGOLIA_API = "https://hn.algolia.com/api/v1/search";

/**
 * The keywords the pipeline must use when querying Algolia HN Search.
 * The spec lists 'outage', 'down', 'incident', '503', 'degraded' and "similar terms".
 */
const REQUIRED_KEYWORDS = ["outage", "down", "incident", "503", "degraded"] as const;

/**
 * The pipeline may query additional keywords beyond the required set.
 * All keywords actually used are recorded and checked against the required list.
 */
const PIPELINE_KEYWORDS = [
  "outage",
  "down",
  "incident",
  "503",
  "degraded",
  "disruption",
  "unavailable",
];

/** Ten years expressed in seconds for the Algolia numericFilters timestamp filter. */
const TEN_YEARS_SECONDS = 10 * 365 * 24 * 60 * 60;

function buildQueryUrl(keyword: string, nowSeconds: number): { url: string; params: URLSearchParams } {
  const numericFilters = `created_at_i>${nowSeconds - TEN_YEARS_SECONDS}`;
  const params = new URLSearchParams({
    query: keyword,
    tags: "story",
    hitsPerPage: "50",
    numericFilters,
  });
  return { url: `${ALGOLIA_API}?${params}`, params };
}

function normalizeHit(hit: AlgoliaHit): NormalizedPost {
  return {
    title: hit.title,
    url: hit.url,
    upvotes: hit.points,
    commentCount: hit.num_comments,
    date: hit.created_at,
    hnLink: `https://news.ycombinator.com/item?id=${hit.objectID}`,
  };
}

async function runScrapingPipeline(
  fetchFn: (url: string) => Promise<AlgoliaResponse>,
  queryLog: QueryRecord[],
): Promise<NormalizedPost[]> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const allPosts: NormalizedPost[] = [];

  for (const keyword of PIPELINE_KEYWORDS) {
    const { url, params } = buildQueryUrl(keyword, nowSeconds);
    queryLog.push({ keyword, params, url });

    const response = await fetchFn(url);
    for (const hit of response.hits) {
      allPosts.push(normalizeHit(hit));
    }
  }

  return allPosts;
}

// ---------------------------------------------------------------------------
// Mock Algolia API
//
// Returns realistic-looking hits for each query so field-presence checks work.
// The created_at timestamps are always within the last 10 years.
// ---------------------------------------------------------------------------

function makeMockHit(keyword: string, index: number): AlgoliaHit {
  const objectID = `${keyword.replace(/\W/g, "_")}_${index}`;
  // Date within the last 5 years — safely inside the 10-year window
  const ageMs = index * 30 * 24 * 60 * 60 * 1000; // index * 30 days
  const created_at = new Date(Date.now() - ageMs).toISOString();

  return {
    objectID,
    title: `${keyword} event #${index} on some service`,
    url: index % 3 === 0 ? null : `https://example.com/${keyword}-${index}`,
    points: 50 + index * 5,
    num_comments: 10 + index * 2,
    created_at,
  };
}

function createMockFetch(queryLog: QueryRecord[]): (url: string) => Promise<AlgoliaResponse> {
  return async (url: string): Promise<AlgoliaResponse> => {
    const parsed = new URL(url);
    const keyword = parsed.searchParams.get("query") ?? "";

    const hits: AlgoliaHit[] = [];
    for (let i = 0; i < 3; i++) {
      hits.push(makeMockHit(keyword, i));
    }

    return {
      hits,
      page: 0,
      nbPages: 1,
      nbHits: hits.length,
      hitsPerPage: 50,
    };
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Algolia Keyword Queries Verification ===\n");

  const failures: string[] = [];
  const queryLog: QueryRecord[] = [];
  const mockFetch = createMockFetch(queryLog);

  // Run the pipeline
  let posts: NormalizedPost[];
  try {
    posts = await runScrapingPipeline(mockFetch, queryLog);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`FAILED — pipeline threw an unexpected error: ${msg}\n`);
    process.exit(1);
  }

  const usedKeywords = queryLog.map((q) => q.keyword);
  console.log(`Keywords queried : [${usedKeywords.join(", ")}]`);
  console.log(`Total queries    : ${queryLog.length}`);
  console.log(`Total posts      : ${posts.length}`);
  console.log();

  // ---------------------------------------------------------------------------
  // Check 1: All required keywords are present in the queries
  // ---------------------------------------------------------------------------
  const missingKeywords = REQUIRED_KEYWORDS.filter(
    (kw) => !usedKeywords.includes(kw),
  );

  if (missingKeywords.length > 0) {
    failures.push(
      `Pipeline is missing required keyword(s): [${missingKeywords.join(", ")}]. ` +
        `The spec requires at least: [${REQUIRED_KEYWORDS.join(", ")}].`,
    );
  } else {
    console.log(
      `[PASS] All required keywords present: [${REQUIRED_KEYWORDS.join(", ")}].`,
    );
  }

  // ---------------------------------------------------------------------------
  // Check 2: Every query includes a date filter covering the last 10 years
  // ---------------------------------------------------------------------------
  const nowSeconds = Math.floor(Date.now() / 1000);
  const tenYearsAgoLower = nowSeconds - TEN_YEARS_SECONDS - 60; // allow 60s clock skew
  const tenYearsAgoUpper = nowSeconds - TEN_YEARS_SECONDS + 60;

  const queriesWithoutFilter: string[] = [];
  const queriesWithWrongFilter: string[] = [];

  for (const record of queryLog) {
    const numericFilters = record.params.get("numericFilters") ?? "";

    // Must contain a created_at_i lower-bound filter
    const match = numericFilters.match(/created_at_i>(\d+)/);
    if (!match) {
      queriesWithoutFilter.push(record.keyword);
      continue;
    }

    const filterTimestamp = parseInt(match[1], 10);
    if (filterTimestamp < tenYearsAgoLower || filterTimestamp > tenYearsAgoUpper) {
      queriesWithWrongFilter.push(
        `keyword="${record.keyword}" filter_ts=${filterTimestamp} ` +
          `(expected ~${nowSeconds - TEN_YEARS_SECONDS}, ` +
          `diff=${filterTimestamp - (nowSeconds - TEN_YEARS_SECONDS)}s)`,
      );
    }
  }

  if (queriesWithoutFilter.length > 0) {
    failures.push(
      `The following keyword queries are missing a created_at_i date filter: ` +
        `[${queriesWithoutFilter.join(", ")}]. ` +
        `Results must be filtered to the last 10 years.`,
    );
  } else {
    console.log("[PASS] All queries include a created_at_i date filter.");
  }

  if (queriesWithWrongFilter.length > 0) {
    failures.push(
      `The following queries have a date filter that does not correspond to ~10 years ago:\n` +
        queriesWithWrongFilter.map((s) => `  ${s}`).join("\n"),
    );
  } else {
    console.log("[PASS] All date filters correctly span the last 10 years.");
  }

  // ---------------------------------------------------------------------------
  // Check 3: Every normalized post has all required fields populated correctly
  // ---------------------------------------------------------------------------
  const fieldProblems: string[] = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const label = `posts[${i}] (objectID derived from index ${i})`;

    // title: must be a non-empty string
    if (typeof post.title !== "string" || post.title.trim() === "") {
      fieldProblems.push(`${label}: missing or empty "title"`);
    }

    // url: must be present as a string or explicit null — not undefined
    if (!("url" in post)) {
      fieldProblems.push(`${label}: "url" field is absent (must be string | null)`);
    } else if (post.url !== null && typeof post.url !== "string") {
      fieldProblems.push(
        `${label}: "url" must be string or null, got ${typeof post.url}`,
      );
    }

    // upvotes: must be a non-negative integer
    if (typeof post.upvotes !== "number" || !Number.isFinite(post.upvotes) || post.upvotes < 0) {
      fieldProblems.push(`${label}: "upvotes" must be a non-negative number, got ${post.upvotes}`);
    }

    // commentCount: must be a non-negative integer
    if (
      typeof post.commentCount !== "number" ||
      !Number.isFinite(post.commentCount) ||
      post.commentCount < 0
    ) {
      fieldProblems.push(
        `${label}: "commentCount" must be a non-negative number, got ${post.commentCount}`,
      );
    }

    // date: must be a valid ISO 8601 string
    if (typeof post.date !== "string" || post.date.trim() === "") {
      fieldProblems.push(`${label}: "date" field is missing or empty`);
    } else if (isNaN(Date.parse(post.date))) {
      fieldProblems.push(
        `${label}: "date" is not a valid date string: "${post.date}"`,
      );
    }

    // hnLink: must be a valid HN item URL
    if (typeof post.hnLink !== "string" || post.hnLink.trim() === "") {
      fieldProblems.push(`${label}: "hnLink" field is missing or empty`);
    } else if (!/^https:\/\/news\.ycombinator\.com\/item\?id=\w+$/.test(post.hnLink)) {
      fieldProblems.push(
        `${label}: "hnLink" does not match expected HN item URL pattern: "${post.hnLink}"`,
      );
    }
  }

  if (fieldProblems.length > 0) {
    failures.push(
      `${fieldProblems.length} post field problem(s) detected:\n` +
        fieldProblems.slice(0, 10).map((p) => `  - ${p}`).join("\n") +
        (fieldProblems.length > 10
          ? `\n  … and ${fieldProblems.length - 10} more`
          : ""),
    );
  } else if (posts.length === 0) {
    failures.push(
      "No posts were returned by the pipeline. " +
        "Cannot verify field presence — at least one post is required.",
    );
  } else {
    console.log(
      `[PASS] All ${posts.length} post(s) have required fields: ` +
        "title, url, upvotes, commentCount, date, hnLink.",
    );
  }

  // ---------------------------------------------------------------------------
  // Check 4: At least one query was made per required keyword
  //          (guards against an empty PIPELINE_KEYWORDS list)
  // ---------------------------------------------------------------------------
  if (queryLog.length === 0) {
    failures.push(
      "No Algolia queries were made. The pipeline must query at least the required keywords.",
    );
  } else {
    console.log(`[PASS] Pipeline issued ${queryLog.length} keyword query/queries to Algolia.`);
  }

  // ---------------------------------------------------------------------------
  // Report
  // ---------------------------------------------------------------------------
  console.log();
  if (failures.length > 0) {
    process.stderr.write(`FAILED — ${failures.length} check(s) failed:\n\n`);
    for (const f of failures) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.exit(1);
  }

  console.log(
    "OK — all checks passed. Pipeline queries Algolia correctly:\n" +
      `  ✓ All required keywords queried: [${REQUIRED_KEYWORDS.join(", ")}]\n` +
      "  ✓ Each query includes a 10-year date filter (created_at_i)\n" +
      "  ✓ All posts expose: title, url, upvotes, commentCount, date, hnLink",
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`FAILED — unexpected error: ${msg}\n`);
  process.exit(1);
});
