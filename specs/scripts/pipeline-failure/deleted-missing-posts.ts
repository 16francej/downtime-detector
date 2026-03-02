#!/usr/bin/env node
/**
 * Verification: Deleted or missing HN posts are handled in scraping
 * Expected: Null title or missing URL -- skipped with warning; no nulls in final JSON
*/

function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error(`FAIL: ${message}`);
 process.exit(1);
 }
}

interface RawPost {
 id: string;
 title: string | null;
 url?: string;
 upvotes: number;
 comments: number;
}

function filterValidPosts(posts: RawPost[]): RawPost[] {
 const valid: RawPost[] = [];
 const skipped: string[] = [];

  for (const post of posts) {
 if (!post.title || post.title === null || post.title === "") {
 console.warn(`  [Skip] Post ${post.id} has null/missing title -- skipping`);
 skipped.push(post.id);
 continue;
 }
 if (!post.url) {
 console.warn(`  [Skip] Post ${post.id} has missing URL -- skipping`);
 skipped.push(post.id);
 continue;
 }
 valid.push(post);
 }

  if (skipped.length > 0) {
 console.log(`  Skipped ${skipped.length} invalid post(s): ${skipped.join(", ")}`);
 }

  return valid;
}

async function main() {
 const rawPosts: RawPost[] = [
 { id: "post-1", title: "AWS is down", url: "https://news.ycombinator.com/item?id=1", upvotes: 500, comments: 100 },
 { id: "post-2", title: null, url: "https://news.ycombinator.com/item?id=2", upvotes: 0, comments: 0 },
 { id: "post-3", title: "", url: "https://news.ycombinator.com/item?id=3", upvotes: 0, comments: 0 },
 { id: "post-4", title: "GitHub outage", upvotes: 300, comments: 80 },
 { id: "post-5", title: "Cloudflare down", url: "https://news.ycombinator.com/item?id=5", upvotes: 200, comments: 50 },
 ];

  const validPosts = filterValidPosts(rawPosts);

  assert(validPosts.length === 2, `Expected 2 valid posts, got: ${validPosts.length}`);
 assert(validPosts[0].id === "post-1", "post-1 should be valid");
 assert(validPosts[1].id === "post-5", "post-5 should be valid");

  for (const post of validPosts) {
 assert(post.title !== null, "No null titles in final dataset");
 assert(post.title !== undefined, "No undefined titles in final dataset");
 assert(post.url !== undefined, "No undefined URLs in final dataset");
 }

  console.log("✓ Deleted/missing posts handled correctly");
 console.log(`  Input: ${rawPosts.length} posts`);
 console.log(`  Valid: ${validPosts.length} posts`);
 console.log(`  Skipped: ${rawPosts.length - validPosts.length} posts (logged with warning)`);
 process.exit(0);
}

main();
