#!/usr/bin/env tsx
/**
 * HN Outage Data Generation Pipeline
 *
 * Queries the HN Algolia Search API to find all outage/downtime posts,
 * classifies them, deduplicates, generates summaries via Claude, and
 * outputs data files that become the source of truth.
 *
 * Usage:
 *   npx tsx scripts/generate-data.ts [flags]
 *
 * Flags:
 *   --dry-run          Log what would be processed, skip LLM + file writes
 *   --skip-summaries   Use fallback summaries, skip Claude API
 *   --no-cache         Always fetch fresh from Algolia
 *   --min-upvotes N    Override threshold (default: 50)
 *   --verbose          Detailed per-stage logging
 */

import * as fs from "fs";
import * as path from "path";
import { classify, extractService } from "../specs/scripts/pipeline-classification/classifier";
import { deduplicate, type ClassifiedPost } from "../specs/scripts/pipeline-deduplication/deduplicator";

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SKIP_SUMMARIES = args.includes("--skip-summaries");
const NO_CACHE = args.includes("--no-cache");
const VERBOSE = args.includes("--verbose");
const MIN_UPVOTES = (() => {
  const idx = args.indexOf("--min-upvotes");
  if (idx !== -1 && args[idx + 1]) return parseInt(args[idx + 1], 10);
  return 50;
})();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const KEYWORDS = ["outage", "down", "incident", "503", "degraded", "disruption", "unavailable"];
const ALGOLIA_BASE = "https://hn.algolia.com/api/v1/search";
const CACHE_DIR = path.join(__dirname, "cache");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const OUTPUT_JSON = path.join(__dirname, "..", "public", "outages.json");
const OUTPUT_TS = path.join(__dirname, "..", "src", "data", "outages.ts");

// Year ranges for broad keywords to work around Algolia's 1000-result cap
const YEAR_START = 2006;
const YEAR_END = new Date().getFullYear();

interface AlgoliaHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number;
  num_comments: number;
  created_at: string;
  created_at_i: number;
}

