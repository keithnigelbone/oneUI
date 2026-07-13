/**
 * compositionCodePrompt.ts
 *
 * TSX-mode preamble for the Design Composition Agent. Bolts onto the
 * existing rule compiler output (`compileCompositionRules`) — the
 * context-aware design rules (mobile-app vs web-app vs marketing-page)
 * stay valid, only the output format clause changes.
 *
 * What this file contributes vs. the rule compiler:
 *   - Hard contract on output shape: a single TSX fenced block, default
 *     export from `App.tsx`, no prose.
 *   - Closed-set import allowlist. Claude can only reach `react` (hooks)
 *     and `@oneui/playground` (the curated component surface). The
 *     bundler enforces this at compile time inside Sandpack — but stating
 *     it in the prompt cuts the self-heal cycles dramatically.
 *   - Ban on inline literal styles: no raw hex / px / rem / Tailwind.
 *     Tokens via `var(--Token-Name)` are allowed where components expose
 *     style props, but composition primarily flows through component
 *     props (Surface mode, Button appearance, etc.).
 *   - Tight TSX exemplars curated by hand. The AST `STORY_EXEMPLARS`
 *     don't translate cleanly to TSX, so the code path uses these
 *     instead.
 */

import { stripCodeFences } from './llmJSON';
import { formatPlaygroundImagePromptList } from './playgroundImageAssets';
import type { SemanticIconName } from '../types/icons';

/**
 * The `@oneui/playground` re-export list. Mirrors the exports in
 * `packages/ui/src/playground/entry.tsx`. Used both in the system prompt
 * (so Claude knows what's available) and by the code validator (which
 * rejects unknown JSX tag identifiers).
 */
export const PLAYGROUND_COMPONENT_ALLOWLIST = [
  // Layout & surfaces
  'Surface',
  'Container',
  'Grid',
  'ScrollArea',
  'Separator',
  'Divider',
  // Actions
  'Button',
  'IconButton',
  'FAB',
  'Link',
  'Toggle',
  'ToggleGroup',
  'SegmentedControl',
  // Inputs
  'Input',
  'InputField',
  'InputFeedback',
  'InputDynamicText',
  'Checkbox',
  'CheckboxGroup',
  'Radio',
  'Switch',
  'Select',
  'Slider',
  'NumberField',
  'Stepper',
  'Fieldset',
  // Display
  'Avatar',
  'Badge',
  'Chip',
  'ChipGroup',
  'CounterBadge',
  'IndicatorBadge',
  'IconContained',
  'Image',
  // 'Logo' deliberately omitted — see entry.tsx note. Avatar covers
  // brand-mark placeholders without needing iframe-side brand metadata.
  'Spinner',
  'CircularProgressIndicator',
  'Progress',
  'Meter',
  'PaginationDots',
  // Lists & cards
  'ListItem',
  'ListItemGroup',
  'PreviewCard',
  // Navigation — compound subcomponents are flat exports, not namespace
  // properties (`<TabItem>` not `<Tabs.Item>`). Each one must be in the
  // allowlist or the validator + bundler will reject it.
  'Tabs',
  'TabGroup',
  'TabItem',
  'TabPanel',
  'BottomNavigation',
  'BottomNavItem',
  'WebHeader',
  'PrimaryNav',
  'SecondaryNav',
  'HeaderItem',
  'MobileDrawer',
  'SearchInput',
  'NavigationMenu',
  'Toolbar',
  // Overlays
  'Dialog',
  'DialogTrigger',
  'DialogPortal',
  'DialogClose',
  'AlertDialog',
  'AlertDialogTrigger',
  'AlertDialogPortal',
  'AlertDialogClose',
  'Popover',
  'PopoverTrigger',
  'PopoverPortal',
  'PopoverClose',
  'Menu',
  'Tooltip',
  'Toast',
  // Disclosure
  'Accordion',
  'Collapsible',
  // Media
  'Carousel',
  // Icons
  'Icon',
  'IconProvider',
] as const;

/**
 * Runtime list of semantic icon names accepted by `<Icon name="..." />`.
 * The `satisfies` clause forces every entry to be a valid
 * `SemanticIconName` (the canonical type union in `types/icons.ts`),
 * so a typo here is a compile error rather than a silent missing icon.
 *
 * Note: TypeScript can verify each entry is in the union, but not that
 * the array is *complete*. New names added to `SemanticIconName` won't
 * surface here until manually added — keep this list in sync with
 * `packages/ui/src/icons/semanticMappings/lucide.ts`.
 */
