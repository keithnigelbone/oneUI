/**
 * Writes `public/qa-reports/indicator-badge-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('indicator-badge');
process.exit(ok ? 0 : 1);
