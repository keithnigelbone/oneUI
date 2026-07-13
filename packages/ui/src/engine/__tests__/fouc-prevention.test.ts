/**
 * FOUC (Flash of Unstyled Content) Prevention Tests
 *
 * Validates the token definitions, cache logic, and fallback chains
 * that prevent users from seeing a visual flash on page load or brand switch.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getAppearanceRolePrefixes } from '@oneui/shared';

// ============================================================================
// Helpers
// ============================================================================

const TOKENS_CSS_DIR = path.resolve(__dirname, '../../../../tokens/src/css');
const COMPONENTS_DIR = path.resolve(__dirname, '../../components');

/** Read a CSS file and return its contents */
function readCSS(relativePath: string): string {
  return fs.readFileSync(path.join(TOKENS_CSS_DIR, relativePath), 'utf-8');
}

/** Collect all .module.css files under a directory recursively */
function findModuleCSSFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findModuleCSSFiles(full));
    } else if (entry.name.endsWith('.module.css')) {
      results.push(full);
    }
  }
  return results;
}

/** Extract all --Token-Name definitions from CSS content */
function extractDefinedTokens(css: string): Set<string> {
  const tokens = new Set<string>();
  const re = /^\s*(--[A-Za-z][A-Za-z0-9_-]*)\s*:/gm;
  let match;
  while ((match = re.exec(css)) !== null) {
    tokens.add(match[1]);
  }
  return tokens;
}

/** Extract all var(--Token-Name) references from CSS, with fallback info */
function extractVarReferences(css: string): Array<{ token: string; hasFallback: boolean; line: string }> {
  const refs: Array<{ token: string; hasFallback: boolean; line: string }> = [];
  const lines = css.split('\n');

  for (const line of lines) {
    if (line.trim().startsWith('/*') || line.trim().startsWith('*') || line.trim().startsWith('//')) continue;

    const re = /var\(\s*(--[A-Za-z][A-Za-z0-9_-]*)\s*(?:,\s*([^)]+))?\)/g;
    let match;
    while ((match = re.exec(line)) !== null) {
      refs.push({
        token: match[1],
        hasFallback: match[2] !== undefined,
        line: line.trim(),
      });
    }
  }
  return refs;
}

// ============================================================================
// Module-level caches — read once, reuse across tests
// ============================================================================

/** Cached module CSS file list */
const MODULE_CSS_FILES = findModuleCSSFiles(COMPONENTS_DIR);

/** All tokens defined across the static CSS token files */
const ALL_STATIC_TOKENS: Set<string> = (() => {
  const files = ['primitives.css', 'semantic.css', 'themes/light.css', 'themes/dark.css'];
  const tokens = new Set<string>();
  for (const file of files) {
    const filePath = path.join(TOKENS_CSS_DIR, file);
    if (fs.existsSync(filePath)) {
      for (const t of extractDefinedTokens(fs.readFileSync(filePath, 'utf-8'))) {
        tokens.add(t);
      }
    }
  }
  return tokens;
})();

/** Commonly read source files — cached at module level */
const SOURCE_CACHE: Record<string, string> = {};
function readSource(absolutePath: string): string {
  if (!SOURCE_CACHE[absolutePath]) {
    SOURCE_CACHE[absolutePath] = fs.readFileSync(absolutePath, 'utf-8');
  }
  return SOURCE_CACHE[absolutePath];
}

const LAYOUT_PATH = path.resolve(__dirname, '../../../../../apps/platform/src/app/layout.tsx');
const PLATFORM_LAYOUT_PATH = path.resolve(__dirname, '../../../../../apps/platform/src/app/(platform)/layout.tsx');
const APP_READY_PRELOADER_PATH = path.resolve(__dirname, '../../../../../apps/platform/src/app/(platform)/_layout/AppReadyPreloader.tsx');
const HOOK_PATH = path.resolve(__dirname, '../../hooks/useBrandCSS.ts');
const PROVIDER_PATH = path.resolve(__dirname, '../../../../../apps/platform/src/components/FoundationStyleProvider.tsx');
const PLATFORM_CONTEXT_PATH = path.resolve(__dirname, '../../../../../apps/platform/src/contexts/PlatformContext.tsx');
const USER_PREFS_PATH = path.resolve(__dirname, '../../../../../apps/platform/src/hooks/useUserPreferences.ts');
const DECORATOR_PATH = path.resolve(__dirname, '../../../../../apps/storybook/.storybook/BrandStyleDecorator.tsx');
const PREVIEW_PATH = path.resolve(__dirname, '../../../../../apps/storybook/.storybook/preview.ts');

