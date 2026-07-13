/**
 * defineComponent — kb-web's typed chokepoint. Parameterised over
 * RenderHintsWeb + A11yWeb so authors get strict type narrowing.
 */

import type {
  A11yWeb,
  ComponentMetaUniform,
  RenderHintsWeb,
} from '@jds/kb-core';

export type WebRenderHints = RenderHintsWeb & {
  /** Class-naming convention consumers should emit. */
  readonly classNameStrategy: 'css-modules' | 'tailwind' | 'styled-components';
  /** Whether the component is safe to render in the Next.js / RSC server pass. */
  readonly ssrSafe: boolean;
};

export type WebComponentMeta = ComponentMetaUniform<WebRenderHints, A11yWeb>;

export function defineComponent<T extends WebComponentMeta>(meta: T): T {
  return meta;
}
