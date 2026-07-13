/**
 * Ambient declarations for the playground app.
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
