import { defineApp } from 'convex/server';
import betterAuth from '@convex-dev/better-auth/convex.config';

// Registers the Better Auth component. After adding this file, run `npx convex dev`
// (or `npx convex codegen`) so `components.betterAuth` becomes available in
// `_generated/api`. See docs: https://labs.convex.dev/better-auth
const app = defineApp();
app.use(betterAuth);

export default app;
