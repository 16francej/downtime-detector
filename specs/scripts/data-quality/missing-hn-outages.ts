#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "public", "outages.json");

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

interface Outage {
  id: string;
  service: string;
  date: string;
  title: string;
  hn_url: string;
  upvotes: number;
  comments: number;
  summary: string;
  timestamp: number;
  severity: string;
}

interface HNHit {
  objectID: string;
  title: string;
  points: number;
  num_comments: number;
  created_at: string;
}

interface HNSearchResponse {
  hits: HNHit[];
}

const SEARCH_KEYWORDS = ["outage", "is down", "incident"];
const MIN_POINTS = 1000;

// Title patterns that indicate the post is NOT about a service outage
const NON_OUTAGE_PATTERNS = [
  /shutting down/i,
  /shut down/i,
  /\bclose down\b/i,
  /\bclosing down\b/i,
  /\btaking down\b/i,
  /\bremov(e|ing)\b/i,
  /\bsuspend(ed|ing|s)?\b/i,
  /\bbrain drain\b/i,
  /\bshutdown\b/i,
  /\bPlay Store\b/i,
  /\bgateways?\b/i,
];

// Number of days within which two entries for the same service are considered
// duplicates (covers multiple HN posts about the same outage event)
const DUPLICATE_WINDOW_DAYS = 14;

function extractHNItemId(hnUrl: string): string | null {
  const match = hnUrl.match(/item\?id=(\d+)/);
  return match ? match[1] : null;
}

function isLikelyOutagePost(title: string): boolean {
  return !NON_OUTAGE_PATTERNS.some((pattern) => pattern.test(title));
}

function hasCoveredEvent(
  service: string,
  dateStr: string,
  existingByService: Map<string, string[]>
): boolean {
  const hitDate = new Date(dateStr).getTime();
  const windowMs = DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const dates = existingByService.get(service.toLowerCase());
  if (!dates) return false;
  return dates.some((d) => Math.abs(new Date(d).getTime() - hitDate) <= windowMs);
}

function matchService(title: string, services: string[]): string | null {
  const lower = title.toLowerCase();
  for (const s of services) {
    if (lower.includes(s.toLowerCase())) return s;
  }
  return null;
}

async function searchHN(query: string): Promise<HNHit[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=points>${MIN_POINTS}&hitsPerPage=100`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HN API returned ${res.status} for query "${query}"`);
  }
  const data = (await res.json()) as HNSearchResponse;
  return data.hits;
}

async function main() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as Outage[];
  assert(data.length > 0, "Dataset is empty");

  // Build set of existing HN item IDs
  const existingIds = new Set<string>();
  for (const outage of data) {
    const id = extractHNItemId(outage.hn_url);
    if (id) existingIds.add(id);
  }

  // Build map of existing entries by service → dates for duplicate detection
  const existingByService = new Map<string, string[]>();
  for (const outage of data) {
    const key = outage.service.toLowerCase();
    if (!existingByService.has(key)) existingByService.set(key, []);
    existingByService.get(key)!.push(outage.date);
  }

  // Derive tracked service names from the dataset
  const services = [...new Set(data.map((o) => o.service))];

  // Query HN Algolia API for each keyword
  const missing: { objectID: string; title: string; points: number; query: string }[] = [];
  const seenIds = new Set<string>();
  let apiResultsProcessed = false;

  for (const keyword of SEARCH_KEYWORDS) {
    let hits: HNHit[];
    try {
      hits = await searchHN(keyword);
    } catch (err) {
      console.warn(`⚠ Skipping keyword "${keyword}": ${(err as Error).message}`);
      continue;
    }

    apiResultsProcessed = true;

    for (const hit of hits) {
      // Filter to date range
      const year = new Date(hit.created_at).getFullYear();
      if (year < 2011 || year > 2025) continue;

      // Skip non-outage posts
      if (!isLikelyOutagePost(hit.title)) continue;

      // Must mention a tracked service
      const service = matchService(hit.title, services);
      if (!service) continue;

      // Skip if exact HN item ID already tracked
      if (existingIds.has(hit.objectID)) continue;

      // Skip if we already cover this event (same service, nearby date)
      const hitDate = hit.created_at.slice(0, 10);
      if (hasCoveredEvent(service, hitDate, existingByService)) continue;

      // Deduplicate within results
      if (seenIds.has(hit.objectID)) continue;
      seenIds.add(hit.objectID);

      missing.push({
        objectID: hit.objectID,
        title: hit.title,
        points: hit.points,
        query: keyword,
      });
    }
  }

  if (missing.length === 0) {
    if (!apiResultsProcessed && existingIds.size > 0) {
      console.warn("⚠ No API results processed — HN API may be unreachable. Skipping check.");
      process.exit(0);
    }
    console.log("✓ No missing high-profile HN outage posts found");
    process.exit(0);
  }

  console.error(`Found ${missing.length} high-profile HN outage post(s) missing from dataset:\n`);
  for (const m of missing) {
    console.error(`  - [${m.points} pts] "${m.title}" (https://news.ycombinator.com/item?id=${m.objectID})`);
  }
  process.exit(1);
}

main();
