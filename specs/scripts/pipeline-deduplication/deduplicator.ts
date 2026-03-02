/**
 * Shared deduplication logic for the pipeline.
 * Groups posts about the same service within a 7-day window,
 * keeping the one with the most upvotes.
 */

 export interface ClassifiedPost {
 id: string;
 service: string;
 title: string;
 date: string;
 timestamp: number;
 upvotes: number;
 comments: number;
 summary?: string;
}
 
export function deduplicate(posts: ClassifiedPost[]): ClassifiedPost[] {
 const sorted = [...posts].sort((a, b) => a.timestamp - b.timestamp);

 const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
 const result: ClassifiedPost[] = [];
 const used = new Set<string>();

 for (let i = 0; i < sorted.length; i++) {
 if (used.has(sorted[i].id)) continue;

 const post = sorted[i];
 const group: ClassifiedPost[] = [post];

 for (let j = i + 1; j < sorted.length; j++) {
 const other = sorted[j];
 if (used.has(other.id)) continue;
 if (other.service !== post.service) continue;
 if (other.timestamp - post.timestamp > SEVEN_DAYS_MS) break;

 group.push(other);
 used.add(other.id);
 }

 used.add(post.id);

 const best = group.reduce((a, b) => (a.upvotes >= b.upvotes ? a : b));
 result.push(best);

 if (group.length > 1) {
 console.log(
 `  Grouped ${group.length} posts for ${post.service}`
 );
 }
 }

 return result;
}

export function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error(`FAIL: ${message}`);
 process.exit(1);
 }
}
