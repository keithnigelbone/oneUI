/**
 * Side-effect entry — registers the Tira icon loader for semantic `<Icon name="…">`
 * resolution. Import this once at app startup:
 *
 *   import '@oneui/icons-tira/register';
 */

export { initTiraIcons } from './loader';
import { initTiraIcons } from './loader';

initTiraIcons();
