import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — HN Outage Tracker",
  description: "How the HN Outage Tracker collects, classifies, and presents outage data from Hacker News.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <main className="w-full max-w-[700px] mx-auto px-4 py-8">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] underline decoration-dotted underline-offset-2 transition-colors"
          >
            &larr; Back to tracker
          </Link>
        </nav>

        <h1 className="text-2xl font-bold tracking-tight mb-6">About</h1>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">What is this?</h2>
            <p>
              Downtime Detector tracks famous service outages discussed on Hacker News. It provides
              a historical view of major incidents across tech platforms, based entirely on what
              the HN community found notable enough to discuss and upvote.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Data source</h2>
            <p>
              All data comes from the{" "}
              <a
                href="https://hn.algolia.com/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--foreground)] underline decoration-dotted underline-offset-2"
              >
                HN Algolia Search API
              </a>
              . The pipeline searches for posts containing outage-related keywords
              (outage, down, incident, 503, degraded, disruption, unavailable) with a minimum
              upvote threshold.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Classification pipeline</h2>
            <p className="mb-2">
              Not every HN post containing &quot;down&quot; is about an outage. The pipeline applies
              multi-stage filtering:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                <strong className="text-[var(--foreground)]">Postmortem filter</strong> — removes retrospectives and post-incident analyses
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Show HN filter</strong> — removes product launches
              </li>
              <li>
                <strong className="text-[var(--foreground)]">False positive filter</strong> — catches phrasal verbs like
                &quot;shutting down,&quot; &quot;doubles down,&quot; &quot;cracks down,&quot; stock
                price declines, opinion pieces, and other non-outage uses of &quot;down&quot;
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Active outage matching</strong> — confirms the post describes a real-time service disruption
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Service extraction</strong> — identifies which service is affected
              </li>
              <li>
                <strong className="text-[var(--foreground)]">Deduplication</strong> — groups posts about the same service within a 7-day window, keeping the highest-voted one
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Engagement metric</h2>
            <p>
              The engagement level (high, medium, low) reflects HN community engagement with the
              outage discussion, not the technical severity of the outage itself. It is derived
              from upvote counts: high (&gt;1000), medium (300&ndash;1000), low (&lt;300).
              A minor blip at a popular service may generate more HN engagement than a major
              outage at a less-discussed one.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Limitations</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Keyword-based classification may miss outages described in unusual terms</li>
              <li>Only includes outages discussed on Hacker News — not a comprehensive registry</li>
              <li>Engagement level reflects HN discussion activity, not outage severity or impact</li>
              <li>Some false positives or negatives may remain despite multi-stage filtering</li>
              <li>Service attribution is based on title keywords and may occasionally misidentify the affected service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[var(--foreground)] mb-2">Dataset</h2>
            <p>
              The full dataset is available as JSON for download and analysis:{" "}
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/outages.json`}
                download="outages.json"
                className="text-[var(--foreground)] underline decoration-dotted underline-offset-2"
              >
                outages.json
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
