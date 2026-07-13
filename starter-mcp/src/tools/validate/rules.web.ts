/**
 * Web (react / @jds4/oneui-react) rule-set.
 *
 * CSS-custom-property world: surfaces are painted with `var(--…)`, tokens are
 * `var(--Token-Name)`, fonts route through `var(--Typography-Font-*)`. These
 * rules are meaningless for React Native (see rules.native.ts).
 *
 * Shared checks (unknown-prop, non-released-component) are composed by the tool
 * — this module returns only the web-specific issues.
 */
import {
  type RuleContext,
  type ValidationIssue,
  walkAST,
  checkBannedModuleImports,
  checkUndefinedComponents,
  checkUnknownOneuiImportPath,
  collectFontLiterals,
} from './shared.js';

/** OneUI surfaces that are legitimate non-component imports in a web app. */
const WEB_ONEUI_IMPORT_EXTRAS = ['@jds4/oneui-icons-jio'] as const;

// ---- inline surface paint --------------------------------------------------

const SURFACE_MODES = ['Bold', 'Subtle', 'Moderate', 'Minimal', 'Ghost', 'Elevated', 'Default'] as const;
const SURFACE_PAINT_RE = new RegExp(
  `\\b(?:background|backgroundColor)\\s*:\\s*['"\`]var\\s*\\(\\s*--[A-Za-z0-9-]*(?:${SURFACE_MODES.join('|')})[^)]*\\)['"\`]`,
  'g',
);

function checkInlineSurfacePaint(lines: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < lines.length; i++) {
    SURFACE_PAINT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = SURFACE_PAINT_RE.exec(lines[i])) !== null) {
      issues.push({
        line: i + 1,
        col: m.index + 1,
        severity: 'error',
        rule: 'inline-surface-paint',
        message: `Inline background with surface token "${m[0].trim()}" bypasses the CSS token-remapping cascade — child tokens will not adapt to the surface.`,
        suggestion:
          'Wrap in <Surface mode="..."> instead. E.g.: <Surface mode="bold">...</Surface> — all child tokens auto-remap with zero JS overhead.',
      });
    }
  }
  return issues;
}

// ---- legacy tokens ---------------------------------------------------------

interface LegacyRule {
  pattern: RegExp;
  unified(match: RegExpExecArray): string;
}

const LEGACY_RULES: LegacyRule[] = [
  { pattern: /--Typography-Size-([A-Za-z0-9-]+)/g, unified: (m) => `--Body-${m[1]}-FontSize (or --Headline-${m[1]}-FontSize, --Title-${m[1]}-FontSize — use the role-explicit token matching the text role)` },
  { pattern: /--Typography-Weight-([A-Za-z0-9-]+)/g, unified: () => '--Body-FontWeight-High/Medium/Low or --Label-FontWeight-Medium/Low' },
  { pattern: /--Typography-LineHeight-([A-Za-z0-9-]+)/g, unified: (m) => `--Body-${m[1]}-LineHeight (or --Headline-${m[1]}-LineHeight — pair with the matching FontSize token)` },
  { pattern: /--Surface-Bold\b/g, unified: () => '--Primary-Bold' },
  { pattern: /--Surface-Subtle\b/g, unified: () => '--Primary-Subtle' },
  { pattern: /--Surface-Moderate\b/g, unified: () => '--Primary-Moderate' },
  { pattern: /--Surface-Minimal\b/g, unified: () => '--Primary-Minimal' },
  { pattern: /--Surface-Ghost\b/g, unified: () => '--Primary-Ghost' },
  { pattern: /--([A-Za-z]+)-FG-Bold\b/g, unified: (m) => `--${m[1]}-Bold` },
  { pattern: /--([A-Za-z]+)-BG-Subtle\b/g, unified: (m) => `--${m[1]}-Subtle` },
  { pattern: /--([A-Za-z]+)-BG-Moderate\b/g, unified: (m) => `--${m[1]}-Moderate` },
  { pattern: /--Text-OnBold-High\b/g, unified: () => '--Primary-Bold-High' },
  { pattern: /--Text-OnBold-Medium\b/g, unified: () => '--Primary-Bold-Medium' },
  { pattern: /--([A-Za-z]+)-Default-High\b/g, unified: (m) => `--${m[1]}-High` },
  { pattern: /--([A-Za-z]+)-Default-Hover\b/g, unified: (m) => `--${m[1]}-Hover` },
];

