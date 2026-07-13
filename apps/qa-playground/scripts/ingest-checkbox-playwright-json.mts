/**
 * Writes `public/qa-reports/checkbox-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('checkbox');
process.exit(ok ? 0 : 1);
