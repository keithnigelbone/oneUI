/**
 * Writes `public/qa-reports/circular-progress-indicator-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('circular-progress-indicator');
process.exit(ok ? 0 : 1);
