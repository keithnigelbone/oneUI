/**
 * RenderCodeClient.tsx
 *
 * Client wrapper around Sandpack for the headless `/internal/render-code`
 * page. Renders the iframe full-viewport (no chrome, no toolbar) and sets
 * `window.__playgroundReady = true` once the bundler reports `done`, so
 * Playwright knows when to screenshot.
 */

'use client';

import { useEffect, useState } from 'react';
import { SandpackProvider, SandpackPreview, useSandpack } from '@codesandbox/sandpack-react';
import {
  buildPlaygroundFiles,
  DEFAULT_PLAYGROUND_APP_TSX,
} from '@oneui/ui/playground/template';
import { loadPlaygroundPublicFiles } from '@/lib/playgroundPublicFiles';

const BUNDLE_URL = '/sandpack/oneui-playground.mjs';
const BUNDLE_CSS_URL = '/sandpack/oneui-playground.css';

export interface RenderCodeClientProps {
  code: string;
  platform?: 'S' | 'M' | 'L';
  density?: 'compact' | 'default' | 'open';
}

interface BundleAssets {
  source: string;
  css: string;
}

export function RenderCodeClient({
  code,
  platform = 'L',
  density = 'default',
}: RenderCodeClientProps) {
  const [bundle, setBundle] = useState<BundleAssets | null>(null);
  const [publicFiles, setPublicFiles] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(BUNDLE_URL).then((r) => r.text()),
      fetch(BUNDLE_CSS_URL).then((r) => r.text()),
      loadPlaygroundPublicFiles(),
    ]).then(([source, css, files]) => {
      if (!cancelled) {
        setBundle({ source, css });
        setPublicFiles(files);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!bundle || !publicFiles) return <div style={{ padding: 24 }}>Loading playground runtime…</div>;

  const files = buildPlaygroundFiles({
    appCode: code || DEFAULT_PLAYGROUND_APP_TSX,
    foundationCSS: '',
    bundleSource: bundle.source,
    bundleCSS: bundle.css,
    theme: 'light',
    density,
    platform,
    iconSet: 'lucide',
    publicFiles,
  });

  return (
    <SandpackProvider
      template="react-ts"
      files={files}
      options={{ bundlerURL: undefined }}
      style={{ width: '100vw', height: '100vh' }}
    >
      <ReadyFlag />
      <SandpackPreview
        showNavigator={false}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        style={{ width: '100%', height: '100%', border: 0 }}
      />
    </SandpackProvider>
  );
}

/**
 * Sets `window.__playgroundReady = true` once Sandpack reports `done`.
 * Playwright polls for this flag before screenshotting.
 */
function ReadyFlag() {
  const { sandpack } = useSandpack();
  useEffect(() => {
    if (sandpack.status !== 'done') return;
    // Extra paint frame for async fonts / images to settle.
    const id = window.requestAnimationFrame(() => {
      (window as unknown as { __playgroundReady: boolean }).__playgroundReady = true;
    });
    return () => window.cancelAnimationFrame(id);
  }, [sandpack.status]);
  return null;
}
