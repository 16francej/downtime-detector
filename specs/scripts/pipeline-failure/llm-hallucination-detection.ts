#!/usr/bin/env node
/**
 * Verification: LLM hallucinating a service name is detectable
 * GitHub post classified as "GitLab" -> cross-checked and flagged
 */

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

interface Post {
  id: string;
  title: string;
  hn_url: string;
}

interface Classification {
  postId: string;
  service: string;
  is_outage: boolean;
  confidence: number;
  hallucination_detected?: boolean;
  flag?: string;
}

function crossCheckServiceName(post: Post, classification: Classification): Classification {
  const titleLower = post.title.toLowerCase();
  const serviceLower = classification.service.toLowerCase();
  const titleMentionsService = titleLower.includes(serviceLower);
  const urlMentionsService = post.hn_url.toLowerCase().includes(serviceLower);

  if (!titleMentionsService && !urlMentionsService) {
    console.warn(
      `  [Flag] Service "${classification.service}" not found in title/URL for: "${post.title}"`
    );
    return {
      ...classification,
      hallucination_detected: true,
      flag: `Service name "${classification.service}" not mentioned in post title or URL -- possible hallucination`,
    };
  }

  return classification;
}

async function main() {
  const post: Post = {
    id: "github-outage-1",
    title: "GitHub is down -- actions and API unavailable",
    hn_url: "https://news.ycombinator.com/item?id=12345",
  };

  const hallucinatedClassification: Classification = {
    postId: post.id,
    service: "GitLab",
    is_outage: true,
    confidence: 0.7,
  };

  const checked = crossCheckServiceName(post, hallucinatedClassification);

  assert(
    checked.hallucination_detected === true,
    "Hallucination should be detected when service name not in title/URL"
  );
  assert(
    typeof checked.flag === "string" && checked.flag.length > 0,
    "A flag/note should be added for manual review"
  );

  const correctClassification: Classification = {
    postId: post.id,
    service: "GitHub",
    is_outage: true,
    confidence: 0.95,
  };

  const checkedCorrect = crossCheckServiceName(post, correctClassification);
  assert(
    checkedCorrect.hallucination_detected !== true,
    "No hallucination should be detected for correct classification"
  );

  console.log("✓ LLM hallucination detection works");
  console.log(`  Hallucinated service: ${hallucinatedClassification.service}`);
  console.log(`  Detected: ${checked.hallucination_detected}`);
  console.log(`  Flag: ${checked.flag}`);
  console.log("  NOTE: Known limitation -- manual review may be needed for flagged records");
  process.exit(0);
}

main();
