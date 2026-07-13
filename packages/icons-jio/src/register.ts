/**
 * Side-effect entry — registers the Jio icon loader for semantic `<Icon name="…">`
 * resolution. Import this once at app startup:
 *
 *   import '@oneui/icons-jio/register';
 *
 * For tree-shakeable direct imports, use named exports from the package root:
 *
 *   import { IcCarSide } from '@oneui/icons-jio';
 */

export { initJioIcons } from './loader';
import { initJioIcons } from './loader';

initJioIcons();
