/**
 * SandpackCanvas.tsx
 *
 * Real React/TSX execution inside a Sandpack iframe — the code-mode
 * counterpart of the legacy ASTRenderer path.
 *
 * Boot sequence:
 *   1. Fetch the pre-built `@oneui/playground` bundle (JS + CSS) once
 *      per page session. The fetch is module-cached so multiple
 *      SandpackCanvas mounts share the same promise.
 *   2. Snapshot the parent's `<style id="oneui-foundation-tokens">` —
 *      brand CSS that `useBrandCSS` already computed.
 *   3. Compose Sandpack's file map via `buildPlaygroundFiles(...)`.
 *   4. Render `<SandpackProvider>` + `<SandpackPreview>`.
 *
 * Three sibling bridge components mounted inside the provider keep
 * iframe state in sync without a remount: BrandCSSBridge mirrors the
 * parent's foundation style, AppCodeBridge writes /App.tsx via
 * updateFile, CascadeAttrBridge posts theme/density/platform changes.
 */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import type { IconSetId } from '@oneui/shared';
import {
  buildPlaygroundFiles,
  DEFAULT_PLAYGROUND_APP_TSX,
} from '@oneui/ui/playground/template';
import { MSG_THEME, MSG_DENSITY, MSG_PLATFORM, MSG_SELECT } from '@oneui/ui/playground/messageTypes';
import { getJioIconData } from '@/lib/initJioIcons';
import { loadPlaygroundPublicFiles } from '@/lib/playgroundPublicFiles';
import { useSelfHealingPreview } from './useSelfHealingPreview';
import s from './playground.module.css';

const BUNDLE_URL = '/sandpack/oneui-playground.mjs';
const BUNDLE_CSS_URL = '/sandpack/oneui-playground.css';
const FOUNDATION_STYLE_ID = 'oneui-foundation-tokens';

interface BundleAssets {
  source: string;
  css: string;
}

let bundlePromise: Promise<BundleAssets> | null = null;
function loadBundleAssets(): Promise<BundleAssets> {
  if (!bundlePromise) {
    bundlePromise = Promise.all([
      fetch(BUNDLE_URL).then((r) => {
        if (!r.ok) throw new Error(`Bundle JS fetch failed: ${r.status}`);
        return r.text();
      }),
      fetch(BUNDLE_CSS_URL).then((r) => {
        if (!r.ok) throw new Error(`Bundle CSS fetch failed: ${r.status}`);
        return r.text();
      }),
    ]).then(([source, css]) => ({ source, css }));
  }
  return bundlePromise;
}

/**
 * Resolve the Jio icon catalog as a JSON string for inlining into
 * Sandpack's virtual file system. Reuses `getJioIconData` (which is
 * already module-cached for the host app's IconProvider), so the
 * iframe bridge shares a single fetch with the platform itself.
 */
function loadJioCatalog(): Promise<string> {
  return getJioIconData().then((data) => JSON.stringify(data));
}

export interface SandpackCanvasProps {
  /** TSX source for App.tsx. Defaults to a sample composition when
   *  unset (the placeholder app from `@oneui/ui/playground/template`). */
  code?: string;
  /** `data-mode` on the iframe `<html>`. Defaults to `'light'` when
   *  unset; the toolbar inside the canvas lets the user override per
   *  iframe (independent from the platform's global theme so designers
   *  can compare light/dark side-by-side). */
  theme?: 'light' | 'dark' | 'dim';
  /** `data-density` on the iframe `<html>`. */
  density?: 'compact' | 'default' | 'open';
  /** Sets `data-Breakpoint` so the dimension cascade matches the device
   *  frame width. */
  platform?: 'S' | 'M' | 'L';
  /** Composition context — threaded into the self-heal endpoint so
   *  Claude gets the right rule set when fixing a compile error. */
  context?: string;
  /** Brand-selected icon set. Threaded into the iframe's IconProvider
   *  so AI-generated `<Icon>` components resolve via the brand's chosen
   *  library. Only Lucide is currently bundled; other values fall back
   *  to Lucide with a one-time console warning. */
  iconSet?: IconSetId;
  /** Fires when the user clicks a JSX element inside the iframe with
   *  a `data-oneui-loc` attribute (every element gets one via the
   *  server-side annotator). Pass `null` to clear the selection. The
   *  page wires this into the revision body so the next prompt can
   *  target the clicked element. */
  onSelectElement?: (selection: { loc: string; tag: string } | null) => void;
  /** Optional bridge to the platform theme. When set, the iframe toggle also
   *  updates the source theme so regenerated brand CSS reaches foundation.css. */
  onThemeChange?: (theme: 'light' | 'dark') => void;
  /** Fired when the self-heal loop successfully rewrites /App.tsx. */
  onCodeRepaired?: (code: string) => void;
}