export const PLAYGROUND_ICON_NAMES = [
  'add', 'remove', 'close', 'edit', 'delete', 'copy', 'save', 'refresh',
  'download', 'upload', 'share', 'link', 'unlink',
  'menu', 'search', 'home', 'settings',
  'arrowLeft', 'arrowRight', 'arrowUp', 'arrowDown',
  'chevronLeft', 'chevronRight', 'chevronUp', 'chevronDown', 'externalLink', 'firstPage', 'lastPage', 'back', 'next',
  'check', 'checkCircle', 'warning', 'error', 'info', 'help', 'loading',
  'play', 'pause', 'stop', 'volumeOn', 'volumeOff', 'microphone', 'image', 'video',
  'user', 'users', 'userAdd', 'userRemove',
  'eye', 'eyeOff', 'lock', 'unlock',
  'star', 'starFilled', 'heart', 'heartFilled', 'bookmark', 'bookmarkFilled',
  'filter', 'sort', 'grid', 'list', 'moreHorizontal',
  'mail', 'phone', 'chat', 'notification',
  'file', 'folder', 'document',
  'calendar', 'clock', 'location', 'sun', 'moon', 'palette',
  'layers', 'components', 'canvas', 'create', 'sparkles',
  'globe', 'smartphone', 'tablet', 'monitor', 'tv', 'printer', 'billboard', 'bus',
] as const satisfies readonly SemanticIconName[];

export type PlaygroundComponent = (typeof PLAYGROUND_COMPONENT_ALLOWLIST)[number];

const PLAYGROUND_COMPONENT_SET = new Set<string>(PLAYGROUND_COMPONENT_ALLOWLIST);

export function isPlaygroundComponent(name: string): boolean {
  return PLAYGROUND_COMPONENT_SET.has(name);
}

/**
 * Curated TSX exemplars. Kept tight on purpose — Claude doesn't need
 * fifty examples, it needs a handful that demonstrate the right shape.
 */
const TSX_EXEMPLARS = `### Example: bold hero with primary action

\`\`\`tsx
import { Surface, Container, Button } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main" style={{ minHeight: '100vh', padding: 'var(--Spacing-7)' }}>
      <Container variant="fixed">
        <Surface mode="bold" as="section" style={{ padding: 'var(--Spacing-10)', borderRadius: 'var(--Shape-5)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
          <h1 style={{ margin: 0, color: 'var(--Primary-Bold-High)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Display-M-FontSize)', lineHeight: 'var(--Display-M-LineHeight)', fontWeight: 'var(--Display-M-FontWeight)' }}>
            Welcome aboard
          </h1>
          <p style={{ margin: 0, color: 'var(--Primary-Bold-Medium)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-M-FontSize)', lineHeight: 'var(--Body-M-LineHeight)', fontWeight: 'var(--Body-FontWeight-Low)' }}>
            Get started in under a minute.
          </p>
          <Button appearance="primary" variant="bold">
            Continue
          </Button>
        </Surface>
      </Container>
    </Surface>
  );
}
\`\`\`

### Example: subtle card on default surface

\`\`\`tsx
import { Surface, Container, Button, Input } from '@oneui/playground';

export default function App() {
  return (
    <Surface mode="default" as="main" style={{ minHeight: '100vh', padding: 'var(--Spacing-7)' }}>
      <Container variant="fixed" maxWidth="calc(var(--Spacing-40) * 4)">
        <Surface mode="subtle" as="section" style={{ padding: 'var(--Spacing-6)', borderRadius: 'var(--Shape-4-5)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Title-L-FontSize)', lineHeight: 'var(--Title-L-LineHeight)', fontWeight: 'var(--Title-L-FontWeight)' }}>
            Sign in
          </h2>
          <Input placeholder="you@example.com" />
          <Button appearance="primary" variant="bold" style={{ width: '100%' }}>
            Continue
          </Button>
        </Surface>
      </Container>
    </Surface>
  );
}
\`\`\`
`;

/**
 * The TSX output-format clause. Concatenate to the end of the compiled
 * system prompt so the model sees the design rules first, then the hard
 * contract on what to emit.
 */
