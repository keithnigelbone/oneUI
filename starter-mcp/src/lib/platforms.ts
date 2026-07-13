/**
 * Platform-pack registry — the common-core seam (Model 1).
 *
 * `@jds4/oneui-mcp` is platform-agnostic at its core; everything platform-specific
 * (which npm package the generated code imports, where the released set / catalog
 * come from, the token syntax) is described by a PlatformPack entry here. React (web)
 * is the only SUPPORTED pack in v1; others are PLANNED placeholders that a platform
 * team fills in. See docs/ADDING-A-PLATFORM-PACK.md and docs/PLUGIN-ARCHITECTURE.md §6.
 *
 * This is the single source of truth for platform package names. New code should read
 * the active pack from here rather than hard-coding "@jds4/oneui-react".
 */

export type PlatformId = 'react' | 'reactnative';
export type PlatformStatus = 'supported' | 'planned';

export interface PlatformPack {
  id: PlatformId;
  /** Human label for messages. */
  label: string;
  /** `supported` = wired end-to-end; `planned` = placeholder, not yet usable. */
  status: PlatformStatus;
  /** npm package the generated code imports; source of the released set + catalog. */
  runtimePackage: string;
  /** node_modules path segments to the installed runtime package (released-set reads). */
  pkgSubdir: string[];
  /** Icons package (side-effect import + the `<Icon>` component). */
  iconsPackage: string;
  /** How design tokens are referenced in this platform's code (for docs / validator config). */
  tokenSyntax: string;
  /** File extension the renderer emits. */
  fileExt: string;
  /** Subdirectory under `assets/` holding this platform's baked catalog ('' = root/web). */
  assetSubdir: string;
}

export const DEFAULT_PLATFORM: PlatformId = 'react';

export const PLATFORMS: Record<PlatformId, PlatformPack> = {
  react: {
    id: 'react',
    label: 'React (web)',
    status: 'supported',
    runtimePackage: '@jds4/oneui-react',
    pkgSubdir: ['node_modules', '@jds4', 'oneui-react'],
    iconsPackage: '@jds4/oneui-icons-jio',
    tokenSyntax: 'CSS custom properties — var(--Token-Name)',
    fileExt: 'tsx',
    assetSubdir: '',
  },
  // React Native pack. Component knowledge IS wired (catalog baked into
  // assets/native/ from @jds/kb-rn via scripts/build-native-snapshot.mjs), so the
  // read-only component tools serve it via resolvePlatform(..., { allowPlanned: true }).
  // Kept `planned` until the rest is wired (RN-specific validator rules + the
  // generate-new-app lifecycle). See docs/ADDING-A-PLATFORM-PACK.md.
  reactnative: {
    id: 'reactnative',
    label: 'React Native',
    status: 'planned',
    runtimePackage: '@oneui/ui-native',
    pkgSubdir: ['node_modules', '@oneui', 'ui-native'],
    iconsPackage: '@oneui/icons-jio-native',
    tokenSyntax: 'token objects — tokens.* (StyleSheet props)',
    fileExt: 'tsx',
    assetSubdir: 'native',
  },
};

export interface ResolvedPlatform {
  ok: true;
  pack: PlatformPack;
}
export interface UnsupportedPlatform {
  ok: false;
  id: string;
  status: 'planned' | 'unknown';
  message: string;
}

export function supportedIds(): string[] {
  return Object.values(PLATFORMS).filter((p) => p.status === 'supported').map((p) => p.id);
}
export function plannedIds(): string[] {
  return Object.values(PLATFORMS).filter((p) => p.status === 'planned').map((p) => p.id);
}

/**
 * Resolve a platform input (default `react`) to a SUPPORTED pack, or a structured
 * "unsupported" result with a clear message. Callers that are platform-specific
 * (the validator, component tools) should short-circuit with that message rather
 * than running React logic against another platform's code.
 */
export function resolvePlatform(
  input?: string,
  opts: { allowPlanned?: boolean } = {},
): ResolvedPlatform | UnsupportedPlatform {
  const id = (input ?? DEFAULT_PLATFORM).toLowerCase().trim();
  const pack = (PLATFORMS as Record<string, PlatformPack>)[id];
  if (!pack) {
    return {
      ok: false,
      id,
      status: 'unknown',
      message:
        `Unknown platform "${id}". Supported: ${supportedIds().join(', ')}.` +
        ` Planned: ${plannedIds().join(', ') || '—'}. See docs/ADDING-A-PLATFORM-PACK.md.`,
    };
  }
  // Some capabilities (the read-only component catalog) are wired ahead of full
  // platform support; they opt in with allowPlanned to use a `planned` pack.
  if (pack.status !== 'supported' && !opts.allowPlanned) {
    return {
      ok: false,
      id,
      status: 'planned',
      message:
        `Platform "${id}" (${pack.label}) is PLANNED but not yet wired in v1. ` +
        `Only ${supportedIds().join(', ')} is supported today. ` +
        `To add it, see docs/ADDING-A-PLATFORM-PACK.md.`,
    };
  }
  return { ok: true, pack };
}
