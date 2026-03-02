/**
 * Verifies that known major incidents are present in the generated data.
 */
import * as fs from "fs";
import * as path from "path";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error("FAIL: " + message);
    process.exit(1);
  }
}

const dataPath = path.join(__dirname, "..", "..", "..", "public", "outages.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

assert(Array.isArray(data), "outages.json should contain an array");
assert(data.length > 0, "outages.json should not be empty");

interface Outage {
  id: string;
  service: string;
  date: string;
  title: string;
  upvotes: number;
}

const outages: Outage[] = data;

function findByServiceAndYear(service: string, year: number): Outage | undefined {
  return outages.find(
    (o) => o.service.toLowerCase().includes(service.toLowerCase()) && o.date.startsWith(String(year))
  );
}

function findByTitlePattern(pattern: RegExp, year: number): Outage | undefined {
  return outages.find(
    (o) => pattern.test(o.title) && o.date.startsWith(String(year))
  );
}

// Facebook BGP 2021 — look for the massive BGP outage, not content moderation actions
const fbBgp = findByTitlePattern(/facebook.*(bgp|dns|instagram|whatsapp)|whatsapp.*(down|outage)|instagram.*(down|outage)/i, 2021)
  || outages.find((o) => o.service === "Facebook" && o.date.startsWith("2021") && o.upvotes > 1000);
assert(fbBgp !== undefined, "Facebook BGP outage (2021) should be present");
console.log(`OK: Facebook 2021 found: "${fbBgp!.title}"`);

// CrowdStrike 2024
const crowdstrike = findByTitlePattern(/crowdstrike/i, 2024);
assert(crowdstrike !== undefined, "CrowdStrike BSOD incident (2024) should be present");
console.log(`OK: CrowdStrike 2024 found: "${crowdstrike!.title}"`);

// AWS S3 2017
const awsS3 = findByTitlePattern(/aws.*s3|s3.*down/i, 2017) || findByServiceAndYear("aws", 2017);
assert(awsS3 !== undefined, "AWS S3 outage (2017) should be present");
console.log(`OK: AWS 2017 found: "${awsS3!.title}"`);

// Dyn DNS 2016
const dynDns = findByTitlePattern(/dyn|ddos.*dns|dns.*ddos/i, 2016) || findByServiceAndYear("dyn", 2016);
assert(dynDns !== undefined, "Dyn DNS DDoS attack (2016) should be present");
console.log(`OK: Dyn 2016 found: "${dynDns!.title}"`);

// Cloudflare WAF 2019
const cfWaf = findByServiceAndYear("cloudflare", 2019);
assert(cfWaf !== undefined, "Cloudflare WAF outage (2019) should be present");
console.log(`OK: Cloudflare 2019 found: "${cfWaf!.title}"`);

// GitLab DB 2017
const gitlabDb = findByTitlePattern(/gitlab/i, 2017);
assert(gitlabDb !== undefined, "GitLab database deletion (2017) should be present");
console.log(`OK: GitLab 2017 found: "${gitlabDb!.title}"`);

console.log("\nAll known major incidents found!");
process.exit(0);