function checkLegacyTokens(lines: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < lines.length; i++) {
    for (const rule of LEGACY_RULES) {
      rule.pattern.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rule.pattern.exec(lines[i])) !== null) {
        issues.push({
          line: i + 1,
          col: m.index + 1,
          severity: 'error',
          rule: 'legacy-token',
          message: `Legacy token "${m[0]}" — backward-compat alias scheduled for removal.`,
          suggestion: `Use the role-explicit token: ${rule.unified(m)}`,
        });
      }
    }
  }
  return issues;
}

// ---- missing font-family (web heuristic) -----------------------------------

const WEB_FONT_HINT =
  'Route the font through a token: var(--Typography-Font-Text) (body/label/UI) or ' +
  'var(--Typography-Font-Heading) (display/headline/title), or the role token ' +
  '(--Body-FontFamily, --Label-FontFamily, …). It resolves to JioType Var under Jio and ' +
  "to each brand's font otherwise — a literal pins the typeface and breaks brand switching.";

function checkMissingFontFamily(ast: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!ast) return issues;
  walkAST(ast, (node) => {
    if (node.type !== 'JSXAttribute') return;
    const attrName = node.name as Record<string, unknown> | undefined;
    if (!attrName || attrName.name !== 'style') return;
    const val = node.value as Record<string, unknown> | undefined;
    if (!val || val.type !== 'JSXExpressionContainer') return;
    const expr = val.expression as Record<string, unknown> | undefined;
    if (!expr || expr.type !== 'ObjectExpression') return;

    let hasFontSize = false;
    let hasFontFamily = false;
    for (const p of (expr.properties as unknown[]) ?? []) {
      const prop = p as Record<string, unknown>;
      if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') continue;
      const key = prop.key as Record<string, unknown> | undefined;
      const keyName =
        key?.type === 'Identifier' ? (key.name as string)
        : key?.type === 'StringLiteral' ? (key.value as string)
        : '';
      if (keyName === 'fontSize' || keyName === 'font-size') hasFontSize = true;
      if (keyName === 'fontFamily' || keyName === 'font-family' || keyName === 'font') hasFontFamily = true;
    }
    if (hasFontSize && !hasFontFamily) {
      const loc = (node.loc as Record<string, Record<string, number>> | undefined)?.start;
      issues.push({
        line: loc?.line ?? 0,
        col: (loc?.column ?? 0) + 1,
        severity: 'warning',
        rule: 'missing-font-family',
        message:
          'Inline style sets fontSize but no font-family token. If the font is not supplied by a CSS class, it will fall back to the default instead of the brand font.',
        suggestion:
          'Add fontFamily: "var(--Typography-Font-Text)" (or the matching role token) alongside the fontSize, and pair with the --*-LineHeight token.',
      });
    }
  });
  return issues;
}

// ---- external icon libraries (web) -----------------------------------------

const BANNED_ICON_LIBS_WEB = [
  'hugeicons-react', '@phosphor-icons/react', '@tabler/icons-react', '@remixicon/react',
  'lucide-react', 'react-icons', '@fortawesome/react-fontawesome', '@mui/icons-material', '@ant-design/icons',
];

// ---- forbidden Base UI imports (web) ---------------------------------------
// Base UI (@base-ui/react) is the headless layer @jds4/oneui-react is built on.
// End-user app code must never import it directly — that bypasses OneUI's brand
// tokens, Surface context, shape/typography and a11y wiring. Mirrors the native
// forbidden-rn-primitive guard (web side only).

