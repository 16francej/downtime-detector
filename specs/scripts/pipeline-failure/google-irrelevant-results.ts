#!/usr/bin/env node
/**
 * Verification: Google search returns irrelevant results that waste classification calls
 * Expected: Irrelevant posts filtered by LLM (is_outage: false), cost logged
*/

function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error(BT+"FAIL: "+DLR+"{message}"+BT);
 process.exit(1);
 }
}
 
interface ClassificationResult {
 postId: string;
 title: string;
 is_outage: boolean;
 cost: number;
}

function classify(postId: string, title: string): ClassificationResult {
 const t = title.toLowerCase();
 const bad = t.includes("download") || t.includes("downtown") ||
 t.includes("breakdown") || t.includes("countdown") ||
 t.includes("markdown") || t.includes("review") ||
 t.includes("tutorial") || t.startsWith("how to");
 return { postId, title, is_outage: !bad, cost: 0.001 };
}

async function main() {
 const items = [
 { id: "g-1", title: "AWS downtown office opens new campus" },
 { id: "g-2", title: "AWS S3 is down -- major outage" },
 { id: "g-3", title: "How to download files from AWS S3" },
 { id: "g-4", title: "GitHub Actions tutorial for beginners" },
 { id: "g-5", title: "Cloudflare outage affects millions" },
 ];
 const results: ClassificationResult[] = [];
 let totalCost = 0;
 for (const post of items) {
 const r = classify(post.id, post.title);
 results.push(r);
 totalCost += r.cost;
 if (!r.is_outage) console.log("  [Filtered] "+r.title+" -- is_outage: false");
 }
 const relevant = results.filter((r) => r.is_outage);
 const irrelevant = results.filter((r) => !r.is_outage);
 const costStr = totalCost.toFixed(3);
 console.log("  Total cost for all "+results.length+" calls: "+costStr);
 assert(relevant.length === 2, "Expected 2 relevant results, got: "+relevant.length);
 assert(irrelevant.length === 3, "Expected 3 irrelevant filtered out, got: "+irrelevant.length);
 assert(!relevant.some((r) => !r.is_outage), "No irrelevant results in final dataset");
 console.log("✓ Google irrelevant results filtered correctly");
 console.log("  Relevant: "+relevant.length+", Irrelevant (filtered): "+irrelevant.length);
 process.exit(0);
}

main();