// ============================================================================
// Test 1: Stroke token definitions
// ============================================================================

describe('Test 1: Stroke token definitions', () => {
  it('defines --Stroke-2XL and --Stroke-9XL in primitives.css', () => {
    const primitives = readCSS('primitives.css');
    const tokens = extractDefinedTokens(primitives);
    expect(tokens.has('--Stroke-2XL')).toBe(true);
    expect(tokens.has('--Stroke-9XL')).toBe(true);
  });

  it('keeps --Stroke-2XL fixed and maps 3XL-9XL through the dimension f-scale', () => {
    const primitives = readCSS('primitives.css');
    const stroke2xl = primitives.match(/--Stroke-2XL\s*:\s*([^;]+)/);
    const stroke3xl = primitives.match(/--Stroke-3XL\s*:\s*([^;]+)/);
    const stroke9xl = primitives.match(/--Stroke-9XL\s*:\s*([^;]+)/);
    expect(stroke2xl?.[1].trim()).toBe('3px');
    expect(stroke3xl?.[1].trim()).toBe('var(--Dimension-f-6)');
    expect(stroke9xl?.[1].trim()).toBe('var(--Dimension-f0)');
  });
});

// ============================================================================
// Test 2: Brand CSS cache conditional logic
// ============================================================================

describe('Test 2: Brand CSS cache script logic', () => {
  it('blocking script forces global theme scope and restores only non-legacy cached brand CSS', () => {
    const layout = readSource(LAYOUT_PATH);
    // legacy theme-scope values are coerced before cached CSS is restored
    expect(layout).toContain("localStorage.getItem('oneui-studio:theme-scope')");
    expect(layout).toContain("document.documentElement.setAttribute('data-theme-scope','global')");
    expect(layout).not.toContain("scope==='preview'");
    expect(layout).not.toContain("scope==='scoped'");
    expect(layout).toContain("localStorage.removeItem('oneui-studio:brand-css')");
    // brand CSS is read from localStorage and restored
    expect(layout).toContain("localStorage.getItem('oneui-studio:brand-css')");
    // restoration target must be the same style id the React side updates
    // in-place (no DOM gap); see <style id="oneui-foundation-tokens"> assertion below
    expect(layout).toContain("getElementById('oneui-foundation-tokens')");
  });

  it('script creates style element with the same id as the live style tag (no DOM gap)', () => {
    const layout = readSource(LAYOUT_PATH);
    // Must use 'oneui-foundation-tokens' so the imperative useEffect in
    // FoundationStyleProvider finds and updates it in-place — no removal/insertion gap.
    expect(layout).toContain("s.id='oneui-foundation-tokens'");
    expect(layout).not.toContain("s.id='oneui-brand-css-cache'");
  });
});

// ============================================================================
// Test 3: useBrandCSS returns empty for 'none' mode
// ============================================================================

