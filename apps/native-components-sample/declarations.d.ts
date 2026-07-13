/**
 * Ambient declarations for the native-sample app.
 *
 * The CSS-module declaration is here only because TypeScript's project graph
 * walks into web-only `@oneui/ui` source files (`Button.tsx`, `Surface.tsx`,
 * `LinkButton.tsx`) when resolving the workspace symlink. Native code never
 * actually imports `.module.css` files; this stops `tsc` from complaining.
 */

declare module '*.module.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '@jds/core-icons--react-native' {
  import type { ComponentType } from 'react';
  import type { SvgProps } from 'react-native-svg';

  export const IcConfirm: ComponentType<SvgProps>;
  export const IcFavorite: ComponentType<SvgProps>;
  export const IcHome: ComponentType<SvgProps>;
  export const IcSearch: ComponentType<SvgProps>;
  export const IcSettings: ComponentType<SvgProps>;
  export const IcStar: ComponentType<SvgProps>;
}
