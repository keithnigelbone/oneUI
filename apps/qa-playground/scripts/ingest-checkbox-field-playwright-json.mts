/**
 * Writes `public/qa-reports/checkbox-field-summary.json` from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

const ok = ingestQaPlaywrightJsonForSlug('checkbox-field');
process.exit(ok ? 0 : 1);
