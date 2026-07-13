/**
 * Unified Figma-bridge entry point — hides WHICH bridge backs extraction.
 *
 *  - Default: the spawned `figma-console-mcp` child (Phase 1, hardened with
 *    port pinning + reclaim + preflight).
 *  - `ONEUI_FIGMA_BRIDGE_OWN=1`: the OneUI-owned WS server + plugin (Phase 2),
 *    a deterministic port we own with our own reconnect and no npx/cloud dep.
 *
 * `buildModesSnippet` output is identical for both — only the transport differs,
 * so the rest of `figma_to_code` is unchanged.
 */
import { callFigmaConsole, ensureBridgeConnected, resultToText, type EnsureBridgeResult } from './figmaConsole.js';
import { ensureOwnBridge, getOwnBridgeServer, type EnsureOwnBridgeResult } from './figmaBridgeServer.js';

/** Is the OneUI-owned bridge (Phase 2) selected? */
export function ownBridgeEnabled(): boolean {
  return (process.env.ONEUI_FIGMA_BRIDGE_OWN ?? '0') === '1';
}

/** Human-readable label for the active bridge backend. */
export function bridgeModeLabel(): string {
  return ownBridgeEnabled() ? 'OneUI-owned bridge' : 'figma-console child';
}

/** Common structured result across both bridge backends (own adds `port`). */
export type BridgeResult = EnsureBridgeResult | EnsureOwnBridgeResult;

/** Ensure the active bridge is connected, returning the common structured result. */
export function ensureBridge(opts: { reclaim?: boolean; timeoutMs?: number } = {}): Promise<BridgeResult> {
  return ownBridgeEnabled() ? ensureOwnBridge({ timeoutMs: opts.timeoutMs }) : ensureBridgeConnected(opts);
}

/** Normalised result of running a snippet through whichever bridge is active. */
export interface SnippetResult {
  ok: boolean;
  value: unknown;
  raw: string;
}

/** figma-console wraps figma_execute output as {success, result|error}. Unwrap it. */
function unwrapExecute(raw: string, isError: boolean): SnippetResult {
  if (isError) return { ok: false, value: raw, raw };
  try {
    const parsed = JSON.parse(raw) as { success?: boolean; result?: unknown; error?: unknown };
    if (parsed && parsed.success === false) return { ok: false, value: parsed.error ?? parsed, raw };
    return { ok: true, value: parsed?.result ?? parsed, raw };
  } catch {
    return { ok: true, value: raw, raw };
  }
}

/**
 * Run a `buildModesSnippet` body through the active bridge and return the
 * unwrapped result. Routes to the OneUI bridge or the figma-console child.
 */
export async function executeSnippet(code: string, timeoutMs = 30_000): Promise<SnippetResult> {
  if (ownBridgeEnabled()) {
    const r = await getOwnBridgeServer().executeCode(code, timeoutMs);
    if (r.success) {
      const raw = (() => {
        try {
          return JSON.stringify(r.result ?? null);
        } catch {
          return String(r.result);
        }
      })();
      return { ok: true, value: r.result, raw };
    }
    return { ok: false, value: r.error ?? 'unknown bridge error', raw: r.error ?? '' };
  }
  const res = await callFigmaConsole('figma_execute', { code, timeout: timeoutMs });
  return unwrapExecute(resultToText(res), res.isError === true);
}
