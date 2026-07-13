/**
 * Figma OAuth Callback Route
 *
 * GET /api/auth/figma/callback?code=xxx&state=xxx
 * Handles the OAuth callback, exchanges code for tokens, and stores them
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '@oneui/convex';
import { encryptToken } from '@/lib/encryption';
import { createRequiredAuthedConvexClient } from '@/lib/convexServer';

const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET;
const FIGMA_REDIRECT_URI =
  process.env.FIGMA_REDIRECT_URI ||
  'http://localhost:3000/api/auth/figma/callback';
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

interface FigmaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface StateData {
  state: string;
  brandId: string;
  fileKey: string;
  returnUrl: string;
  timestamp: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Figma OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/brand/sync?error=${encodeURIComponent(errorDescription || error)}`,
        request.url
      )
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/brand/sync?error=Missing+OAuth+parameters', request.url)
    );
  }

  // Validate configuration
  if (!FIGMA_CLIENT_ID || !FIGMA_CLIENT_SECRET || !ENCRYPTION_KEY || !CONVEX_URL) {
    console.error('Missing required environment variables');
    return NextResponse.redirect(
      new URL('/brand/sync?error=Server+configuration+error', request.url)
    );
  }

  // Retrieve and validate state from cookie
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get('figma_oauth_state');

  if (!stateCookie) {
    return NextResponse.redirect(
      new URL('/brand/sync?error=Invalid+or+expired+state', request.url)
    );
  }

  let stateData: StateData;
  try {
    stateData = JSON.parse(stateCookie.value);
  } catch {
    return NextResponse.redirect(
      new URL('/brand/sync?error=Invalid+state+data', request.url)
    );
  }

  // Validate CSRF state
  if (stateData.state !== state) {
    return NextResponse.redirect(
      new URL('/brand/sync?error=CSRF+validation+failed', request.url)
    );
  }

  // Check if state has expired (10 minutes)
  if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
    return NextResponse.redirect(
      new URL('/brand/sync?error=OAuth+state+expired', request.url)
    );
  }

  // Clear the state cookie
  cookieStore.delete('figma_oauth_state');

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://api.figma.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: FIGMA_CLIENT_ID,
        client_secret: FIGMA_CLIENT_SECRET,
        redirect_uri: FIGMA_REDIRECT_URI,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(
        new URL('/brand/sync?error=Token+exchange+failed', request.url)
      );
    }

    const tokens: FigmaTokenResponse = await tokenResponse.json();

    // Get Figma user info
    const userResponse = await fetch('https://api.figma.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    let userId = 'unknown';
    if (userResponse.ok) {
      const userData = await userResponse.json();
      userId = userData.id || userData.email || 'unknown';
    }

    // Get file name
    let fileName: string | undefined;
    try {
      const fileResponse = await fetch(
        `https://api.figma.com/v1/files/${stateData.fileKey}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      if (fileResponse.ok) {
        const fileData = await fileResponse.json();
        fileName = fileData.name;
      }
    } catch {
      // File name is optional, continue without it
    }

    // Encrypt tokens
    const encryptedAccessToken = await encryptToken(
      tokens.access_token,
      ENCRYPTION_KEY
    );
    const encryptedRefreshToken = await encryptToken(
      tokens.refresh_token,
      ENCRYPTION_KEY
    );

    // Calculate expiry time
    const tokenExpiresAt = Date.now() + tokens.expires_in * 1000;

    // Store in Convex using the initiating user's session. This route must not
    // fall back to the anonymous tooling client: figmaConnections.upsert is
    // brand-editor gated.
    const convex = await createRequiredAuthedConvexClient(CONVEX_URL);
    if (!convex) {
      return NextResponse.redirect(
        new URL('/brand/sync?error=Authentication+required', request.url),
      );
    }
    await convex.mutation(api.figmaConnections.upsert, {
      brandId: stateData.brandId as any, // Type cast for Convex ID
      userId,
      encryptedAccessToken,
      encryptedRefreshToken,
      tokenExpiresAt,
      fileKey: stateData.fileKey,
      fileName,
    });

    // Redirect back to sync page with success
    const returnUrl = new URL(stateData.returnUrl, request.url);
    returnUrl.searchParams.set('connected', 'true');
    returnUrl.searchParams.set('brandId', stateData.brandId);

    return NextResponse.redirect(returnUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/brand/sync?error=Connection+failed', request.url)
    );
  }
}
