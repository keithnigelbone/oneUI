/**
 * Ingest one component slug: `node tsx scripts/ingest-playwright-by-slug.mts icon-button`
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const slug = process.argv[2]?.trim();
if (!slug) {
  console.error('Usage: ingest-playwright-by-slug.mts <slug>');
  process.exit(1);
}

const ok = ingestQaPlaywrightJsonForSlug(slug);
process.exit(ok ? 0 : 1);
