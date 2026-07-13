/**
 * Figma OAuth Initiation Route
 *
 * GET /api/auth/figma?brandId=xxx&fileKey=xxx
 * Initiates the OAuth flow by redirecting to Figma's authorization page
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID;
const FIGMA_REDIRECT_URI =
  process.env.FIGMA_REDIRECT_URI ||
  'http://localhost:3000/api/auth/figma/callback';

/**
 * Generate a cryptographically secure random string
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

export async function GET(request: NextRequest) {
  // Validate client ID is configured
  if (!FIGMA_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Figma OAuth not configured' },
      { status: 500 }
    );
  }

  // Get parameters from query string
  const searchParams = request.nextUrl.searchParams;
  const brandId = searchParams.get('brandId');
  const fileKey = searchParams.get('fileKey');
  const returnUrl = searchParams.get('returnUrl') || '/brand/sync';

  // Validate required parameters
  if (!brandId) {
    return NextResponse.json(
      { error: 'brandId is required' },
      { status: 400 }
    );
  }

  if (!fileKey) {
    return NextResponse.json(
      { error: 'fileKey is required' },
      { status: 400 }
    );
  }

  // Generate CSRF state token
  const state = generateState();

  // Store state data in a secure HTTP-only cookie
  const stateData = JSON.stringify({
    state,
    brandId,
    fileKey,
    returnUrl,
    timestamp: Date.now(),
  });

  const cookieStore = await cookies();
  cookieStore.set('figma_oauth_state', stateData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  // Build Figma OAuth URL
  const figmaAuthUrl = new URL('https://www.figma.com/oauth');
  figmaAuthUrl.searchParams.set('client_id', FIGMA_CLIENT_ID);
  figmaAuthUrl.searchParams.set('redirect_uri', FIGMA_REDIRECT_URI);
  // Note: file_variables:read requires Enterprise plan
  // Use file_content:read which is available on all plans
  figmaAuthUrl.searchParams.set('scope', 'file_content:read');
  figmaAuthUrl.searchParams.set('state', state);
  figmaAuthUrl.searchParams.set('response_type', 'code');

  // Redirect to Figma
  return NextResponse.redirect(figmaAuthUrl.toString());
}
