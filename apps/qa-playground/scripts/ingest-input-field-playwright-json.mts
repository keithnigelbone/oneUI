/**
 * Writes `public/qa-reports/input-field-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('input-field');
process.exit(ok ? 0 : 1);
