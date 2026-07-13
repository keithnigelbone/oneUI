/**
 * Writes `public/qa-reports/bottom-navigation-summary.json` (+ history) from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('bottom-navigation');
process.exit(ok ? 0 : 1);