export const TSX_OUTPUT_CLAUSE = `
## Output Format — IMPORTANT

You output **TSX code** for a single React component named \`App\`, default-exported
from \`/App.tsx\`. Output ONE fenced TSX code block and NOTHING else — no prose,
no explanation, no markdown headings before or after.

### Allowed imports

You may ONLY import from these two packages:

  - \`react\` — only the hooks \`useState\`, \`useEffect\`, \`useCallback\`,
    \`useMemo\`, \`useRef\`. No \`React.createElement\`, no class components.
  - \`@oneui/playground\` — the curated component library. Available exports:

    ${PLAYGROUND_COMPONENT_ALLOWLIST.join(', ')}

Importing anything else (Tailwind, lucide-react, framer-motion, etc.) will
fail the build. If you need an icon, use \`<Icon name="..." />\` from
\`@oneui/playground\` — semantic icon names resolve via the IconProvider.

### Forbidden patterns

  - **No raw colour values.** No hex, no rgb(), no hsl(). Use design tokens
    via \`var(--Token-Name)\` or component appearance props.
  - **No raw pixel/rem font sizes or font weights.** Use typography tokens:
    \`var(--Display-L-FontSize)\`, \`var(--Body-M-FontSize)\`, etc.
  - **No raw numeric spacing or sizing in \`style\` props.** React numbers
    compile to pixels. Use \`var(--Spacing-*)\`, \`var(--Shape-*)\`, or
    token-based \`calc(...)\` expressions instead.
  - **No unitless numeric layout styles.** Do not write \`flex: 1\`,
    \`flexGrow: 1\`, \`opacity: 0.6\`, or similar numeric React style
    values. Use \`<Grid>\`, \`<Container>\`, component props, or token-based
    string values on OneUI layout primitives.
  - **No legacy tokens.** Never use \`--Text-High\`, \`--Text-Medium\`,
    \`--Text-Low\`, \`--Surface-Bold\`, \`--Surface-Subtle\`,
    \`--Primary-FG-*\`, \`--Primary-BG-*\`, \`--Primary-Default-*\`,
    \`--Typography-Size-*\`, or \`--Typography-Weight-*\` in new code.
    Use role-explicit tokens such as \`--Primary-High\`,
    \`--Primary-Medium-Text\`, \`--Primary-Bold\`,
    \`--Body-M-FontSize\`, and \`--Label-FontWeight-Medium\`.
  - **Root Surface required.** \`App\` must return one root \`<Surface
    mode="default" as="main">\` that wraps the entire generated UI.
  - **No Tailwind class names.** No \`className="bg-blue-500"\`.
  - **No raw \`<div>\` / \`<section>\` / \`<main>\` for layout.** Use
    \`<Container>\`, \`<Surface>\`, \`<Grid>\`, or \`<ScrollArea>\` from
    \`@oneui/playground\`. \`<div>\` is fine only for tiny leaf-level
    inline grouping that does NOT set \`display: 'flex'\` or
    \`display: 'grid'\`.
  - **Do not sprinkle \`fullWidth\`.** It is only valid on controls that
    explicitly support it, such as \`Button\`, \`IconButton\`,
    \`InputField\`, and \`ToggleGroup\`. Never put \`fullWidth\` on
    \`Input\`, \`Surface\`, \`Container\`, \`Grid\`, \`Badge\`, \`Chip\`,
    \`Image\`, or display components.

### Assets — icons, images, logos

  - **Icons**: only use \`<Icon name="..." />\` with names from the
    closed-set list below. Names are CAMELCASE, never kebab-case. The
    iframe's IconProvider resolves semantic names through the brand's
    chosen icon set (defaults to Lucide). Inventing a name renders a
    red dashed warning box — designers will see it immediately.

    Valid icon names: ${PLAYGROUND_ICON_NAMES.join(', ')}.

    Use these patterns: \`<Icon name="search" />\` for the magnifier in a
    search bar, \`<Icon name="heart" />\` for favourites, \`<Icon
    name="chevronRight" />\` for "see all" affordances, \`<Icon
    name="home" />\`, \`<Icon name="user" />\`, \`<Icon name="settings" />\`
    for bottom-nav slots. NEVER use Image/img for icons.
  - **Images**: do NOT invent URLs, use remote URLs, or use generated
    image-service URLs. Choose one of these local playground assets only:

${formatPlaygroundImagePromptList()}

    For e-commerce, media, lifestyle, marketing, hero, deal, or product-card
    briefs, include at least one \`<Image>\` using one of those local assets.
    Product grids should use \`product-card-1\`, \`product-card-2\`, or
    \`product-card-3\`; hero banners should use \`ecommerce-hero\` or
    \`lifestyle-1\`.

    Never set \`src=""\`, \`src="placeholder.jpg"\`, \`src="image"\`, or a
    remote \`https://...\` URL. Those are repaired to the neutral local
    fallback before the preview renders.
  - Every \`<Image>\` must include meaningful \`alt\` text.
  - **Logos**: avoid \`<Logo>\` unless you have a real brand logo URL. For
    a brand mark, use \`<Avatar fallback="J" />\` (single character) or
    a styled \`<Surface mode="bold">\` with a single letter inside.

### Layout — bottom navigation + safe areas (CRITICAL)

\`<BottomNavigation>\` is **fixed-positioned at the bottom of the
viewport**. If your main content section doesn't reserve space for it,
the last rows of content render *underneath* the nav and look broken.
This is the #1 layout mistake. The fix is mandatory:

  1. Render the page as a SINGLE root \`<Surface>\` that wraps both the
     content section AND the bottom nav.
  2. The CONTENT section (the \`<main>\`/\`<section>\` containing your
     scrollable composition) MUST set
     \`paddingBottom: 'var(--Spacing-40)'\` (≈80px) or larger.
  3. Place \`<BottomNavigation>\` as a SIBLING of the content section,
     after it, NOT inside it.

Canonical pattern:

\`\`\`tsx
<Surface mode="default" as="main" style={{ minHeight: '100vh' }}>
  <Container style={{ paddingBottom: 'var(--Spacing-40)' }}>
    {/* All scrollable content here — hero, lists, deals, cards. */}
  </Container>
  <BottomNavigation>
    <BottomNavItem value="home" icon="home" label="Home" />
    <BottomNavItem value="search" icon="search" label="Search" />
    <BottomNavItem value="profile" icon="user" label="Profile" />
  </BottomNavigation>
</Surface>
\`\`\`

Without this padding, the bottom nav LITERALLY OVERLAPS the last
content rows in the rendered output. Don't skip it.

### Layout — keep \`<Image>\` confined to its container

\`<Image>\` defaults to its natural intrinsic size (very large), which
on a mobile viewport overflows the device frame and pushes adjacent
content off-screen. Always wrap \`<Image>\` in a sized container
(typically a \`<Surface>\` with \`borderRadius\` and a fixed aspect
ratio) and give the Image \`style={{ width: '100%', height: '100%',
objectFit: 'cover' }}\` so it fills the container without bleeding.

### Icon vocabulary — match the user's intent

When picking an \`<Icon name="...">\`, match the icon to the action /
content semantically. Common mismatches Claude makes:

  - "Add to cart" affordance: use \`add\` beside clear "Add to cart" text.
    Do not invent \`shoppingCart\`; it is not in the semantic icon set.
  - Category pills: use icons that match the category — \`grid\` for
    grocery categories, \`smartphone\` for electronics, \`star\` for
    favourites, \`bookmark\` for saved items.
  - Profile/avatar slots: use \`user\`, NOT \`heart\` or \`star\`.
  - Delete / remove: use \`delete\` (trash) for destructive removal,
    \`close\` for dismissing a card, \`remove\` (minus) for decrementing
    a counter.

### Surface placement (CRITICAL)

When placing components on a non-default background, ALWAYS use
\`<Surface mode="...">\` as the container — never set background colour
manually on a div. Surface modes: \`default\`, \`ghost\`, \`minimal\`,
\`subtle\`, \`moderate\`, \`bold\`, \`elevated\`, \`blend\`. Inside a Surface, child
components automatically remap their tokens via the data-surface cascade,
so \`<Button appearance="primary">\` inside \`<Surface mode="bold">\` stays
contrast-correct without any manual adjustment.

### Strict render gate

The playground will not show your TSX unless the validator passes with
\`valid: true\`. Blocking failures include raw colors/dimensions, numeric
React style values, legacy tokens, unknown icons/components, missing root
Surface, manual backgrounds around interactive controls, broken images, and
typography that sets a font size without both \`fontFamily:
'var(--Typography-Font-Primary)'\` and a matching line-height token.

${TSX_EXEMPLARS}
`;

