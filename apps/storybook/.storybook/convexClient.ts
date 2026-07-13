/**
 * Singleton Convex client for Storybook preview.
 * URL is injected at build time from monorepo root `.env.local` via main.ts `define`.
 *
 * Must use direct `import.meta.env.*` reads — Vite only inlines those literals,
 * not dynamic `env[key]` access.
 */
import { ConvexReactClient } from 'convex/react';

export const convexUrl =
  import.meta.env.VITE_CONVEX_URL ||
  import.meta.env.CONVEX_URL ||
  import.meta.env.STORYBOOK_CONVEX_URL ||
  '';

export const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

if (!convexUrl && import.meta.env.DEV) {
  console.warn(
    '[Storybook] Convex URL missing — brand tokens will not load. Set STORYBOOK_CONVEX_URL in the monorepo root .env.local',
  );
}
