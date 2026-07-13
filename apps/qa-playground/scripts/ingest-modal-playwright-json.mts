/**
 * Writes `public/qa-reports/modal-summary.json` from Playwright JSON + axe artefact.
 * Uses shared ingest (ANSI strip + plain-English error summaries for the QA playground UI).
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

ingestQaPlaywrightJsonForSlug('modal');
