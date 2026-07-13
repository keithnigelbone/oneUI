/**
 * Writes `public/qa-reports/badge-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('badge');
process.exit(ok ? 0 : 1);
