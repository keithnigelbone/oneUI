/**
 * React Native (@oneui/ui-native) rule-set.
 *
 * No CSS / `var(--…)` world here. The native sins are: painting with a LITERAL
 * colour in a style/prop (kb-rn's FORBIDDEN_COLOR_LITERAL), importing raw RN UI
 * primitives instead of @oneui/ui-native (the AGENTS.md "only View/ScrollView"
 * rule), literal typefaces, and non-OneUI icon libraries.
 *
 * Shared checks (unknown-prop against the native catalog, non-released-component
 * against the native barrel) are composed by the tool — this module returns only
 * the native-specific issues.
 */
import {
  type RuleContext,
  type ValidationIssue,
  walkAST,
  checkBannedModuleImports,
  collectFontLiterals,
} from './shared.js';

// ---- literal colour in a style / colour prop -------------------------------

// e.g. backgroundColor: '#fff' | color: 'rgba(0,0,0,.5)' | borderColor: 'oklch(...)'
const LITERAL_COLOR_RE =
  /\b(\w*[Cc]olor)\s*:\s*(['"`])(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\))\2/g;

function checkLiteralColor(lines: string[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (let i = 0; i < lines.length; i++) {
    LITERAL_COLOR_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = LITERAL_COLOR_RE.exec(lines[i])) !== null) {
      const prop = m[1];
      const isFill = /^(background|border|shadow|overlay)/i.test(prop);
      issues.push({
        line: i + 1,
        col: m.index + 1,
        severity: 'error',
        rule: 'literal-color',
        message: `Literal colour ${m[3]} in \`${prop}\`. Hardcoded colours bypass the brand cascade and Surface context.`,
        suggestion: isFill
          ? "Don't paint directly. Wrap in <Surface mode=\"…\"> and let the surface fill resolve, or set the component's `appearance` role — the brand engine picks the right token."
          : 'Use the role tokens from useSurfaceTokens(appearance) (or the component\'s `appearance`/`emphasis` props) instead of a literal colour.',
      });
    }
  }
  return issues;
}

// ---- literal / unresolvable spacing value on Container/Surface ------------

// Mirrors `resolveSpacingPx` in `@oneui/ui-native/utils/layoutStyle.ts` exactly —
// this rule must never disagree with what the runtime actually resolves.
// NativeSpacingKey values ('24', '28', '32', '40'...) are legitimate f-scale
// steps, NOT raw pixel counts — do not flag them. Only flag values that
// `resolveSpacingPx` would return `undefined` for (typos, invented numbers,
// px-suffixed strings, made-up token paths).
const NATIVE_SPACING_KEYS = new Set([
  '0', '0-5', '1', '1-5', '2', '2-5', '3', '3-5', '4', '4-5', '5', '5-5',
  '6', '7', '8', '9', '10', '12', '14', '16', '18', '20', '24', '28', '32', '40',
  'Margin', 'Gutter',
]);

const SPACING_PROP_NAMES = new Set([
  'gap', 'padding', 'paddingX', 'paddingY',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
]);

/** True iff `resolveSpacingPx(value, spacing)` would resolve (mirrors its normalisation). */
function isResolvableSpacingValue(raw: string): boolean {
  if (NATIVE_SPACING_KEYS.has(raw)) return true;
  let key = raw.trim();
  const lower = key.toLowerCase();
  if (key.includes('/')) {
    if (lower.includes('margin')) key = 'Margin';
    else if (lower.includes('gutter')) key = 'Gutter';
    else key = key.split('/').pop()!.trim();
  } else if (key.startsWith('Spacing-')) {
    key = key.slice('Spacing-'.length);
  } else if (lower === 'margin') key = 'Margin';
  else if (lower === 'gutter') key = 'Gutter';
  return NATIVE_SPACING_KEYS.has(key);
}

const SPACING_SCOPED_COMPONENTS = new Set(['Container', 'Surface']);

function checkLiteralSpacing(ast: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!ast) return issues;
  walkAST(ast, (node) => {
    if (node.type !== 'JSXOpeningElement') return;
    const nameNode = node.name as Record<string, unknown>;
    if (nameNode.type !== 'JSXIdentifier') return;
    const compName = nameNode.name as string;
    if (!SPACING_SCOPED_COMPONENTS.has(compName)) return;

    for (const attr of (node.attributes as unknown[]) ?? []) {
      const a = attr as Record<string, unknown>;
      if (a.type !== 'JSXAttribute') continue;
      const attrName = a.name as Record<string, unknown>;
      if (attrName.type !== 'JSXIdentifier') continue;
      const propName = attrName.name as string;
      if (!SPACING_PROP_NAMES.has(propName)) continue;

      const value = a.value as Record<string, unknown> | null;
      if (!value || value.type !== 'StringLiteral') continue; // expressions/vars — can't statically check
      const raw = value.value as string;
      if (isResolvableSpacingValue(raw)) continue;

      const loc = (attrName.loc as Record<string, Record<string, number>> | undefined)?.start;
      issues.push({
        line: loc?.line ?? 0,
        col: (loc?.column ?? 0) + 1,
        severity: 'error',
        rule: 'literal-spacing',
        message: `"${propName}" on <${compName}> is "${raw}" — not a valid spacing token. resolveSpacingPx() will silently drop this at runtime.`,
        suggestion:
          'Use a canonical NativeSpacingKey (e.g. "6"), a Figma "dimensions/spacings/N" path, or a "Spacing-N" alias — never a raw pixel string.',
      });
    }
  });
  return issues;
}

