/**
 * Writes `public/qa-reports/selectable-button-summary.json` from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

ingestQaPlaywrightJsonForSlug('selectable-button');
