/**
 * Shared classification logic simulating LLM-based outage classification.
 */

export interface ClassificationResult {
  is_outage: boolean;
  service?: string;
  summary?: string;
  reason?: string;
}

export interface HNPost {
  title: string;
  url?: string;
  upvotes?: number;
  comments?: number;
}

const POSTMORTEM_PATTERNS = [
  /\bpostmortem\b/i,
  /\bpost-mortem\b/i,
  /\bpost mortem\b/i,
  /\bwhat caused\b/i,
  /\bwhy (did|was)\b/i,
  /\broot cause\b/i,
  /\bincident report\b/i,
  /\bretrospective\b/i,
];

const RETROSPECTIVE_PATTERNS = [
  /\bhistory of\b/i,
  /\blook back\b/i,
  /\byears of\b/i,
  /\bmost famous\b/i,
  /\bworst outages\b/i,
  /\bbiggest outages\b/i,
  /\blist of\b/i,
  /\bhere'?s what happened\b/i,
  /\blessons learned\b/i,
  /\bwhat we learned\b/i,
];

const FALSE_POSITIVE_PATTERNS = [
  /\bshutting down\b/i,
  /\bshuts down\b/i,
  /\bshut down\b(?!.*\b(outage|incident|offline|unavailable)\b)/i,
  /\bdoubles? down\b/i,
  /\btriples? down\b/i,
  /\bturned down\b/i,
  /\bturns? down\b/i,
  /\bstepp?(s|ing)? down\b/i,
  /\bstood down\b/i,
  /\bcracks? down\b/i,
  /\bcrack(ing|ed) down\b/i,
  /\bmark(s|ed)? down\b/i,
  /\bnarrow(s|ed|ing)? down\b/i,
  /\bwind(s|ing)? down\b/i,
  /\bslowing? down\b/i,
  /\bburn(s|ed|ing)? down\b/i,
  /\blet(ting)? down\b/i,
  /\bbroke(n)? down\b/i,
  /\bbreak(s|ing)? down\b/i,
  /\bboil(s|ed|ing)? down\b/i,
  /\bcount(s|ed|ing)? down\b/i,
  /\bcool(s|ed|ing)? down\b/i,
  /\bpin(s|ned|ning)? down\b/i,
  /\btear(s|ing)? down\b/i,
  /\btrack(s|ed|ing)? down\b/i,
  /\bwater(s|ed|ing)? down\b/i,
  /\bwritten? down\b/i,
  /\bwrit(es?|ing)? down\b/i,
  /\bcut(s|ting)? down\b/i,
  /\bpull(s|ed|ing)? down\b/i,
  /\bruns? down\b/i,
  /\blay(s|ing)? down\b/i,
  /\blaid down\b/i,
  /\bhands? down\b/i,
  /\bupside down\b/i,
  /\bcalm(s|ed|ing)? down\b/i,
  /\bsettle(s|d)? down\b/i,
  /\bhunt(s|ed|ing)? down\b/i,
  /\block(s|ed|ing)? down\b/i,
  /\bnail(s|ed|ing)? down\b/i,
  /\btoned? down\b/i,
  /\bbow(s|ed|ing)? down\b/i,
  /\bcome(s|ing)? down to\b/i,
  /\bshares? (are |is )?down\b/i,
  /\bstock.* down\b/i,
  /\b(gone|quality.*) down\b/i,
  /\bshould shut .* down\b/i,
  /\btouche?s? down\b/i,
  /\bslow(s|ing|ed)? down for\b/i,
  /\bclamps? down\b/i,
  /\bshoots? down\b/i,
  /\bdials? down\b/i,
  /\bbrought down\b.*\b(empire|meme)\b/i,
  /\bimpossible to take down\b/i,
  /\bmakes? sure.*goes? down\b/i,
  /\b(turned?|turn) me down\b/i,
  /\btakes? down\b/i,
];

const SHOW_HN_PRODUCT_PATTERNS = [
  /^show hn:/i,
  /^ask hn:/i,
  /^tell hn:/i,
];

