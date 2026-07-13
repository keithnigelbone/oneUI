/**
 * Writes `public/qa-reports/input-dynamic-text-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('input-dynamic-text');
process.exit(ok ? 0 : 1);