/**
 * Reads the parent document's foundation CSS (already computed by
 * useBrandCSS in FoundationStyleProvider). Returns '' on SSR.
 */
function readFoundationCSS(): string {
  if (typeof document === 'undefined') return '';
  const el = document.getElementById(FOUNDATION_STYLE_ID);
  return el?.textContent ?? '';
}

export function SandpackCanvas({
  code,
  theme: themeProp,
  density = 'default',
  platform = 'L',
  context = 'mobile-app',
  iconSet = 'lucide',
  onSelectElement,
  onThemeChange,
  onCodeRepaired,
}: SandpackCanvasProps) {
  // Theme is local state so designers can toggle the iframe between
  // light/dark independently from the platform's global theme. Defaults
  // to `themeProp` when supplied, otherwise `'light'`.
  const [theme, setTheme] = useState<'light' | 'dark'>(
    themeProp === 'dark' ? 'dark' : 'light',
  );
  const [bundle, setBundle] = useState<BundleAssets | null>(null);
  const [bundleError, setBundleError] = useState<string | null>(null);
  const [initialFoundation, setInitialFoundation] = useState<string>('');
  const [jioCatalog, setJioCatalog] = useState<string | null>(null);
  const [publicFiles, setPublicFiles] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (themeProp === 'light' || themeProp === 'dark') {
      setTheme(themeProp);
    }
  }, [themeProp]);

  // Fetch JS + CSS in parallel via the module-level cache. Both are
  // inlined into Sandpack's virtual file system because the iframe runs
  // on a different origin than the parent app — `/sandpack/*` URLs only
  // resolve from the parent's host.
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadBundleAssets(), loadPlaygroundPublicFiles()])
      .then(([assets, files]) => {
        if (!cancelled) {
          setBundle(assets);
          setPublicFiles(files);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setBundleError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Jio catalog: only fetched when the brand-selected icon set is 'jio'.
  // 830KB raw text — we don't pay this cost for Lucide-only sessions.
  useEffect(() => {
    if (iconSet !== 'jio') {
      setJioCatalog(null);
      return;
    }
    let cancelled = false;
    loadJioCatalog()
      .then((text) => {
        if (!cancelled) setJioCatalog(text);
      })
      .catch((err: unknown) => {
        // Non-fatal — falling back to Lucide is acceptable. Surface to
        // the console so the host knows the catalog isn't reaching the
        // iframe.
        // eslint-disable-next-line no-console
        console.warn('[oneui playground] Jio icon catalog fetch failed:', err);
      });
    return () => {
      cancelled = true;
    };
  }, [iconSet]);

  // Snapshot the parent's foundation CSS at mount time. The bridge
  // component takes over for live updates after the iframe boots.
  useEffect(() => {
    setInitialFoundation(readFoundationCSS());
  }, []);

  // Selection bridge: the iframe's index.tsx posts MSG_SELECT when the
  // user clicks an annotated element. We forward to the parent via
  // `onSelectElement` so the page can pin the location for the next
  // revision prompt.
  useEffect(() => {
    if (!onSelectElement) return;
    const handler = (event: MessageEvent) => {
      const msg = event.data as { type?: string; loc?: string; tag?: string } | null;
      if (!msg || msg.type !== MSG_SELECT) return;
      if (typeof msg.loc !== 'string' || typeof msg.tag !== 'string') return;
      onSelectElement({ loc: msg.loc, tag: msg.tag });
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSelectElement]);

  // The initial /App.tsx in the file map is only consumed at the very
  // first iframe boot — every subsequent change flows through
  // `AppCodeBridge.updateFile('/App.tsx', code)`. So `code` is
  // intentionally OUT of the memo deps: rebuilding the 4MB-plus virtual
  // file map on every keystroke would be pure waste.
  const files = useMemo(() => {
    if (!bundle || !publicFiles) return null;
    // Wait for the Jio catalog before booting the iframe when iconSet
    // is 'jio'; otherwise icons render in their lucide fallback for the
    // first paint and flicker once the catalog arrives.
    if (iconSet === 'jio' && !jioCatalog) return null;
    return buildPlaygroundFiles({
      appCode: code ?? DEFAULT_PLAYGROUND_APP_TSX,
      foundationCSS: initialFoundation,
      bundleSource: bundle.source,
      bundleCSS: bundle.css,
      theme,
      density,
      platform,
      iconSet,
      jioCatalog: iconSet === 'jio' ? (jioCatalog ?? undefined) : undefined,
      publicFiles,
    });
    // `code`, `theme`, `density`, and `platform` are deliberately excluded:
    // - code: AppCodeBridge owns the live /App.tsx update post-boot.
    // - theme/density/platform: CascadeAttrBridge posts those values to
    //   the iframe via window.postMessage; a memo rebuild here would
    //   pass a fresh `files` prop to SandpackProvider and could trigger
    //   a wasteful diff/re-bundle. The values are only baked into HTML
    //   at the very first iframe boot, which is keyed by `iconSet`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle, initialFoundation, iconSet, jioCatalog, publicFiles]);

  if (bundleError) {
    return (
      <div className={`${s.sandpackStatus} ${s.sandpackStatusError}`}>
        Failed to load playground bundle: {bundleError}
      </div>
    );
  }

  if (!files) {
    return (
      <div className={s.sandpackStatus}>
        Loading playground runtime…
      </div>
    );
  }

  return (
    <div className={s.sandpackFrame}>
      <SandpackProvider
        // `iconSet` is baked into /index.tsx at file-build time, so the
        // only way to apply a change is a full iframe remount. Keying
        // the provider by it makes that remount automatic and clean.
        key={iconSet}
        template="react-ts"
        files={files}
        customSetup={{
          dependencies: {
            react: '^18.3.0',
            'react-dom': '^18.3.0',
          },
        }}
        options={{
          bundlerURL: undefined,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <BrandCSSBridge />
        <AppCodeBridge code={code ?? DEFAULT_PLAYGROUND_APP_TSX} />
        <CascadeAttrBridge type={MSG_THEME} value={theme} />
        <CascadeAttrBridge type={MSG_DENSITY} value={density} />
        <CascadeAttrBridge type={MSG_PLATFORM} value={platform} />
        <SelfHealStatusBadge context={context} onCodeRepaired={onCodeRepaired} />
        <SandpackPreview
          showNavigator={false}
          showOpenInCodeSandbox={false}
          showRefreshButton={false}
          className={s.sandpackPreview}
        />
      </SandpackProvider>

      {/* Theme toggle overlay. Floats top-right of the iframe so designers
          can flip light/dark without touching the global platform theme. */}
      <IconButton
        icon={theme === 'light' ? 'moon' : 'sun'}
        onPress={() => {
          setTheme((current) => {
            const next = current === 'light' ? 'dark' : 'light';
            onThemeChange?.(next);
            return next;
          });
        }}
        className={s.sandpackThemeToggle}
        appearance="neutral"
        attention="low"
        size="s"
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      />
    </div>
  );
}

/**
 * Tiny status pill that appears top-left of the iframe whenever the
 * self-heal loop is active. Three states:
 *   - `repairing`: orange "Fixing…" — Claude is rewriting App.tsx
 *   - `failed`:    red "Repair failed · Retry" — auto-retries exhausted
 *   - everything else: nothing rendered (no chrome on the happy path)
 */
function SelfHealStatusBadge({
  context,
  onCodeRepaired,
}: {
  context: string;
  onCodeRepaired?: (code: string) => void;
}) {
  const heal = useSelfHealingPreview(context, onCodeRepaired);
  if (heal.status !== 'repairing' && heal.status !== 'failed') return null;
  const isFailed = heal.status === 'failed';
  const content = (
    <>
      <span className={s.selfHealDot} aria-hidden="true" />
      {isFailed ? 'Repair failed · Retry' : `Fixing… (attempt ${heal.attempts})`}
    </>
  );
  if (isFailed) {
    return (
      <Button
        className={`${s.selfHealBadge} ${s.selfHealFailed}`}
        onPress={heal.retry}
        size="s"
        attention="low"
        appearance="negative"
      >
        {content}
      </Button>
    );
  }
  return (
    <div
      role="status"
      className={`${s.selfHealBadge} ${s.selfHealRepairing}`}
      title={heal.lastError ?? undefined}
    >
      {content}
    </div>
  );
}

function CascadeAttrBridge({ type, value }: { type: string; value: string }) {
  const sandpackPair = useSandpack();
  const sandpackRef = useRef(sandpackPair.sandpack);
  sandpackRef.current = sandpackPair.sandpack;
  useEffect(() => {
    // Find the live iframe Sandpack mounted. `clients` is keyed by client id;
    // we take the first one (Sandpack supports multi-client setups, but the
    // playground only ever renders one preview).
    const clients = Object.values(sandpackRef.current.clients ?? {});
    for (const client of clients) {
      const iframe = (client as { iframe?: HTMLIFrameElement }).iframe;
      iframe?.contentWindow?.postMessage({ type, value }, '*');
    }
  }, [type, value]);
  return null;
}

/**
 * Pushes the parent's `code` prop into `/App.tsx` whenever it changes.
 * Avoids re-mounting the SandpackProvider on every AI revision — the
 * iframe stays warm, only the user-authored source file flips. Combined
 * with the brand CSS bridge below, the iframe is fully reactive without
 * a full remount cycle.
 */
function AppCodeBridge({ code }: { code: string }) {
  // Same ref pattern as BrandCSSBridge: `useSandpack()` is unstable, so
  // including it in the dep array triggers an infinite update loop. The
  // effect should fire only when the *code itself* changes.
  const sandpackPair = useSandpack();
  const sandpackRef = useRef(sandpackPair.sandpack);
  sandpackRef.current = sandpackPair.sandpack;
  useEffect(() => {
    sandpackRef.current.updateFile('/App.tsx', code);
  }, [code]);
  return null;
}

/**
 * Watches the parent document's foundation `<style>` element and pushes
 * any text updates into Sandpack's `/foundation.css`. Lives inside
 * `<SandpackProvider>` so it has access to `useSandpack()`.
 *
 * Why MutationObserver: `useBrandCSS` writes to a stable `<style>` node
 * via `useInsertionEffect`, replacing only `textContent`. There's no
 * React event we can hook — observing the DOM is the canonical bridge.
 */
function BrandCSSBridge() {
  // Keep `sandpack` in a ref. `useSandpack()` returns a fresh object identity
  // on every provider re-render — including it in a useEffect dep array
  // re-runs the effect each cycle, which schedules another updateFile, which
  // triggers another re-render → infinite loop. The mutation observer only
  // needs the latest `sandpack` reference at the moment a flush fires, so
  // a ref is exactly the right tool.
  const sandpackPair = useSandpack();
  const sandpackRef = useRef(sandpackPair.sandpack);
  sandpackRef.current = sandpackPair.sandpack;

  useEffect(() => {
    const el = document.getElementById(FOUNDATION_STYLE_ID);
    if (!el) return;

    let pending: ReturnType<typeof setTimeout> | null = null;
    let prevCSS = el.textContent ?? '';
    const flush = () => {
      pending = null;
      const next = el.textContent ?? '';
      // useInsertionEffect can re-write the same value during transitions;
      // skip the updateFile when nothing actually changed so Sandpack
      // doesn't re-bundle the iframe for a no-op.
      if (next === prevCSS) return;
      prevCSS = next;
      sandpackRef.current.updateFile('/foundation.css', next);
    };

    const observer = new MutationObserver(() => {
      // Debounce 100ms — useBrandCSS may emit multiple textContent writes
      // in quick succession during theme toggles. We only want one
      // updateFile per settled state.
      if (pending) clearTimeout(pending);
      pending = setTimeout(flush, 100);
    });

    observer.observe(el, { characterData: true, childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (pending) clearTimeout(pending);
    };
  }, []);

  return null;
}