interface AlgoliaResponse {
  hits: AlgoliaHit[];
  nbHits: number;
  nbPages: number;
  page: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function log(msg: string) {
  console.log(msg);
}

function verbose(msg: string) {
  if (VERBOSE) console.log(`  [verbose] ${msg}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url);
      if (resp.ok) return resp;
      if (resp.status === 429 || resp.status >= 500) {
        const wait = Math.min(1000 * 2 ** attempt, 30000);
        verbose(`HTTP ${resp.status} on attempt ${attempt}, retrying in ${wait}ms...`);
        await sleep(wait);
        continue;
      }
      throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
    } catch (err: any) {
      if (attempt === retries) throw err;
      const wait = Math.min(1000 * 2 ** attempt, 30000);
      verbose(`Fetch error on attempt ${attempt}: ${err.message}, retrying in ${wait}ms...`);
      await sleep(wait);
    }
  }
  throw new Error("fetchWithRetry: should not reach here");
}

// ---------------------------------------------------------------------------
// Stage 1: Scrape Algolia
// ---------------------------------------------------------------------------
async function scrapeAlgolia(): Promise<Map<string, AlgoliaHit>> {
  log("\n=== Stage 1: Scraping HN Algolia API ===");
  const allHits = new Map<string, AlgoliaHit>();

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  // Keywords that are too broad and need year-based splitting
  const broadKeywords = new Set(["down", "incident"]);

  for (const keyword of KEYWORDS) {
    const cacheFile = path.join(CACHE_DIR, `algolia-${keyword}.json`);
    let hits: AlgoliaHit[] = [];

    // Check cache
    if (!NO_CACHE && fs.existsSync(cacheFile)) {
      const stat = fs.statSync(cacheFile);
      if (Date.now() - stat.mtimeMs < CACHE_TTL_MS) {
        hits = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
        verbose(`Cache hit for "${keyword}": ${hits.length} results`);
        for (const hit of hits) {
          if (!allHits.has(hit.objectID)) allHits.set(hit.objectID, hit);
        }
        continue;
      }
    }

    if (broadKeywords.has(keyword)) {
      // Split broad keywords into yearly ranges
      for (let year = YEAR_START; year <= YEAR_END; year++) {
        const startTs = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
        const endTs = Math.floor(new Date(`${year + 1}-01-01`).getTime() / 1000);
        const url = `${ALGOLIA_BASE}?query=${encodeURIComponent(keyword)}&tags=story&hitsPerPage=1000&numericFilters=points>${MIN_UPVOTES},created_at_i>${startTs},created_at_i<${endTs}`;
        verbose(`Fetching "${keyword}" for year ${year}...`);
        try {
          const resp = await fetchWithRetry(url);
          const data: AlgoliaResponse = await resp.json();
          hits.push(...data.hits);
          verbose(`  -> ${data.hits.length} hits (${data.nbHits} total)`);
        } catch (err: any) {
          console.error(`  Warning: Failed to fetch "${keyword}" year ${year}: ${err.message}`);
        }
        await sleep(200);
      }
    } else {
      // Regular keyword - single fetch with pagination
      let page = 0;
      let totalPages = 1;
      while (page < totalPages) {
        const url = `${ALGOLIA_BASE}?query=${encodeURIComponent(keyword)}&tags=story&hitsPerPage=1000&numericFilters=points>${MIN_UPVOTES}&page=${page}`;
        verbose(`Fetching "${keyword}" page ${page}...`);
        try {
          const resp = await fetchWithRetry(url);
          const data: AlgoliaResponse = await resp.json();
          hits.push(...data.hits);
          totalPages = Math.min(data.nbPages, 5); // cap at 5 pages
          verbose(`  -> ${data.hits.length} hits on page ${page} (${data.nbHits} total, ${data.nbPages} pages)`);
        } catch (err: any) {
          console.error(`  Warning: Failed to fetch "${keyword}" page ${page}: ${err.message}`);
          break;
        }
        page++;
        await sleep(200);
      }
    }

    // Save to cache
    fs.writeFileSync(cacheFile, JSON.stringify(hits, null, 2));
    verbose(`Cached ${hits.length} results for "${keyword}"`);

    for (const hit of hits) {
      if (!allHits.has(hit.objectID)) allHits.set(hit.objectID, hit);
    }

    log(`  "${keyword}": ${hits.length} hits (${allHits.size} unique total)`);
  }

  log(`  Total unique posts: ${allHits.size}`);
  return allHits;
}

// ---------------------------------------------------------------------------
// Stage 2: Classify
// ---------------------------------------------------------------------------
function classifyPosts(hits: Map<string, AlgoliaHit>): ClassifiedPost[] {
  log("\n=== Stage 2: Classifying posts ===");
  const classified: ClassifiedPost[] = [];
  let outageCount = 0;
  let nonOutageCount = 0;
  const unknownServicePosts: string[] = [];

  for (const [objectID, hit] of hits) {
    const result = classify({ title: hit.title, url: hit.url ?? undefined, upvotes: hit.points, comments: hit.num_comments });

    if (!result.is_outage) {
      nonOutageCount++;
      verbose(`  Skipped (${result.reason}): ${hit.title}`);
      continue;
    }

    const service = result.service ?? extractService(hit.title);
    if (service === "Unknown Service") {
      unknownServicePosts.push(hit.title);
      verbose(`  Unknown Service: ${hit.title}`);
      nonOutageCount++;
      continue;
    }

    const date = hit.created_at.split("T")[0]; // ISO date
    classified.push({
      id: objectID,
      service,
      title: hit.title,
      date,
      timestamp: hit.created_at_i * 1000,
      upvotes: hit.points,
      comments: hit.num_comments,
    });
    outageCount++;
  }

  log(`  Classified as outage: ${outageCount}`);
  log(`  Filtered out: ${nonOutageCount}`);
  if (unknownServicePosts.length > 0) {
    log(`  Unknown Service posts (${unknownServicePosts.length}):`);
    for (const title of unknownServicePosts.slice(0, 10)) {
      log(`    - ${title}`);
    }
    if (unknownServicePosts.length > 10) {
      log(`    ... and ${unknownServicePosts.length - 10} more`);
    }
  }

  return classified;
}

// ---------------------------------------------------------------------------
// Stage 3: Deduplicate
// ---------------------------------------------------------------------------
function deduplicatePosts(posts: ClassifiedPost[]): ClassifiedPost[] {
  log("\n=== Stage 3: Deduplicating posts ===");
  const before = posts.length;
  // Run dedup iteratively until stable — the window-anchor approach can leave
  // near-duplicates if a post gets consumed by an earlier group
  let result = deduplicate(posts);
  let pass = 1;
  while (true) {
    const next = deduplicate(result);
    if (next.length === result.length) break;
    verbose(`  Pass ${++pass}: ${result.length} -> ${next.length}`);
    result = next;
  }
  log(`  Before: ${before}, After: ${result.length} (removed ${before - result.length} duplicates)`);
  return result;
}

// ---------------------------------------------------------------------------
// Stage 4: Generate summaries
// ---------------------------------------------------------------------------
interface OutageRecord extends ClassifiedPost {
  url: string;
  hn_url: string;
  summary: string;
  severity: "high" | "medium" | "low";
}

async function generateSummaries(
  posts: ClassifiedPost[],
  hits: Map<string, AlgoliaHit>
): Promise<Array<ClassifiedPost & { summary: string; url: string; hn_url: string }>> {
  log("\n=== Stage 4: Generating summaries ===");

  const results: Array<ClassifiedPost & { summary: string; url: string; hn_url: string }> = [];

  for (const post of posts) {
    const hit = hits.get(post.id);
    const articleUrl = hit?.url || `https://news.ycombinator.com/item?id=${post.id}`;
    const hnUrl = `https://news.ycombinator.com/item?id=${post.id}`;

    results.push({
      ...post,
      url: articleUrl,
      hn_url: hnUrl,
      summary: "", // filled below
    });
  }

  if (SKIP_SUMMARIES || DRY_RUN) {
    log("  Skipping Claude API (using fallback summaries)");
    for (const r of results) {
      r.summary = `${r.service} experienced a service outage. ${r.title}`;
    }
    return results;
  }

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("\nError: ANTHROPIC_API_KEY environment variable is required.");
    console.error("Set it or use --skip-summaries to use fallback summaries.");
    process.exit(1);
  }

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic();

