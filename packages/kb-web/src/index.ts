/**
 * @jds/kb-web — Web (React + CSS Modules) knowledge base.
 *
 * JSON artefacts emitted by `scripts/generate-json.mjs` at build time.
 */

export { JDSButton } from './components/JDSButton';
export { JDSSurface } from './components/JDSSurface';
export { JDSText } from './components/JDSText';
export { JDSIcon } from './components/JDSIcon';
export { JDSCard } from './components/JDSCard';
export { JDSBottomNav } from './components/JDSBottomNav';
export { JDSTabBarItem } from './components/JDSTabBarItem';
export { JDSSearchBar } from './components/JDSSearchBar';
export { JDSInput } from './components/JDSInput';
export { JDSBanner } from './components/JDSBanner';

export { defineComponent, type WebComponentMeta, type WebRenderHints } from './defineComponent';

import { JDSButton } from './components/JDSButton';
import { JDSSurface } from './components/JDSSurface';
import { JDSText } from './components/JDSText';
import { JDSIcon } from './components/JDSIcon';
import { JDSCard } from './components/JDSCard';
import { JDSBottomNav } from './components/JDSBottomNav';
import { JDSTabBarItem } from './components/JDSTabBarItem';
import { JDSSearchBar } from './components/JDSSearchBar';
import { JDSInput } from './components/JDSInput';
import { JDSBanner } from './components/JDSBanner';

export const ALL_COMPONENTS = [
  JDSButton,
  JDSSurface,
  JDSText,
  JDSIcon,
  JDSCard,
  JDSBottomNav,
  JDSTabBarItem,
  JDSSearchBar,
  JDSInput,
  JDSBanner,
] as const;
