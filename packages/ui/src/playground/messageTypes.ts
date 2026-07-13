/**
 * playground/messageTypes.ts
 *
 * Single source of truth for the `postMessage` protocol between the
 * Sandpack iframe and its parent. The iframe lives on a different
 * origin (Sandpack's hosted bundler), so all communication crosses
 * origins via `window.postMessage`. A typo in either end silently
 * breaks the channel — these constants prevent that.
 */

/** Iframe → parent: a JSX element with `data-oneui-loc` was clicked. */
export const MSG_SELECT = 'oneui:select' as const;

/** Parent → iframe: update the iframe's `data-mode`. */
export const MSG_THEME = 'oneui:theme' as const;

/** Parent → iframe: update the iframe's `data-density`. */
export const MSG_DENSITY = 'oneui:density' as const;

/** Parent → iframe: update the iframe's `data-Breakpoint`. */
export const MSG_PLATFORM = 'oneui:platform' as const;

export type SandboxMessageType =
  | typeof MSG_SELECT
  | typeof MSG_THEME
  | typeof MSG_DENSITY
  | typeof MSG_PLATFORM;

/**
 * Window-global key the iframe stashes the Jio icon catalog on. Exported
 * as a constant so the iframe-side writer (`template.ts`'s generated
 * INDEX_TSX) and the reader (`icon.tsx`) can't drift apart silently —
 * a rename is caught at compile time.
 */
export const JIO_CATALOG_WINDOW_KEY = '__jioIconCatalog' as const;
