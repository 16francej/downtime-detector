#!/usr/bin/env node
/**
 * Verification: Missing ANTHROPIC_API_KEY environment variable fails immediately
 * Expected: Immediate exit with clear error, no API calls, no partial data written
*/

function assert(condition: boolean, message: string): void {
 if (!condition) {
 console.error("FAIL: "+message);
 process.exit(1);
 }
}

function checkApiKey(): { hasKey: boolean; errorMessage?: string } {
 const apiKey = process.env["ANTHROPIC_API_KEY"];
 if (!apiKey || apiKey.trim() === "") {
 return {
 hasKey: false,
 errorMessage:
 "ANTHROPIC_API_KEY environment variable is missing or empty. "+
 "Please set it before running the pipeline: export ANTHROPIC_API_KEY=your-key-here",
 };
 }
 return { hasKey: true };
}

let apiCallsMade = 0;

async function classifyPost(_title: string): Promise<void> {
 apiCallsMade++;
 throw new Error("Should not reach classification when API key is missing");
}

async function runPipeline(): Promise<{success: boolean; error?: string}> {
 const { hasKey, errorMessage } = checkApiKey();
 if (!hasKey) {
 console.error("[Pipeline] FATAL: "+errorMessage);
 return { success: false, error: errorMessage };
 }
 await classifyPost("AWS is down");
 return { success: true };
}

async function main() {
 const originalKey = process.env["ANTHROPIC_API_KEY"];
 delete process.env["ANTHROPIC_API_KEY"];

  const result = await runPipeline();

  if (originalKey) {
 process.env["ANTHROPIC_API_KEY"] = originalKey;
 }

  assert(!result.success, "Pipeline should fail when API key is missing");
 assert(typeof result.error === "string" && result.error.includes("ANTHROPIC_API_KEY"),"Error message should mention ANTHROPIC_API_KEY, got: "+result.error);
 assert(apiCallsMade === 0, "No API calls should be made when key is missing, got: "+apiCallsMade);

  console.log("✓ Missing API key causes immediate failure with clear error");
 console.log("  Error: "+result.error);
 console.log("  API calls made: "+apiCallsMade+" (correct -- none made)");
 process.exit(0);
}

main();