describe('Test 3: useBrandCSS injection mode behavior', () => {
  it("useBrandCSS returns '' for mode=none and null when data is loading", () => {
    const source = readSource(HOOK_PATH);
    // mode=none → intentionally empty ('' not null — caller should clear the style tag)
    expect(source).toMatch(/if\s*\(\s*resolvedMode\s*===\s*['"]none['"]\s*\)\s*return\s*['"]['"];?/);
    // data not yet loaded → null (caller keeps previous CSS, no blank frame)
    expect(source).toMatch(/if\s*\(\s*!hasFoundation\s*\)\s*return\s+null/);
  });
});

// ============================================================================
// Test 4: useBrandCSS wraps output for 'global' mode
// ============================================================================

describe('Test 4: useBrandCSS global mode wrapping', () => {
  it('useBrandCSS calls wrapCSSForInjection with resolvedMode and the composed additional-blocks CSS', () => {
    const source = readSource(HOOK_PATH);
    // Phase 6 rename: `useBrandCSSNew` → `useBrandCSS`. The hook now composes
    // surface-context / font-rendering / grid blocks into a single
    // `additionalBlocks` string before passing it to wrapCSSForInjection, so
    // the assertion now checks for that call site rather than a specific
    // variable name.
    expect(source).toMatch(
      /wrapCSSForInjection\(\s*rawCSS\s*,\s*resolvedMode\s*,\s*(additionalBlocks|surfaceContextCSS)/,
    );
    // `additionalBlocks` must include surface context + font rendering + grid.
    expect(source).toContain('surfaceContextCSS');
    expect(source).toContain('renderingCSS');
    expect(source).toContain('gridCSS');
  });
});

// ============================================================================
// Test 5: previousCSSRef bridge during brand switch
// ============================================================================

describe('Test 5: CSS bridge pattern in providers', () => {
  it('FoundationStyleProvider holds previous CSS on loading or accidental empty output', () => {
    const source = readSource(PROVIDER_PATH);
    expect(source).toContain('previousCSSRef');
    // Must avoid `cssContent || previousCSSRef.current` so cssContent=''
    // (mode=none) can intentionally clear, while loading keeps old CSS.
    expect(source).toContain('shouldHoldPrevious ? previousCSSRef.current : (cssContent ?? \'\')');
    expect(source).toContain('shouldHoldPrevious');
    expect(source).toContain("cssContent === null");
    expect(source).toContain("cssContent === '' && !isIntentionalClear");
  });

  it('BrandStyleInjector (Storybook) uses null-aware ?? bridge', () => {
    const source = readSource(DECORATOR_PATH);
    expect(source).toContain('previousCSSRef');
    expect(source).toContain('cssContent ?? previousCSSRef.current');
    expect(source).toContain('cssContent !== null');
  });
});

describe('Test 5b: Brand Theme is the only platform theme-scope runtime', () => {
  it('FoundationStyleProvider always uses the active brand and applies sub-brand accents', () => {
    const source = readSource(PROVIDER_PATH);
    expect(source).toContain('const injectionBrandId = editingBrandId ??');
    expect(source).toContain('applySubBrandAccents(injectionFoundationData, currentSubBrand)');
    expect(source).not.toContain("themeScope === 'global'");
    expect(source).not.toContain("themeScope === 'preview'");
  });

  it('PlatformContext and user preferences normalize legacy theme scopes to global', () => {
    const platformContext = readSource(PLATFORM_CONTEXT_PATH);
    const userPrefs = readSource(USER_PREFS_PATH);
    expect(platformContext).toContain("localStorage.setItem('oneui-studio:theme-scope', 'global')");
    expect(platformContext).toContain("updatePref({ themeScope: 'global' })");
    expect(userPrefs).toContain("return { ...patch, themeScope: 'global' }");
    expect(userPrefs).toContain("row.themeScope && row.themeScope !== 'global'");
  });
});

// ============================================================================
// Test 6: Storybook bridge pattern (no key remount)
// ============================================================================

describe('Test 6: Storybook atomic CSS swap', () => {
  it('preview.ts does NOT use key={brandId} on BrandStyleInjector', () => {
    const source = readSource(PREVIEW_PATH);
    const injectorCall = source.match(/createElement\(\s*BrandStyleInjector,\s*\{([^}]+)\}/s);
    expect(injectorCall).not.toBeNull();
    expect(injectorCall![1]).not.toContain('key:');
    expect(injectorCall![1]).not.toContain('key :');
  });

  it('preview.ts does NOT use opacity transitions on story wrapper', () => {
    const source = readSource(PREVIEW_PATH);
    expect(source).not.toContain('opacity:');
    expect(source).not.toContain('opacity :');
  });
});

// ============================================================================
// Test 6b: Platform — no wrapper div, pure bridge
// ============================================================================

describe('Test 6b: Platform atomic CSS swap (shared hook, no JSX style tag)', () => {
  it('FoundationStyleProvider delegates injection to useStyleInjection (not via JSX)', () => {
    const source = readSource(PROVIDER_PATH);
    // No opacity wrapper, no setSwitching — shared hook handles atomic swap
    expect(source).not.toContain('setSwitching');
    expect(source).not.toContain('opacity:');
    // Uses shared useStyleInjection hook instead of inline useInsertionEffect
    expect(source).toContain('useStyleInjection(STYLE_ELEMENT_ID, effectiveCSS)');
    expect(source).not.toContain("dangerouslySetInnerHTML={{ __html: effectiveCSS }}");
    // Children rendered directly
    expect(source).toContain('{children}');
  });

  it('FoundationStyleProvider loads component overrides from the active theme brand', () => {
    const source = readSource(PROVIDER_PATH);
    expect(source).toContain('const componentOverrideBrandId = injectionBrandId');
    expect(source).not.toContain("const componentOverrideBrandId = themeScope === 'global'");
    expect(source).toContain('componentOverrideBrandId ? { brandId: componentOverrideBrandId }');
  });

  it('useStyleInjection hook manages style tag imperatively via .textContent', () => {
    const hookPath = path.resolve(__dirname, '../../hooks/useStyleInjection.ts');
    const source = readSource(hookPath);
    expect(source).toContain('.textContent = next');
    expect(source).toContain('data-brand-switching');
    expect(source).toContain('data-brand-ready');
  });
});

// ============================================================================
// Test 6c: HMR ping error suppression
// ============================================================================

describe('Test 6c: HMR ping error suppression', () => {
  it('layout.tsx suppresses Convex HMR ping unhandled rejections', () => {
    const source = readSource(LAYOUT_PATH);
    expect(source).toContain('unhandledrejection');
    expect(source).toContain('unrecognized HMR message');
    expect(source).toContain('preventDefault');
  });
});

// ============================================================================
// Test 7: Preloader gate conditions
// ============================================================================

describe('Test 7: Preloader gate conditions', () => {
  it('app-ready effect always gates on foundationData', () => {
    // After the (platform)/layout.tsx decomposition the preloader handshake
    // moved to its own effects-only component under _layout/.
    const source = readSource(APP_READY_PRELOADER_PATH);

    // Always wait for foundationData — no themeScope exception
    expect(source).toContain('foundationData === undefined');

    // The effect that fires `oneui:app-ready` must include foundationData in
    // its deps — otherwise the preloader can be dismissed before brand CSS
    // is injected, producing a flash. Look for any useEffect block that both
    // dispatches the event and depends on foundationData.
    const appReadyEffect = source.match(
      /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?oneui:app-ready[\s\S]*?\},\s*\[([^\]]+)\]\s*\)/
    );
    expect(appReadyEffect).not.toBeNull();
    const deps = appReadyEffect![1];
    expect(deps).toContain('foundationData');
  });
});

// ============================================================================
// Test 8: Component CSS fallback chains for V4 tokens
// ============================================================================

describe('Test 8: V4 token fallback chains in component CSS', () => {
  /** Role-prefix set used to scope the check to brand-emitted tokens. */
  const V4_ROLE_PREFIXES = getAppearanceRolePrefixes();

  /**
   * Legacy V4 naming sub-patterns the engine is retiring (PR #21 / #22).
   * Matches `-FG-`, `-BG-`, and `-Default-<suffix>` segments.
   * Unified tokens like `--Primary-Bold`, `--Primary-High`, `--Primary-Subtle-Hover`
   * are always emitted by the engine and therefore never need fallbacks.
   */
  const V4_LEGACY_PATTERN = /(-FG-|-BG-|-Default-)/;

  /**
   * Platform UI directories — these components only render inside the platform
   * app where brand CSS is always loaded via FoundationStyleProvider. V4 tokens
   * without fallbacks are acceptable here.
   */
  const PLATFORM_UI_DIRS = [
    'Foundations/', 'Brand/', 'Platform/', 'ComponentTokenEditor/',
  ];

  // Regression guard: the engine no longer emits V4-legacy role aliases
  // (`--{Role}-FG-*`, `--{Role}-BG-*`, `--{Role}-Default-*`) — `cssGenNew.ts`
  // only emits unified names like `--Primary-Bold`, `--Primary-High`.
  // Component CSS has been swept clean of those legacy patterns.
  //
  // This test locks that in: if any component CSS reintroduces a legacy
  // role token without a literal fallback, the name will not resolve once
  // brand CSS injects (because the engine doesn't emit it), and the
  // component will render with no value until the resolver chain is fixed.
  // Platform-only UI is exempted below (it only renders where brand CSS
  // is already loaded via FoundationStyleProvider).
  it('design system components do not reference V4 legacy role tokens without fallback', () => {
    expect(MODULE_CSS_FILES.length).toBeGreaterThan(0);

    const violations: string[] = [];

    for (const file of MODULE_CSS_FILES) {
      const relPath = path.relative(COMPONENTS_DIR, file);
      if (PLATFORM_UI_DIRS.some((dir) => relPath.startsWith(dir))) continue;

      const css = fs.readFileSync(file, 'utf-8');
      const refs = extractVarReferences(css);

      for (const ref of refs) {
        const isRoleToken = V4_ROLE_PREFIXES.some((prefix) => ref.token.startsWith(prefix));
        const isV4Legacy = isRoleToken && V4_LEGACY_PATTERN.test(ref.token);
        if (isV4Legacy && !ref.hasFallback) {
          violations.push(`${relPath}: ${ref.token} has no fallback`);
        }
      }
    }

    if (violations.length > 0) {
      expect(violations).toEqual([]);
    }
  });

  it('platform UI components are allowed V4 tokens without fallbacks', () => {
    const platformFiles = MODULE_CSS_FILES.filter((file) => {
      const relPath = path.relative(COMPONENTS_DIR, file);
      return PLATFORM_UI_DIRS.some((dir) => relPath.startsWith(dir));
    });
    expect(platformFiles.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Test 9: Token completeness — static CSS definitions
// ============================================================================

describe('Test 9: Token definition completeness', () => {
  /** Token families that are only generated by useBrandCSS (V4 role tokens) */
  const DYNAMIC_TOKEN_PREFIXES = [
    ...getAppearanceRolePrefixes(),
    '--Typography-Font-', '--Typography-Weight-',
  ];

  /** Component-level override tokens (e.g., --Button-backgroundColor) */
  const COMPONENT_TOKEN_PREFIX = /^--[A-Z][a-z]+-/;

  /**
   * Runtime CSS custom properties set by JavaScript / Base UI at runtime.
   * These are NOT design tokens — they're layout/position values computed
   * dynamically (e.g., Base UI's anchor positioning, tab indicator geometry).
   */
  const RUNTIME_CSS_PROPERTIES = new Set([
    '--transform-origin',
    '--anchor-width',
    '--available-height',
    '--active-tab-left',
    '--active-tab-width',
    '--active-tab-height',
    '--active-tab-top',
  ]);

  function isExemptToken(token: string): boolean {
    if (DYNAMIC_TOKEN_PREFIXES.some((p) => token.startsWith(p))) return true;
    if (COMPONENT_TOKEN_PREFIX.test(token)) return true;
    if (RUNTIME_CSS_PROPERTIES.has(token)) return true;
    return false;
  }

  function collectUndefinedTokenViolations(file: string): string[] {
    const css = fs.readFileSync(file, 'utf-8');
    const refs = extractVarReferences(css);
    const relPath = path.relative(COMPONENTS_DIR, file);
    return refs
      .filter((ref) => !isExemptToken(ref.token))
      .filter((ref) => !ALL_STATIC_TOKENS.has(ref.token) && !ref.hasFallback)
      .map((ref) => `${relPath}: ${ref.token} is undefined and has no fallback`);
  }

  it('all non-dynamic, non-component token references in component CSS are defined in static CSS or have fallbacks', () => {
    const violations = MODULE_CSS_FILES.flatMap(collectUndefinedTokenViolations);
    if (violations.length > 0) {
      console.warn('Undefined token references without fallbacks:', violations);
    }
    expect(violations).toEqual([]);
  });

  it('font preconnect hints are present in layout.tsx', () => {
    const source = readSource(LAYOUT_PATH);
    expect(source).toContain('rel="preconnect"');
    expect(source).toContain('fonts.googleapis.com');
    expect(source).toContain('fonts.gstatic.com');
  });
});

// ============================================================================
// Test 10: FOUC prevention — transition suppression, injection phase, font display
// ============================================================================

const PREVIEW_CSS_PATH = path.resolve(__dirname, '../../../../../apps/storybook/.storybook/preview.css');
const FONTS_PATH = path.resolve(__dirname, '../../../../shared/src/data/fonts.ts');

describe('Test 10: Storybook transition suppression', () => {
  it('preview.css contains [data-brand-switching] rule to suppress transitions', () => {
    const css = readSource(PREVIEW_CSS_PATH);
    expect(css).toContain('[data-brand-switching]');
    expect(css).toContain('transition: none !important');
  });
});

describe('Test 11: ComponentOverrideInjector uses useStyleInjection', () => {
  it('BrandStyleDecorator does not use dangerouslySetInnerHTML for component tokens', () => {
    const source = readSource(DECORATOR_PATH);
    // ComponentOverrideInjector should use useStyleInjection, not JSX <style>
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });

  it('BrandStyleDecorator uses useStyleInjection for component tokens', () => {
    const source = readSource(DECORATOR_PATH);
    expect(source).toContain("useStyleInjection(COMPONENT_STYLE_ID");
  });
});

describe('Test 12: Google Fonts use display=optional', () => {
  it('fonts.ts uses display=optional (not display=swap) to prevent font flash', () => {
    const source = readSource(FONTS_PATH);
    expect(source).toContain('display=optional');
    expect(source).not.toContain('display=swap');
  });

  it('layout.tsx Inter font uses display optional', () => {
    const source = readSource(LAYOUT_PATH);
    expect(source).toContain("display: 'optional'");
    expect(source).not.toContain("display: 'swap'");
  });
});
