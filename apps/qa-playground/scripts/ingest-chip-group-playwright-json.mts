/**
 * Writes `public/qa-reports/chip-group-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('chip-group');
process.exit(ok ? 0 : 1);
