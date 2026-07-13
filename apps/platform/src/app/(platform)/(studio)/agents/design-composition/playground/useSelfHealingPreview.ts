/**
 * useSelfHealingPreview.ts
 *
 * Watches the Sandpack iframe for compile / runtime errors and silently
 * asks Claude to repair the failing TSX. The user typically never sees
 * the failure: the broken render is replaced by the repaired one a few
 * seconds later, like an HMR pass.
 *
 * Mechanism:
 *   1. Subscribe to `sandpack.error` (reactive — non-null whenever the
 *      bundler / runtime threw).
 *   2. Debounce 250ms so we don't fire mid-typing if the user is in the
 *      Sandpack editor (we don't expose the editor today, but the same
 *      hook covers it).
 *   3. POST `{ previousCode, error }` to `/api/composition/repair`.
 *   4. On success, write the repaired code into `/App.tsx`. Sandpack
 *      hot-reloads. Loop closes.
 *
 * Caps at 2 auto-retries. Beyond that we surface a manual repair button
 * (UI lives in the chat preview card; this hook just exposes the state).
 */

'use client';

import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';

const REPAIR_ENDPOINT = '/api/composition/repair';
const DEBOUNCE_MS = 250;
const MAX_AUTO_RETRIES = 2;

export type SelfHealStatus = 'idle' | 'repairing' | 'failed' | 'recovered';

export interface SelfHealState {
  status: SelfHealStatus;
  /** Most recent bundler error message — surfaced for the manual button. */
  lastError: string | null;
  /** How many auto-retries this hook has fired since the last `idle`. */
  attempts: number;
  /** Manual trigger when auto-retries are exhausted. */
  retry: () => void;
}

/**
 * Drives the self-heal loop. Call inside the SandpackProvider tree.
 *
 * @param context  Composition context (mobile-app, web-app, …) — passed
 *                 to /api/composition/repair so the model gets the right
 *                 rule set.
 */
export function useSelfHealingPreview(
  context: string,
  onCodeRepaired?: (code: string) => void,
): SelfHealState {
  const { sandpack } = useSandpack();
  const [status, setStatus] = useState<SelfHealStatus>('idle');
  const [attempts, setAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  // We need a stable ref to `sandpack` so the debounced flush always
  // sees the current state without re-firing the effect on every render
  // (same pattern as the brand CSS bridge).
  const sandpackRef = useRef(sandpack);
  sandpackRef.current = sandpack;
  // Last-attempted error signature — guards against firing repair for
  // the *same* error twice in a row (which can happen if the repair
  // failed and the same error is still visible).
  const lastAttemptedSig = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read the live attempts/status without putting them in the effect's
  // dep array — they're updated *inside* the effect and shouldn't cause
  // a re-run on their own. errorSig is the only signal that should
  // trigger repair logic.
  const attemptsRef = useRef(attempts);
  attemptsRef.current = attempts;
  const statusRef = useRef(status);
  statusRef.current = status;

  const error = sandpack.error;
  const errorMessage = error?.message ?? '';
  const errorSig = error
    ? `${error.path ?? ''}:${error.line ?? 0}:${error.column ?? 0}:${error.message}`
    : null;

  useEffect(() => {
    // No error → mark recovered if we were repairing.
    if (!errorSig) {
      if (statusRef.current === 'repairing' || statusRef.current === 'failed') {
        setStatus('recovered');
      }
      lastAttemptedSig.current = null;
      setAttempts(0);
      return;
    }

    // Same error we already tried → don't loop.
    if (lastAttemptedSig.current === errorSig) return;

    // Hit the retry cap → flip to manual mode and stop auto-firing.
    if (attemptsRef.current >= MAX_AUTO_RETRIES) {
      setStatus('failed');
      setLastError(errorMessage);
      return;
    }

    // Debounce so a flurry of mid-typing errors doesn't burn API calls.
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runRepair(sandpackRef, errorSig, errorMessage, context, {
        onStart: () => {
          setStatus('repairing');
          setLastError(errorMessage);
          setAttempts((n) => n + 1);
          lastAttemptedSig.current = errorSig;
        },
        onSuccess: (repairedCode) => {
          onCodeRepaired?.(repairedCode);
          // Don't clear status — let the next render of `sandpack.error`
          // (which becomes null after the repair compiles cleanly) flip
          // us to `recovered`.
        },
        onFailure: (msg) => {
          setStatus('failed');
          setLastError(msg);
        },
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [errorSig, errorMessage, context, onCodeRepaired]);

  return {
    status,
    lastError,
    attempts,
    retry: () => {
      setAttempts(0);
      lastAttemptedSig.current = null;
    },
  };
}

interface RepairCallbacks {
  onStart: () => void;
  onSuccess: (code: string) => void;
  onFailure: (message: string) => void;
}

async function runRepair(
  sandpackRef: MutableRefObject<ReturnType<typeof useSandpack>['sandpack']>,
  errorSig: string,
  errorMessage: string,
  context: string,
  callbacks: RepairCallbacks,
): Promise<void> {
  callbacks.onStart();
  try {
    const sandpack = sandpackRef.current;
    // Snapshot the broken source the *moment* repair starts. If the user
    // generates a new composition mid-flight, /App.tsx will change to
    // that new code; we'd overwrite it on success otherwise. The
    // post-fetch guard below compares against this snapshot.
    const previousCode = sandpack.files['/App.tsx']?.code ?? '';
    if (!previousCode) {
      callbacks.onFailure('No App.tsx in Sandpack files; cannot repair.');
      return;
    }
    const response = await fetch(REPAIR_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previousCode, error: errorMessage, context }),
    });
    if (!response.ok) {
      callbacks.onFailure(`Repair endpoint returned ${response.status}`);
      return;
    }
    const payload = (await response.json()) as { code?: string };
    if (!payload.code) {
      callbacks.onFailure('Repair returned empty code.');
      return;
    }
    // Guard: if the user generated a new composition while repair was in
    // flight, /App.tsx no longer equals the broken source we sent. The
    // server's fix is for a code path that no longer exists; applying it
    // would overwrite the user's fresh generation. Abandon without
    // touching status — the new generation will either compile cleanly
    // (errorSig clears, status flips to 'recovered') or trigger a fresh
    // repair cycle of its own.
    const currentCode = sandpackRef.current.files['/App.tsx']?.code ?? '';
    if (currentCode !== previousCode) {
      return;
    }
    sandpackRef.current.updateFile('/App.tsx', payload.code);
    callbacks.onSuccess(payload.code);
    // Acknowledge errorSig so we don't refire if the same error somehow
    // re-emits before Sandpack notices the new code.
    void errorSig;
  } catch (err) {
    callbacks.onFailure(err instanceof Error ? err.message : String(err));
  }
}
