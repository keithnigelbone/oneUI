/**
 * Writes `public/qa-reports/button-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('button');
process.exit(ok ? 0 : 1);