/**
 * Compose the final TSX-mode system prompt. Takes the compiled rule
 * prompt (from \`compileCompositionRules\`) and appends the TSX output
 * clause + (optionally) a curated section of real Storybook exemplars
 * harvested from \`.stories.tsx\` files. Keep the rules-first ordering —
 * the model's attention budget is heavier on the latter half of the
 * prompt, and the output contract is what we most need it to obey.
 */
export function buildTSXSystemPrompt(
  compiledRulePrompt: string,
  options: { storybookExemplars?: StorybookExemplarLike[]; exemplarBudget?: number } = {},
): string {
  const rules = stripASTOnlySections(compiledRulePrompt);
  const exemplarSection = options.storybookExemplars
    ? renderStorybookExemplars(options.storybookExemplars, options.exemplarBudget ?? 6_000)
    : '';
  return `${rules.trim()}\n\n${TSX_OUTPUT_CLAUSE.trim()}\n${exemplarSection}\n`;
}

function stripASTOnlySections(prompt: string): string {
  const astSectionIndex = prompt.indexOf('\n## AST Output Format');
  const next = astSectionIndex >= 0 ? prompt.slice(0, astSectionIndex) : prompt;
  return next
    .replace(/\n?- Output ONLY valid JSON, no markdown, no explanation/g, '')
    .replace(/\n?Output ONLY the JSON AST\./g, '');
}

