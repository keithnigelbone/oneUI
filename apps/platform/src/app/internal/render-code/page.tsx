/**
 * /internal/render-code — headless render target for the code-mode
 * verification loop. Sibling of `/internal/render-ast`. Boots a
 * SandpackCanvas with TSX fetched by token, signals readiness on
 * `window.__playgroundReady` so Playwright knows when to screenshot.
 *
 * The Sandpack iframe runs cross-origin (codesandbox.io's hosted
 * bundler), but Chromium captures cross-origin iframe content in
 * `page.screenshot()` by default. Playwright's only job is to wait
 * until the iframe's bundler has finished — that's what the readiness
 * flag is for.
 */

import { consumeCodeForRender } from '@/lib/playwrightRenderer';
import { RenderCodeClient } from './RenderCodeClient';

interface SearchParams {
  token?: string;
  platform?: string;
  density?: string;
}

export const dynamic = 'force-dynamic';

export default async function RenderCodePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token, platform, density } = await searchParams;
  if (!token) {
    return <div style={{ padding: 24 }}>Missing token</div>;
  }
  const code = consumeCodeForRender(token);
  if (!code) {
    return <div style={{ padding: 24 }}>Code not found or expired</div>;
  }
  return (
    <RenderCodeClient
      code={code}
      platform={(platform as 'S' | 'M' | 'L' | undefined) ?? 'L'}
      density={(density as 'compact' | 'default' | 'open' | undefined) ?? 'default'}
    />
  );
}