const SERVICE_MAP: Record<string, string> = {
  "aws s3": "AWS S3",
  "amazon s3": "AWS S3",
  "amazon ec2": "AWS EC2",
  "amazon web services": "AWS",
  "amazon cloudfront": "AWS CloudFront",
  aws: "AWS",
  cloudflare: "Cloudflare",
  github: "GitHub",
  "google cloud": "Google Cloud",
  "google workspace": "Google Workspace",
  gmail: "Google",
  youtube: "Google",
  google: "Google",
  facebook: "Facebook",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  twitter: "Twitter",
  slack: "Slack",
  azure: "Azure",
  "microsoft azure": "Azure",
  discord: "Discord",
  reddit: "Reddit",
  npm: "npm",
  vercel: "Vercel",
  stripe: "Stripe",
  openai: "OpenAI",
  chatgpt: "OpenAI",
  shopify: "Shopify",
  twitch: "Twitch",
  docker: "Docker",
  pagerduty: "PagerDuty",
  zoom: "Zoom",
  salesforce: "Salesforce",
  heroku: "Heroku",
  fastly: "Fastly",
  gitlab: "GitLab",
  crowdstrike: "CrowdStrike",
  dyn: "Dyn",
  "dyn dns": "Dyn",
  "let's encrypt": "Let's Encrypt",
  letsencrypt: "Let's Encrypt",
  atlassian: "Atlassian",
  jira: "Atlassian",
  confluence: "Atlassian",
};

export function extractService(title: string): string {
  const lower = title.toLowerCase();
  const keys = Object.keys(SERVICE_MAP).sort((a, b) => b.length - a.length);

  // Find all matching services and their first position in the title
  const matches: Array<{ key: string; position: number }> = [];
  for (const key of keys) {
    const pos = lower.indexOf(key);
    if (pos !== -1) {
      matches.push({ key, position: pos });
    }
  }

  if (matches.length === 0) return "Unknown Service";

  // Return the service that appears first in the title (root cause)
  // When two matches start at the same position, prefer the longer one (more specific)
  matches.sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return b.key.length - a.key.length;
  });

  return SERVICE_MAP[matches[0].key];
}

export function isShowHnProduct(title: string): boolean {
  if (!SHOW_HN_PRODUCT_PATTERNS.some((p) => p.test(title))) return false;
  const lower = title.toLowerCase();
  const outageKeywords = ["is down", "outage", "down", "incident", "503", "degraded"];
  return !outageKeywords.some((kw) => lower.includes(kw));
}

export function classify(post: HNPost): ClassificationResult {
  const { title } = post;

  if (POSTMORTEM_PATTERNS.some((p) => p.test(title))) {
    return {
      is_outage: false,
      reason: "Post appears to be a postmortem or retrospective analysis, not an active outage",
    };
  }

  if (RETROSPECTIVE_PATTERNS.some((p) => p.test(title))) {
    return {
      is_outage: false,
      reason: "Post appears to be a historical overview or retrospective, not an active outage",
    };
  }

  if (isShowHnProduct(title)) {
    return {
      is_outage: false,
      reason: "Post appears to be a Show HN product launch, not an outage report",
    };
  }

  const activeOutagePatterns = [
    /\bis (down|offline|unavailable)\b/i,
    /\boutage\b/i,
    /\bdown\b.*\b(again|now|currently)\b/i,
    /\bincident\b/i,
    /\b503\b/,
    /\bdegraded\b/i,
    /\bnot (working|available)\b/i,
    /\bservice disruption\b/i,
    /\b(site|service|api|server)s? (is |are )?(down|offline)\b/i,
    /\bexperiencing (issues|problems|errors|disruption|degradation|outage)\b/i,
    /\bconnectivity issues\b/i,
    /\berror rates?\b/i,
    /\bwent (down|offline|dark)\b/i,
  ];

  const hasActiveOutage = activeOutagePatterns.some((p) => p.test(title));

  // Strong outage signals that override false-positive "down" patterns
  const strongOutageSignals = [
    /\boutage\b/i,
    /\bincident\b/i,
    /\b503\b/,
    /\bdegraded\b/i,
    /\bservice disruption\b/i,
    /\bis (down|offline|unavailable)\b/i,
    /\bwent (down|offline|dark)\b/i,
  ];
  const hasStrongSignal = strongOutageSignals.some((p) => p.test(title));

  // Only apply false-positive filter when there's no strong outage signal
  if (!hasStrongSignal && FALSE_POSITIVE_PATTERNS.some((p) => p.test(title))) {
    return {
      is_outage: false,
      reason: "Post contains a false-positive 'down' pattern (e.g. shutting down, doubles down)",
    };
  }

  if (!hasActiveOutage) {
    const simpleDown = /\b\w+\s+(is\s+)?down\b/i.test(title);
    if (!simpleDown) {
      return {
        is_outage: false,
        reason: "No active outage keywords detected in post title",
      };
    }
  }

  const service = extractService(title);
  const summary = service + " experienced a service outage. " + title;

  return {
    is_outage: true,
    service,
    summary,
  };
}

export function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error("FAIL: " + message);
    process.exit(1);
  }
}
