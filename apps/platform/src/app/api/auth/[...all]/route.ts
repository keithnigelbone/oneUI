import { handler } from '@/lib/auth-server';

// Better Auth request handler — serves /api/auth/sign-in/email,
// /api/auth/sign-up/email, /api/auth/get-session, /api/auth/callback/*, etc.
// Replaces the old shared-password POST /api/auth route.
export const { GET, POST } = handler;
