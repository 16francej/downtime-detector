# Downtime Detector

A historical tracker of famous service outages discussed on [Hacker News](https://news.ycombinator.com). Browse, filter, and explore major incidents across tech platforms from 2006 to present.

Live at: https://16francej.github.io/downtime-detector

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data source

All data comes from the [HN Algolia Search API](https://hn.algolia.com/api). The pipeline searches for outage-related keywords, classifies posts using pattern matching, deduplicates within 7-day windows per service, and generates summaries via Claude.

## Regenerate data

Requires an Anthropic API key for LLM-generated summaries:

```bash
ANTHROPIC_API_KEY=sk-... npm run generate-data
```

Use `--skip-summaries` to run without an API key (uses fallback summaries), or `--dry-run` to preview without writing files. See `scripts/generate-data.ts` for all flags.

## Tech stack

- [Next.js](https://nextjs.org) 16 / React 19
- [Tailwind CSS](https://tailwindcss.com) v4
- TypeScript 5
- Claude (Haiku) for summary generation

## License

MIT
