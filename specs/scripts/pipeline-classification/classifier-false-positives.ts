#!/usr/bin/env node
import { classify, assert } from "./classifier.js";

function main() {
  // ---- Category 1: Executive stepping down ----
  const steppingDownTitles = [
    "Eric Schmidt Stepping Down at Google",
    "Google CEO Steps Down",
    "Twitter CEO is stepping down from his position",
    "AWS VP Stood Down After Internal Review",
  ];

  for (const title of steppingDownTitles) {
    const result = classify({ title });
    assert(
      !result.is_outage,
      `"${title}" should NOT be classified as an outage (stepping down) but got is_outage=true`
    );
  }
  console.log("✓ Rejects executive 'stepping down' titles");

  // ---- Category 2: DMCA / copyright takedowns ----
  const dmcaTitles = [
    "HBO Asks Google to Take Down 'Infringing' VLC",
    "RIAA Takes Down Popular Music Blog",
    "YouTube takes down video critical of government",
    "It's Impossible to Take Down Pirate Sites",
  ];

  for (const title of dmcaTitles) {
    const result = classify({ title });
    assert(
      !result.is_outage,
      `"${title}" should NOT be classified as an outage (DMCA/takedown) but got is_outage=true`
    );
  }
  console.log("✓ Rejects DMCA/copyright takedown titles");

  // ---- Category 3: Stock price drops ----
  const stockTitles = [
    "Nvidia shares are down after report of chip overheating",
    "Facebook shares down 20% in after-hours trading",
    "Google stock down following antitrust ruling",
  ];

  for (const title of stockTitles) {
    const result = classify({ title });
    assert(
      !result.is_outage,
      `"${title}" should NOT be classified as an outage (stock price) but got is_outage=true`
    );
  }
  console.log("✓ Rejects stock price decline titles");

  // ---- Category 4: Product announcements / marketing ----
  const productTitles = [
    "PagerDuty Makes Sure Your Team Knows When A Server Goes Down",
    "Show HN: A new tool to monitor your server uptime",
    "Show HN: StatusPage — beautiful status pages for your app",
  ];

  for (const title of productTitles) {
    const result = classify({ title });
    assert(
      !result.is_outage,
      `"${title}" should NOT be classified as an outage (product/marketing) but got is_outage=true`
    );
  }
  console.log("✓ Rejects product announcement and marketing titles");

  // ---- Category 5: Opinion and discussion posts ----
  const opinionTitles = [
    "Do you feel Google search result quality has gone down?",
    "Twitter Should Shut Me Down",
    "Ask HN: Has the quality of AWS support gone down?",
  ];

  for (const title of opinionTitles) {
    const result = classify({ title });
    assert(
      !result.is_outage,
      `"${title}" should NOT be classified as an outage (opinion/discussion) but got is_outage=true`
    );
  }
  console.log("✓ Rejects opinion and discussion titles");

  // ---- Category 6: Government censorship / protest ----
  const governmentTitles = [
    "China Clamps Down on Web, Pinching Companies Like Google",
    "Websites Slow Down for Net Neutrality Protest",
    "Russia Cracks Down on VPN Usage",
    "Government Shoots Down Proposal for Open Internet",
  ];

  for (const title of governmentTitles) {
    const result = classify({ title });
    assert(
      !result.is_outage,
      `"${title}" should NOT be classified as an outage (government/protest) but got is_outage=true`
    );
  }
  console.log("✓ Rejects government censorship and protest titles");

  // ---- Category 7: Other phrasal "down" false positives ----
  const phrasalDownTitles = [
    "Google Doubles Down on AI Strategy",
    "Facebook Burns Down Its Old Ad System",
    "Microsoft Winds Down Windows Phone Support",
    "Apple Narrows Down Supplier List",
    "The Meme That Brought Down an Empire",
  ];

  for (const title of phrasalDownTitles) {
    const result = classify({ title });
    assert(
      !result.is_outage,
      `"${title}" should NOT be classified as an outage (phrasal down) but got is_outage=true`
    );
  }
  console.log("✓ Rejects other phrasal 'down' false positive titles");

  // ---- Sanity check: Real outages must still be accepted ----
  const realOutageTitles = [
    "GitHub is down",
    "AWS S3 outage affecting multiple services",
    "Cloudflare incident causing widespread issues",
    "Google Cloud experiencing degraded performance",
    "Slack is down again",
  ];

  for (const title of realOutageTitles) {
    const result = classify({ title });
    assert(
      result.is_outage,
      `"${title}" SHOULD be classified as an outage but got is_outage=false (reason: ${result.reason})`
    );
  }
  console.log("✓ Still correctly classifies real outage titles");

  console.log("\n✓ All classifier false positive tests passed");
  process.exit(0);
}

main();