// ---- forbidden raw RN UI primitives (only View + ScrollView allowed) -------

/** RN primitive → the @oneui/ui-native replacement. View/ScrollView are allowed. */
const FORBIDDEN_RN_PRIMITIVES: Record<string, string> = {
  Text: 'Text',
  Image: 'Image',
  ImageBackground: 'Image',
  TextInput: 'Input / InputField',
  Pressable: 'Button / IconButton / LinkButton',
  TouchableOpacity: 'Button / IconButton / LinkButton',
  TouchableHighlight: 'Button / IconButton / LinkButton',
  TouchableWithoutFeedback: 'Button / IconButton',
  Button: 'Button',
  Switch: 'Switch',
  Modal: 'Modal',
  ActivityIndicator: 'Spinner / Progress',
  FlatList: 'ScrollView + map (or compose from released components)',
  SectionList: 'ScrollView + map',
  VirtualizedList: 'ScrollView + map',
  SafeAreaView: 'SafeAreaProvider from react-native-safe-area-context (layout only)',
};

function checkForbiddenRnPrimitives(ast: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!ast) return issues;
  walkAST(ast, (node) => {
    if (node.type !== 'ImportDeclaration') return;
    if (node.importKind === 'type') return;
    const src = (node.source as Record<string, unknown> | undefined)?.value;
    if (src !== 'react-native') return;

    for (const s of (node.specifiers as unknown[]) ?? []) {
      const spec = s as Record<string, unknown>;
      if (spec.type !== 'ImportSpecifier') continue;
      if (spec.importKind === 'type') continue;
      const imported = spec.imported as Record<string, unknown> | undefined;
      const name = imported?.type === 'Identifier' ? (imported.name as string) : '';
      const replacement = FORBIDDEN_RN_PRIMITIVES[name];
      if (!replacement) continue;
      const sLoc = (spec.loc as Record<string, Record<string, number>> | undefined)?.start;
      issues.push({
        line: sLoc?.line ?? 0,
        col: (sLoc?.column ?? 0) + 1,
        severity: 'error',
        rule: 'forbidden-rn-primitive',
        message: `"${name}" is imported from "react-native". Only View and ScrollView may come from react-native — all UI must use @oneui/ui-native.`,
        suggestion: `Replace <${name}> with ${replacement} from '@oneui/ui-native'. Call list_components({ platform: "reactnative" }) for the released set.`,
      });
    }
  });
  return issues;
}

// ---- native fonts ----------------------------------------------------------

const NATIVE_FONT_HINT =
  'Never hardcode a typeface in React Native. Use the Text component (its `variant`/`weight` resolve the ' +
  "brand font) or the theme typography tokens via useTypographyTokens() — a literal pins the font and breaks brand switching.";

// ---- external icon libraries (native) --------------------------------------

const BANNED_ICON_LIBS_NATIVE = [
  'react-native-vector-icons', '@expo/vector-icons', 'lucide-react-native',
  'react-native-heroicons', 'phosphor-react-native', '@react-native-vector-icons',
];

// ---- banned RN internal deep imports ---------------------------------------

// The correct pattern (already emitted by figma_to_code codegen) is the
// `RNImage.resolveAssetSource(mod).uri` barrel form. A deep default-import of
// this internal RN module returns the module object (not a callable function)
// under Babel/Metro interop and crashes at runtime — this regressed once via
// hand-edited self-heal output, so it's a permanent guardrail, not a lint nit.
const BANNED_RN_DEEP_IMPORTS = ['react-native/Libraries/Image/resolveAssetSource'];

function checkBannedRnDeepImports(lines: string[]): ValidationIssue[] {
  return checkBannedModuleImports(lines, BANNED_RN_DEEP_IMPORTS, (lib) => ({
    message: `Deep import from "${lib}" returns the module object under Babel/Metro interop, not a callable function — this crashes at runtime ("... is not a function").`,
    suggestion:
      "Use the barrel form instead: import { Image as RNImage } from 'react-native'; then RNImage.resolveAssetSource(mod).uri.",
  })).map((i) => ({ ...i, rule: 'banned-native-import' }));
}

// ---- entry -----------------------------------------------------------------

export function collectNativeIssues(ctx: RuleContext): ValidationIssue[] {
  return [
    ...checkLiteralColor(ctx.lines),
    ...checkLiteralSpacing(ctx.ast),
    ...checkForbiddenRnPrimitives(ctx.ast),
    ...collectFontLiterals(ctx.lines, NATIVE_FONT_HINT),
    ...checkBannedRnDeepImports(ctx.lines),
    ...checkBannedModuleImports(ctx.lines, BANNED_ICON_LIBS_NATIVE, (lib) => ({
      message: `External icon library "${lib}" is not allowed in a OneUI Native app. It breaks brand consistency.`,
      suggestion:
        'Use OneUI icons only: render <Icon icon="..." /> from @oneui/ui-native (glyphs registered via @oneui/ui-native/icons + @oneui/icons-jio-native). Call get_component_info("Icon", { platform: "reactnative" }).',
    })),
  ];
}
