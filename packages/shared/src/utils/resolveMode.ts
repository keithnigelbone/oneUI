/**
 * resolveMode.ts
 *
 * Generic pathname → mode resolver. Takes a modes record keyed by mode id,
 * a resolution order (longest-prefix-first), and a fallback id, and
 * returns the id whose `pathPrefixes` match the given pathname.
 *
 * Pure, framework-agnostic, testable with literal fixtures. The platform
 * app wraps this with its concrete `NAVIGATION_MODES` record and
 * `PlatformModeId` union so consumers get a typed adapter:
 *
 *   resolveModeFromPath(pathname) -> 'home' | 'build' | 'system' | 'agents'
 *
 * Callers provide the resolution order explicitly so the match semantics
 * are obvious from the call site — `['agents', 'build', 'system', 'home']`
 * reads as "check agents first so `/agents/tone-of-voice` doesn't fall
 * through to a system-mode prefix".
 */

export interface ModeWithPrefixes {
  /**
   * Pathname prefixes this mode owns. Each prefix is matched with exact
   * equality OR as a `path + '/'` prefix — so `'/agents'` matches both
   * `/agents` and `/agents/tone-of-voice/playground` but not `/agentsx`.
   */
  pathPrefixes: readonly string[];
}

/**
 * Walks `resolutionOrder` in order and returns the first mode whose
 * prefixes match `pathname`. Falls back to `fallback` when nothing
 * matches.
 */
export function resolveModeFromPath<T extends string>(
  pathname: string,
  modes: Record<T, ModeWithPrefixes>,
  resolutionOrder: readonly T[],
  fallback: T,
): T {
  const normalised = pathname || '/';
  for (const id of resolutionOrder) {
    const mode = modes[id];
    if (!mode) continue;
    for (const prefix of mode.pathPrefixes) {
      if (prefix.length === 0) continue;
      if (normalised === prefix || normalised.startsWith(prefix + '/')) {
        return id;
      }
    }
  }
  return fallback;
}
