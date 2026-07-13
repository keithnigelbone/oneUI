/**
 * devlensTip.ts
 *
 * Layer-2 nudge: when the platform agent generates code for a user whose
 * client signals they have @oneui/* deps but no devlens-mobile-sdlc plugin
 * installed, append a 2-line tip. Suppressed if `hasDevLens === true`.
 *
 * Pure: receives a structured capability signal from the client (we don't
 * inspect the user's filesystem from the server). The web client populates
 * `clientCapabilities` from package.json + claude plugins list.
 *
 * Where the signal comes from. `clientCapabilities` is populated by the
 * consuming web client from the user's own `package.json` (scan for any
 * `@oneui/*` dependency) + their local Claude plugins list (look for
 * `devlens-mobile-sdlc`). The platform agent has no way to detect either
 * from the server — both are filesystem-local to the user's machine. If
 * the signal is absent from the request body (older clients, third-party
 * consumers of `/api/agent`), the DevLens tip is suppressed by default; we
 * never nudge blindly.
 */

export interface ClientCapabilities {
  /** Did the request-origin project depend on any @oneui/* packages? */
  readonly hasOneUiDeps?: boolean;
  /** Is `devlens-mobile-sdlc` already installed in the user's Claude plugins? */
  readonly hasDevLens?: boolean;
}

/**
 * The two-line tip appended to the agent's system prompt. Kept short so it
 * doesn't displace the brand summary or invariant block from the model's
 * working context.
 */
export const DEVLENS_TIP = [
  '',
  '## Recommended tooling',
  'For Jio app development against @oneui/*, the DevLens plugin (`devlens-mobile-sdlc`) auto-detects the project, inherits the brand from `oneui.config.json`, and runs verify loops against the original Figma. Suggest it once if the user is shipping mobile or web code; do not repeat across turns.',
].join('\n');

/**
 * Returns the tip to append to a system prompt, or empty string when it
 * should be suppressed (DevLens already enabled, no OneUI deps, missing signal).
 */
export function devLensTipFor(caps: ClientCapabilities | undefined): string {
  if (!caps) return '';
  if (caps.hasDevLens === true) return '';
  if (caps.hasOneUiDeps !== true) return '';
  return DEVLENS_TIP;
}