/** Base UI primitive → released OneUI equivalent (for a targeted suggestion). */
const BASE_UI_TO_ONEUI: Record<string, string> = {
  Dialog: 'Modal', AlertDialog: 'Modal', Tooltip: 'Tooltip',
  Slider: 'Slider (or TouchSlider)', Switch: 'Switch',
  Checkbox: 'Checkbox (or CheckboxField)', Radio: 'Radio (or RadioField)',
  RadioGroup: 'RadioGroup (or RadioField)', Tabs: 'Tabs',
  Progress: 'CircularProgressIndicator', Meter: 'CircularProgressIndicator',
  Avatar: 'Avatar', Separator: 'Divider', Field: 'InputField', Fieldset: 'InputField',
  Input: 'Input (or InputField)', NumberField: 'Stepper (or Input)',
  Toggle: 'SelectableButton (or SelectableIconButton)', ToggleGroup: 'SelectableButton group',
};

function pascalFromSegment(seg: string): string {
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function baseUiSuggestion(names: string[]): string {
  const mapped = [...new Set(names.map((n) => BASE_UI_TO_ONEUI[n]).filter(Boolean))];
  const lead = mapped.length
    ? `Use the OneUI equivalent from @jds4/oneui-react (${mapped.join(', ')}).`
    : 'Use the equivalent released component from @jds4/oneui-react, or compose the UI from released components.';
  return `${lead} Base UI is internal to OneUI — importing it directly bypasses brand tokens, Surface context and a11y. Call list_components for the released set.`;
}

function checkForbiddenBaseUi(ast: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!ast) return issues;
  walkAST(ast, (node) => {
    if (node.type !== 'ImportDeclaration') return;
    const src = (node.source as Record<string, unknown> | undefined)?.value;
    if (typeof src !== 'string') return;
    if (src !== '@base-ui/react' && !src.startsWith('@base-ui/')) return;

    const names: string[] = [];
    for (const s of (node.specifiers as unknown[]) ?? []) {
      const spec = s as Record<string, unknown>;
      const imported = spec.imported as Record<string, unknown> | undefined;
      if (imported?.type === 'Identifier') names.push(imported.name as string);
    }
    const seg = src.split('/')[2]; // @base-ui/react/<seg>
    if (seg) names.push(pascalFromSegment(seg));

    const loc = (node.loc as Record<string, Record<string, number>> | undefined)?.start;
    issues.push({
      line: loc?.line ?? 0,
      col: (loc?.column ?? 0) + 1,
      severity: 'error',
      rule: 'forbidden-base-ui',
      message: `Importing from "${src}" is not allowed in a OneUI app. Base UI is the headless layer @jds4/oneui-react wraps — using it directly bypasses brand tokens, Surface context and a11y.`,
      suggestion: baseUiSuggestion(names),
    });
  });
  return issues;
}

// ---- entry -----------------------------------------------------------------

export function collectWebIssues(ctx: RuleContext): ValidationIssue[] {
  return [
    ...checkInlineSurfacePaint(ctx.lines),
    ...checkLegacyTokens(ctx.lines),
    ...collectFontLiterals(ctx.lines, WEB_FONT_HINT),
    ...checkMissingFontFamily(ctx.ast),
    ...checkForbiddenBaseUi(ctx.ast),
    ...checkUndefinedComponents(ctx.ast, ctx.released, ctx.pkgName),
    ...checkUnknownOneuiImportPath(ctx.ast, ctx.pkgName, WEB_ONEUI_IMPORT_EXTRAS),
    ...checkBannedModuleImports(ctx.lines, BANNED_ICON_LIBS_WEB, (lib) => ({
      message: `External icon library "${lib}" is not allowed in a OneUI app. It bloats the bundle and breaks brand consistency.`,
      suggestion:
        'Use OneUI icons only: import "@jds4/oneui-icons-jio" once (side-effect) and render <Icon icon="..." /> from @jds4/oneui-react. Call get_component_info("Icon") for available names.',
    })),
  ];
}
