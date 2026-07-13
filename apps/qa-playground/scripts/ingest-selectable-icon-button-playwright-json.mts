/**
 * Writes `public/qa-reports/selectable-icon-button-summary.json` from Playwright JSON + axe artefact.
 */
import { ingestQaPlaywrightJsonForSlug } from './lib/ingestQaPlaywrightJson.mts';

ingestQaPlaywrightJsonForSlug('selectable-icon-button');
