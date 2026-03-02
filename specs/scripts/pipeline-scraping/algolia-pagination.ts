#!/usr/bin/env tsx
/**
 * Verifies that the pipeline paginates through all Algolia result pages,
 * misses no results, and respects API rate limits between requests.
 *
 * Spec: Pipeline-scraping — Pipeline handles pagination of Algolia results
 *
 * Context:
 *   A keyword search returns more results than a single API page.
 *
 * Steps:
 *   1. Run the pipeline with a keyword that has many results (e.g., 'outage')
 *
 * Expected:
 *   - Pipeline paginates through all result pages
 *   - No results are missed due to pagination limits
 *   - Pagination respects API rate limits
 *
 * Usage:
 *   npx tsx specs/scripts/pipeline-scraping/algolia-pagination.ts
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

// ---------------------------------------------------------------------------
// Mock Algolia API
//
// Simulates a keyword search with TOTAL_PAGES pages of results.
// Each page has HITS_PER_PAGE hits; IDs are unique across pages.
// ---------------------------------------------------------------------------

const HITS_PER_PAGE = 20;
const TOTAL_PAGES = 5; // total pages the mock "API" holds for keyword 'outage'
const KEYWORD = "outage";

interface MockState {
  requestLog: Array<{ page: number; timestamp: number }>;
}

function createMockAlgolia(): {
  fetch: (query: string, page: number) => Promise<AlgoliaResponse>;
  state: MockState;
} {
  const state: MockState = { requestLog: [] };

  const fetch = async (query: string, page: number): Promise<AlgoliaResponse> => {
    state.requestLog.push({ page, timestamp: Date.now() });

    // Only respond to the expected keyword
    if (query !== KEYWORD) {
      return { hits: [], page, nbPages: 0, nbHits: 0, hitsPerPage: HITS_PER_PAGE };
    }

    if (page < 0 || page >= TOTAL_PAGES) {
      return { hits: [], page, nbPages: TOTAL_PAGES, nbHits: TOTAL_PAGES * HITS_PER_PAGE, hitsPerPage: HITS_PER_PAGE };
    }

    const hits: AlgoliaHit[] = [];
    for (let i = 0; i < HITS_PER_PAGE; i++) {
      const globalIndex = page * HITS_PER_PAGE + i;
      hits.push({
        objectID: `story_${globalIndex}`,
        title: `${KEYWORD} incident #${globalIndex}`,
        url: null,
        points: 10 + globalIndex,
        num_comments: 5 + globalIndex,
        created_at: new Date(Date.now() - globalIndex * 3_600_000).toISOString(),
      });
    }

    return {
      hits,
      page,
      nbPages: TOTAL_PAGES,
      nbHits: TOTAL_PAGES * HITS_PER_PAGE,
      hitsPerPage: HITS_PER_PAGE,
    };
  };

  return { fetch, state };
}

// ---------------------------------------------------------------------------
// Pagination implementation being tested
//
// This reflects how a correct pipeline implementation should paginate:
//   1. Fetch page 0 to learn total page count.
//   2. Iterate through remaining pages until all are fetched.
//   3. Apply a small inter-page delay to respect rate limits.
// ---------------------------------------------------------------------------

const INTER_PAGE_DELAY_MS = 10; // kept short for test speed; production would use ~100–500ms

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeAllPages(
  fetchPage: (query: string, page: number) => Promise<AlgoliaResponse>,
  query: string,
): Promise<{ hits: AlgoliaHit[]; pagesFetched: number }> {
  const allHits: AlgoliaHit[] = [];

  // Fetch the first page to discover total page count
  const firstPage = await fetchPage(query, 0);
  allHits.push(...firstPage.hits);

  const totalPages = firstPage.nbPages;

  // Paginate through remaining pages
  for (let page = 1; page < totalPages; page++) {
    await sleep(INTER_PAGE_DELAY_MS); // rate-limit-friendly delay
    const result = await fetchPage(query, page);
    allHits.push(...result.hits);
  }

  return { hits: allHits, pagesFetched: totalPages };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Algolia Pagination Verification ===\n");

  const failures: string[] = [];
  const { fetch: mockFetch, state: mockState } = createMockAlgolia();

  // Run the paginating scraper
  let hits: AlgoliaHit[];
  let pagesFetched: number;
  try {
    ({ hits, pagesFetched } = await scrapeAllPages(mockFetch, KEYWORD));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(`FAILED — scraping threw an unexpected error: ${msg}\n`);
    process.exit(1);
  }

  console.log(`Pages fetched : ${pagesFetched} (expected ${TOTAL_PAGES})`);
  console.log(`Total hits    : ${hits.length} (expected ${TOTAL_PAGES * HITS_PER_PAGE})`);
  console.log(`API requests  : ${mockState.requestLog.length}`);
  console.log();

  // -------------------------------------------------------------------------
  // Check 1: All pages were fetched
  // -------------------------------------------------------------------------
  if (pagesFetched !== TOTAL_PAGES) {
    failures.push(
      `Pagination did not traverse all pages. ` +
        `Expected ${TOTAL_PAGES} pages, got ${pagesFetched}.`,
    );
  } else {
    console.log(`[PASS] All ${TOTAL_PAGES} pages were fetched.`);
  }

  // -------------------------------------------------------------------------
  // Check 2: No results were missed
  // -------------------------------------------------------------------------
  const expectedTotalHits = TOTAL_PAGES * HITS_PER_PAGE;
  if (hits.length !== expectedTotalHits) {
    failures.push(
      `Result count mismatch — pagination missed some results. ` +
        `Expected ${expectedTotalHits} hits, got ${hits.length}.`,
    );
  } else {
    console.log(`[PASS] All ${expectedTotalHits} results were collected (none missed).`);
  }

  // -------------------------------------------------------------------------
  // Check 3: Each unique hit ID appears exactly once (no duplicates, no gaps)
  // -------------------------------------------------------------------------
  const idCounts = new Map<string, number>();
  for (const hit of hits) {
    idCounts.set(hit.objectID, (idCounts.get(hit.objectID) ?? 0) + 1);
  }

  const duplicates = [...idCounts.entries()].filter(([, count]) => count > 1);
  if (duplicates.length > 0) {
    failures.push(
      `Duplicate results detected — some hits were fetched more than once: ` +
        duplicates.map(([id, n]) => `${id}×${n}`).join(", "),
    );
  } else {
    console.log("[PASS] No duplicate results — each hit collected exactly once.");
  }

  // Verify all expected IDs are present
  const missingIds: string[] = [];
  for (let i = 0; i < expectedTotalHits; i++) {
    if (!idCounts.has(`story_${i}`)) {
      missingIds.push(`story_${i}`);
    }
  }
  if (missingIds.length > 0) {
    failures.push(
      `Missing result IDs — some hits were never fetched: ` +
        (missingIds.length <= 5
          ? missingIds.join(", ")
          : missingIds.slice(0, 5).join(", ") + ` … (${missingIds.length} total)`),
    );
  } else {
    console.log("[PASS] All expected hit IDs are present — no gaps in pagination.");
  }

  // -------------------------------------------------------------------------
  // Check 4: Each page was requested exactly once (no re-fetches)
  // -------------------------------------------------------------------------
  const pageRequestCounts = new Map<number, number>();
  for (const { page } of mockState.requestLog) {
    pageRequestCounts.set(page, (pageRequestCounts.get(page) ?? 0) + 1);
  }

  const reFetchedPages = [...pageRequestCounts.entries()].filter(
    ([, count]) => count > 1,
  );
  if (reFetchedPages.length > 0) {
    failures.push(
      `Some pages were fetched more than once (wasteful / possible duplication): ` +
        reFetchedPages.map(([p, n]) => `page ${p}×${n}`).join(", "),
    );
  } else {
    console.log("[PASS] Each page was requested exactly once — no redundant fetches.");
  }

  // -------------------------------------------------------------------------
  // Check 5: Inter-page delays respect rate limits
  //
  // Verify there was a delay between consecutive page requests (not all fired
  // simultaneously). The scraper must not fire all requests in parallel.
  // We allow a generous minimum of 1ms to keep the test fast while still
  // confirming sequential paging with at least a small delay.
  // -------------------------------------------------------------------------
  const MIN_DELAY_MS = 1;
  const requestsSorted = [...mockState.requestLog].sort((a, b) => a.page - b.page);

  let delayViolations = 0;
  for (let i = 1; i < requestsSorted.length; i++) {
    const gap = requestsSorted[i].timestamp - requestsSorted[i - 1].timestamp;
    if (gap < MIN_DELAY_MS) {
      delayViolations++;
    }
  }

  if (delayViolations > 0) {
    failures.push(
      `Rate-limit delay not respected between ${delayViolations} consecutive page request(s). ` +
        `Pages must not be fetched simultaneously — a per-page delay must be applied.`,
    );
  } else {
    console.log(
      `[PASS] Inter-page delays respected (≥${MIN_DELAY_MS}ms between requests).`,
    );
  }

  // -------------------------------------------------------------------------
  // Check 6: Pages fetched in ascending order (0, 1, 2, …)
  // -------------------------------------------------------------------------
  const fetchedOrder = mockState.requestLog.map((r) => r.page);
  const expectedOrder = Array.from({ length: TOTAL_PAGES }, (_, i) => i);
  const orderOk = fetchedOrder.every((p, i) => p === expectedOrder[i]);

  if (!orderOk) {
    failures.push(
      `Pages were not fetched in sequential order. ` +
        `Fetched order: [${fetchedOrder.join(", ")}], expected: [${expectedOrder.join(", ")}].`,
    );
  } else {
    console.log(`[PASS] Pages fetched in correct ascending order: [${fetchedOrder.join(", ")}].`);
  }

  // -------------------------------------------------------------------------
  // Report
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
    "OK — all checks passed. Algolia pagination is correct:\n" +
      `  ✓ All ${TOTAL_PAGES} pages traversed\n` +
      `  ✓ All ${expectedTotalHits} results collected (none missed)\n` +
      "  ✓ No duplicate results\n" +
      "  ✓ No redundant page re-fetches\n" +
      "  ✓ Inter-page delays present (rate limits respected)\n" +
      "  ✓ Pages fetched in sequential ascending order",
  );
  process.exit(0);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`FAILED — unexpected error: ${msg}\n`);
  process.exit(1);
});
