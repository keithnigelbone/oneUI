/**
 * Writes `public/qa-reports/selectable-single-text-button-summary.json` from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

ingestQaPlaywrightJsonForSlug('selectable-single-text-button');
