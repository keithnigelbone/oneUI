/**
 * Writes `public/qa-reports/pagination-summary.json` from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

ingestQaPlaywrightJsonForSlug('pagination');