/**
 * Minimal shape pulled from STORY_EXEMPLARS — declared structurally here
 * so this file doesn't import from \`@oneui/shared/meta\` (which would
 * pull the full ~40-entry generated table into every consumer of the
 * engine barrel and bloat the bundle).
 */
export interface StorybookExemplarLike {
  component: string;
  storyName: string;
  description?: string;
  args?: Record<string, unknown>;
  renderSource?: string;
  tags?: string[];
}

/**
 * Format a curated set of Storybook exemplars as TSX prompt context.
 *
 * Storybook \`renderSource\` is a function: \`(args) => <Component .../>\`,
 * often wrapping the component in story-only locals (\`MobileFrame\`,
 * \`SlotIcon\`, \`<Component>Default\`) that don't exist in the playground
 * bundle. Feeding those snippets verbatim to Claude actively misleads
 * it — the model might import the missing locals.
 *
 * So instead: synthesise clean standalone JSX from \`args\` alone. This
 * skips slot composition (which Claude is good at on its own) but
 * gives an accurate prop-vocabulary signal for every supported
 * component. Trims to the byte budget so it can't dominate the prompt.
 */
function renderStorybookExemplars(
  exemplars: StorybookExemplarLike[],
  byteBudget: number,
): string {
  const usable: Array<{ component: string; storyName: string; jsx: string; description?: string }> = [];
  for (const e of exemplars) {
    if (!isPlaygroundComponent(e.component)) continue;
    const jsx = synthesizeJsxFromArgs(e.component, e.args);
    if (!jsx) continue;
    usable.push({ component: e.component, storyName: e.storyName, jsx, description: e.description });
  }
  if (usable.length === 0) return '';

  const blocks: string[] = [];
  let used = 0;
  for (const e of usable) {
    const heading = `### ${e.component} — ${e.storyName}`;
    const body = `\`\`\`tsx\n${e.jsx}\n\`\`\``;
    const block = `${heading}\n${e.description ? `${e.description}\n` : ''}${body}\n`;
    if (used + block.length > byteBudget) break;
    blocks.push(block);
    used += block.length;
  }
  if (blocks.length === 0) return '';
  return `\n## Storybook exemplars — canonical prop combinations\n\nThese show the canonical prop combinations for each component as exercised in the OneUI Storybook. Match these patterns when generating TSX. (Slot composition is up to you; these are prop-vocabulary cues.)\n\n${blocks.join('\n')}`;
}

/**
 * Render a single component as a standalone JSX snippet from its
 * Storybook \`args\` object. Skips entries whose args reference
 * unserialisable values (\`__raw__:\`-prefixed) since those would
 * generate broken TSX. Returns null when no usable args exist.
 */
function synthesizeJsxFromArgs(component: string, args: Record<string, unknown> | undefined): string | null {
  if (!args || typeof args !== 'object') return null;
  const propParts: string[] = [];
  let children: string | null = null;
  for (const [key, value] of Object.entries(args)) {
    if (key === 'children') {
      if (typeof value === 'string') children = value;
      // Skip non-string children — usually __raw__ refs.
      continue;
    }
    if (typeof value === 'string' && value.startsWith('__raw__:')) {
      // Skip raw refs — they're React nodes / source identifiers from
      // story-locals, not values we can put in static JSX.
      continue;
    }
    if (typeof value === 'string') propParts.push(`${key}="${escapeJsxString(value)}"`);
    else if (typeof value === 'number') propParts.push(`${key}={${value}}`);
    else if (typeof value === 'boolean') {
      propParts.push(value ? key : `${key}={false}`);
    }
    // Skip arrays / objects — they often reference story-only types.
  }
  if (propParts.length === 0 && children === null) return null;
  const props = propParts.length > 0 ? ' ' + propParts.join(' ') : '';
  if (children !== null) {
    return `<${component}${props}>${escapeJsxText(children)}</${component}>`;
  }
  return `<${component}${props} />`;
}

