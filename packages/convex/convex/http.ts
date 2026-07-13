import { httpRouter } from 'convex/server';
import { authComponent, createAuth } from './auth';

// Registers Better Auth's HTTP endpoints on the Convex deployment's .convex.site
// domain. REQUIRED — without this the deployment has no HTTP actions and the
// Next.js /api/auth handler gets "This Convex deployment does not have HTTP
// actions enabled" (404) on every sign-in/sign-up request.
const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

export default http;
