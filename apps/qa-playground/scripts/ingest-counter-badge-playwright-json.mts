/**
 * Writes `public/qa-reports/counter-badge-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('counter-badge');
process.exit(ok ? 0 : 1);
