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
  service: string;
  date: string;
  title: string;
  summary: string;
}

function main() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as Outage[];

  assert(data.length > 0, "Dataset is empty");

  const titles = data.map((r) => (r.title + " " + r.summary).toLowerCase());
  const services = data.map((r) => r.service.toLowerCase());
  const dates = data.map((r) => r.date);

  // Check for notable outages
  const checks = [
    {
      name: "Dyn DNS attack (2016)",
      found: titles.some(
        (t) => (t.includes("dyn") || t.includes("dns")) && dates.some((d) => d.startsWith("2016"))
      ) || data.some((r) => r.date.startsWith("2016") && (r.title.toLowerCase().includes("dyn") || r.summary.toLowerCase().includes("dyn"))),
    },
    {
      name: "CrowdStrike/Windows BSOD (2024)",
      found: data.some(
        (r) =>
          r.date.startsWith("2024") &&
          (r.title.toLowerCase().includes("crowdstrike") ||
            r.summary.toLowerCase().includes("crowdstrike") ||
            r.title.toLowerCase().includes("bsod") ||
            r.summary.toLowerCase().includes("blue screen"))
      ),
    },
    {
      name: "Atlassian outage (2022)",
      found: data.some(
        (r) =>
          r.date.startsWith("2022") &&
          (r.service.toLowerCase() === "atlassian" ||
            r.title.toLowerCase().includes("atlassian") ||
            r.summary.toLowerCase().includes("atlassian"))
      ),
    },
    {
      name: "Let's Encrypt / certificate issue (2021)",
      found: data.some(
        (r) =>
          (r.title.toLowerCase().includes("let's encrypt") ||
            r.title.toLowerCase().includes("letsencrypt") ||
            r.title.toLowerCase().includes("certificate") ||
            r.summary.toLowerCase().includes("let's encrypt") ||
            r.summary.toLowerCase().includes("certificate expir"))
      ),
    },
  ];

  const found = checks.filter((c) => c.found);
  const missing = checks.filter((c) => !c.found);

  assert(
    found.length >= 3,
    `Only ${found.length}/4 notable outages found. Missing: ${missing.map((c) => c.name).join(", ")}`
  );

  console.log(
    `✓ ${found.length}/4 notable outages present: ${found.map((c) => c.name).join(", ")}`
  );
  if (missing.length > 0) {
    console.log(`  Note: missing ${missing.map((c) => c.name).join(", ")}`);
  }
  process.exit(0);
}

main();
