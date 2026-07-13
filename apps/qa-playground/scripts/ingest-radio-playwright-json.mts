/**
 * Writes `public/qa-reports/radio-summary.json` from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

ingestQaPlaywrightJsonForSlug('radio');
