/**
 * JioRibbon-specific colour aliases that mirror `--{Role}-Bold` values but use a
 * `--JioRibbon-` prefix so they survive `[data-surface]` remapping (only standard
 * role prefixes are in the surface token allowlist).
 *
 * Shared between platform-level injection (FoundationStyleProvider) and the
 * artboard-scoped sub-brand stylesheet (ArtboardSubBrandStyleTags).
 */

export interface RibbonAliasSource {
  /** Alias custom property emitted in the wrapper stylesheet. */
  alias: string;
  /** Regex matching the source `--{Role}-Bold: ...` declaration in brand CSS. */
  pattern: RegExp;
}

export const RIBBON_ALIAS_SOURCES: readonly RibbonAliasSource[] = [
  { alias: '--JioRibbon-color1', pattern: /--Primary-Bold:\s*([^;!]+)/   },
  { alias: '--JioRibbon-color2', pattern: /--Secondary-Bold:\s*([^;!]+)/ },
  { alias: '--JioRibbon-color3', pattern: /--Sparkle-Bold:\s*([^;!]+)/   },
];
