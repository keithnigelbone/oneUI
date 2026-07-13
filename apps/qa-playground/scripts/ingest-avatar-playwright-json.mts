/**
 * Writes `public/qa-reports/avatar-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('avatar');
process.exit(ok ? 0 : 1);
