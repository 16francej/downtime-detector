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

// Known false positive patterns — titles that contain "down" but are not outages
const FALSE_POSITIVE_PATTERNS: { pattern: RegExp; category: string }[] = [
  // Executive/personnel changes
  { pattern: /\bsteps? down\b/i, category: "executive stepping down" },
  { pattern: /\bstood down\b/i, category: "executive stepping down" },
  { pattern: /\bstepping down\b/i, category: "executive stepping down" },

  // Business closures (not outages)
  { pattern: /\bshutting down\b/i, category: "business shutting down" },
  { pattern: /\bshuts down\b/i, category: "business shutting down" },

  // Phrasal "down" that isn't an outage
  { pattern: /\bdoubles? down\b/i, category: "doubles down idiom" },
  { pattern: /\btriples? down\b/i, category: "triples down idiom" },
  { pattern: /\bcracks? down\b/i, category: "crackdown" },
  { pattern: /\bcrack(ing|ed) down\b/i, category: "crackdown" },
  { pattern: /\bclamps? down\b/i, category: "government clampdown" },

  // Stock/financial
  { pattern: /\bshares? (are |is )?down\b/i, category: "stock price decline" },
  { pattern: /\bstock.* down\b/i, category: "stock price decline" },

  // DMCA/legal takedowns (without outage context)
  {
    pattern: /\btakes? down\b(?!.*\b(outage|incident|offline|unavailable|is down|went down)\b)/i,
    category: "DMCA/legal takedown",
  },

  // Marketing/product launches
  { pattern: /\bmakes? sure.*goes? down\b/i, category: "product marketing" },

  // Opinion/discussion
  { pattern: /\b(gone|quality.*) down\b/i, category: "opinion/quality discussion" },
  { pattern: /\bshould shut .* down\b/i, category: "opinion piece" },

  // Protest/political
  { pattern: /\bslow(s|ing|ed)? down for\b/i, category: "protest slowdown" },

  // Other phrasal "down"
  { pattern: /\bturned? down\b/i, category: "rejection/turned down" },
  { pattern: /\bturns? down\b/i, category: "rejection/turned down" },
  { pattern: /\bmark(s|ed)? down\b/i, category: "markdown/price reduction" },
  { pattern: /\bnarrow(s|ed|ing)? down\b/i, category: "narrowing down" },
  { pattern: /\bwind(s|ing)? down\b/i, category: "winding down" },
  { pattern: /\bburn(s|ed|ing)? down\b/i, category: "burn down" },
  { pattern: /\blet(ting)? down\b/i, category: "letting down" },
  { pattern: /\bboil(s|ed|ing)? down\b/i, category: "boils down" },
  { pattern: /\bcount(s|ed|ing)? down\b/i, category: "countdown" },
  { pattern: /\bcool(s|ed|ing)? down\b/i, category: "cooling down" },
  { pattern: /\btear(s|ing)? down\b/i, category: "teardown" },
  { pattern: /\bwater(s|ed|ing)? down\b/i, category: "watered down" },
  { pattern: /\bupside down\b/i, category: "upside down" },
  { pattern: /\bhands? down\b/i, category: "hands down idiom" },
  { pattern: /\bbow(s|ed|ing)? down\b/i, category: "bowing down" },
  { pattern: /\bcome(s|ing)? down to\b/i, category: "comes down to" },
  { pattern: /\bshoots? down\b/i, category: "shoots down" },
  { pattern: /\bdials? down\b/i, category: "dials down" },
  { pattern: /\bbrought down\b.*\b(empire|meme)\b/i, category: "brought down (metaphorical)" },
  { pattern: /\bimpossible to take down\b/i, category: "impossible to take down" },
];

// Also check for Show HN / Ask HN product posts (not outage reports)
const SHOW_HN_PATTERNS = [
  { pattern: /^show hn:/i, category: "Show HN product post" },
  { pattern: /^ask hn:.*\b(quality|opinion|feel|think)\b/i, category: "Ask HN discussion" },
];

// Strong outage signals that override false-positive patterns (same as classifier)
const STRONG_SIGNALS = [
  /\boutage\b/i,
  /\bincident\b/i,
  /\b503\b/,
  /\bdegraded\b/i,
  /\bservice disruption\b/i,
  /\bis (down|offline|unavailable)\b/i,
  /\bwent (down|offline|dark)\b/i,
];

function main() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as {
    title: string;
    service: string;
    id: string;
  }[];

  const errors: string[] = [];

  for (let i = 0; i < data.length; i++) {
    const r = data[i];

    // Skip false-positive check if the title has a strong outage signal
    const hasStrongSignal = STRONG_SIGNALS.some((p) => p.test(r.title));
    if (hasStrongSignal) continue;

    for (const fp of FALSE_POSITIVE_PATTERNS) {
      if (fp.pattern.test(r.title)) {
        errors.push(
          `Record[${i}] (${r.service}, id="${r.id}"): title matches false positive "${fp.category}" — "${r.title}"`
        );
        break; // Only report first match per record
      }
    }

    for (const fp of SHOW_HN_PATTERNS) {
      if (fp.pattern.test(r.title)) {
        errors.push(
          `Record[${i}] (${r.service}, id="${r.id}"): title matches false positive "${fp.category}" — "${r.title}"`
        );
        break;
      }
    }
  }

  assert(
    errors.length === 0,
    `Found ${errors.length} false positive records:\n${errors.join("\n")}`
  );

  console.log(`✓ All ${data.length} records pass false positive checks — no non-outage entries detected`);
  process.exit(0);
}

main();