function escapeJsxString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function escapeJsxText(value: string): string {
  // JSX text nodes — only `{` and `<` need escaping; we don't expect
  // those in args.children since that's almost always plain copy.
  return value.replace(/[{<>]/g, (ch) => `{'${ch}'}`);
}

/**
 * The user-prompt instruction for fresh generations. The compiled
 * system prompt does the heavy lifting; this just frames the request.
 */
export function buildTSXUserPrompt(input: { brandName?: string; prompt: string }): string {
  const brand = input.brandName ? `Brand: ${input.brandName}. ` : '';
  return `${brand}Create a polished UI composition for: ${input.prompt}\n\nOutput ONLY the TSX code in a single fenced block.`;
}

/**
 * Revision user-prompt. Mirror of the AST revision phrasing but referring
 * to a code snapshot instead of an AST.
 */
export function buildTSXRevisionPrompt(input: {
  brandName?: string;
  previousCode: string;
  changeRequest: string;
  selectedNodeLoc?: string;
  selectedNodeTag?: string;
}): string {
  const lines: string[] = [];
  if (input.brandName) lines.push(`Brand: ${input.brandName}.`);
  lines.push('Here is the current composition (App.tsx):');
  lines.push('```tsx');
  lines.push(input.previousCode);
  lines.push('```');
  lines.push('');
  lines.push(
    'Apply this change, returning the full updated App.tsx. Preserve unchanged sections exactly. Do not regenerate the layout from scratch.',
  );
  if (input.selectedNodeLoc) {
    lines.push('');
    lines.push(
      `The user is focusing on the ${input.selectedNodeTag ?? 'element'} at ${input.selectedNodeLoc}. Apply the change to that element only — keep every other line byte-identical.`,
    );
  }
  lines.push('');
  lines.push(`Change: ${input.changeRequest}`);
  lines.push('');
  lines.push('Output ONLY the updated TSX in a single fenced block.');
  return lines.join('\n');
}

/**
 * Repair user-prompt for the self-healing loop. Sandpack's bundler error
 * goes in `error`, the previous code goes in `previousCode`. Keep this
 * tight — the model needs minimal framing to fix a compile error.
 */
export function buildTSXRepairPrompt(input: { previousCode: string; error: string }): string {
  return [
    'The previous output failed to compile or failed the OneUI strict render gate. Exact failure:',
    '```',
    input.error,
    '```',
    '',
    'Here is the code that failed:',
    '```tsx',
    input.previousCode,
    '```',
    '',
    'Repair every listed issue before returning code. Use role-explicit tokens only: replace --Text-High with --Primary-High, --Text-Medium with --Primary-Medium-Text, --Text-Low with --Primary-Low, --Surface-* aliases with role tokens or <Surface mode="...">, and V4 role aliases like --Primary-FG-Bold-High / --Primary-BG-Subtle / --Primary-Default-Accent-A11y with --Primary-Bold-High / --Primary-Subtle / --Primary-TintedA11y. Replace raw layout <div>/<section>/<main> nodes that set display flex/grid with <Container>, <Grid>, <ScrollArea>, or <Surface>. Remove numeric React style values such as flex: 1, flexGrow: 1, and opacity: 0.6. Remove unsupported fullWidth props from Input, Surface, Container, Grid, Badge, Chip, Image, and display components. Every Image needs a real local src from the playground asset registry and meaningful alt text.',
    '',
    'Output a corrected App.tsx that fixes ONLY these errors. Preserve the rest of the layout exactly. Output ONLY the corrected TSX in a single fenced block.',
  ].join('\n');
}

/**
 * Strip a TSX/JSX/TS/JS fenced block from a Claude response. Thin
 * wrapper around `stripCodeFences` so the design executor can stay
 * symmetric with `stripJSONFences` for AST mode.
 */
export function stripTSXFences(text: string): string {
  return stripCodeFences(text, 'tsx|jsx|ts|js');
}