  const BATCH_SIZE = 10;
  let processed = 0;

  for (let i = 0; i < results.length; i += BATCH_SIZE) {
    const batch = results.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (record) => {
      try {
        const resp = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          system: "Write a 1-2 sentence plain text summary of this service outage incident. Be factual and concise. No markdown, no headers, no bullet points — just plain sentences.",
          messages: [
            {
              role: "user",
              content: `Service: ${record.service}\nTitle: ${record.title}\nDate: ${record.date}\nUpvotes: ${record.upvotes}\nComments: ${record.comments}\nURL: ${record.url}`,
            },
          ],
        });
        const text = resp.content[0].type === "text" ? resp.content[0].text : "";
        record.summary = text
          .replace(/^#+\s.*\n+/gm, "")  // strip markdown headers
          .replace(/\n+/g, " ")          // collapse newlines
          .trim()
          .replace(/\s+/g, " ");
      } catch (err: any) {
        verbose(`  Summary failed for "${record.title}": ${err.message}`);
        record.summary = `${record.service} experienced a service outage. ${record.title}`;
      }
    });

    await Promise.all(promises);
    processed += batch.length;
    log(`  Generated ${processed}/${results.length} summaries`);

    if (i + BATCH_SIZE < results.length) {
      await sleep(1000);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Stage 5: Assign severity
// ---------------------------------------------------------------------------
function assignEngagement(upvotes: number): "high" | "medium" | "low" {
  if (upvotes > 1000) return "high";
  if (upvotes > 300) return "medium";
  return "low";
}

function applyEngagement(
  posts: Array<ClassifiedPost & { summary: string; url: string; hn_url: string }>
): OutageRecord[] {
  log("\n=== Stage 5: Assigning engagement ===");
  const counts = { high: 0, medium: 0, low: 0 };
  const results: OutageRecord[] = posts.map((p) => {
    const severity = assignEngagement(p.upvotes);
    counts[severity]++;
    return { ...p, severity };
  });
  log(`  high: ${counts.high}, medium: ${counts.medium}, low: ${counts.low}`);
  return results;
}

// ---------------------------------------------------------------------------
// Stage 6: Generate IDs
// ---------------------------------------------------------------------------
function generateIds(posts: OutageRecord[]): OutageRecord[] {
  log("\n=== Stage 6: Generating IDs ===");
  const idCounts = new Map<string, number>();

  for (const post of posts) {
    const year = post.date.split("-")[0];
    const base = `${slugify(post.service)}-${year}`;
    const count = (idCounts.get(base) || 0) + 1;
    idCounts.set(base, count);
    post.id = count === 1 ? base : `${base}-${count}`;
  }

  verbose(`  Generated ${posts.length} IDs`);
  return posts;
}

// ---------------------------------------------------------------------------
// Stage 7: Write output
// ---------------------------------------------------------------------------
function writeOutput(posts: OutageRecord[]): void {
  log("\n=== Stage 7: Writing output ===");

  // Sort by date ascending
  posts.sort((a, b) => a.timestamp - b.timestamp);

  if (DRY_RUN) {
    log("  [dry-run] Would write the following files:");
    log(`  [dry-run] ${OUTPUT_JSON} (${posts.length} records)`);
    log(`  [dry-run] ${OUTPUT_TS} (${posts.length} records)`);
    log("\n  Sample records:");
    for (const p of posts.slice(0, 5)) {
      log(`    ${p.id}: ${p.service} - ${p.title} (${p.severity}, ${p.upvotes} pts)`);
    }
    return;
  }

  // JSON output for public/outages.json
  const jsonRecords = posts.map((p) => ({
    id: p.id,
    service: p.service,
    date: p.date,
    title: p.title.trim().replace(/\s+/g, " "),
    url: p.url,
    hn_url: p.hn_url,
    upvotes: p.upvotes,
    comments: p.comments,
    summary: p.summary,
    timestamp: p.timestamp,
    severity: p.severity,
  }));

  const jsonTmp = OUTPUT_JSON + ".tmp";
  fs.writeFileSync(jsonTmp, JSON.stringify(jsonRecords, null, 2) + "\n");
  fs.renameSync(jsonTmp, OUTPUT_JSON);
  log(`  Wrote ${OUTPUT_JSON} (${posts.length} records)`);

  // TypeScript output for src/data/outages.ts
  const tsContent = `export interface Outage {
  id: string;
  service: string;
  date: string;
  title: string;
  url: string;
  hn_url: string;
  upvotes: number;
  comments: number;
  summary: string;
  timestamp: number;
  severity: "high" | "medium" | "low";
}

export const outages: Outage[] = ${JSON.stringify(jsonRecords, null, 2)};
`;

  const tsTmp = OUTPUT_TS + ".tmp";
  fs.writeFileSync(tsTmp, tsContent);
  fs.renameSync(tsTmp, OUTPUT_TS);
  log(`  Wrote ${OUTPUT_TS} (${posts.length} records)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  log("HN Outage Data Generation Pipeline");
  log("===================================");
  log(`Flags: dry-run=${DRY_RUN}, skip-summaries=${SKIP_SUMMARIES}, no-cache=${NO_CACHE}, min-upvotes=${MIN_UPVOTES}, verbose=${VERBOSE}`);

  // Stage 1: Scrape
  const allHits = await scrapeAlgolia();

  // Stage 2: Classify
  const classified = classifyPosts(allHits);

  // Stage 3: Deduplicate
  const deduped = deduplicatePosts(classified);

  // Stage 4: Generate summaries
  const withSummaries = await generateSummaries(deduped, allHits);

  // Stage 5: Assign engagement
  const withSeverity = applyEngagement(withSummaries);

  // Stage 6: Generate IDs
  const withIds = generateIds(withSeverity);

  // Stage 7: Write output
  writeOutput(withIds);

  log("\n=== Done! ===");
  log(`Total outages: ${withIds.length}`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
