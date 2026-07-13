/**
 * CompositionSpec validator.
 *
 * The spec contract is stricter than the legacy AST contract: no imports, no
 * raw element branch, no JSX/code props, and all surfaces travel through the
 * canonical `surface` field. This validator checks registry membership,
 * component metadata, slots, visual literals, placeholder content, and ToV
 * content references before a spec can become the live-canvas artifact.
 */

import {
  CompositionSpec,
  JioValidationResult,
  type CompositionNodeT,
  type CompositionPropValueT,
  type CompositionSlotValueT,
  type CompositionSpecT,
  type ComponentGapT,
  type JioComponentRegistryItemT,
  type JioValidationResultT,
  type ViolationT,
} from '@oneui/experience-builder-core';
import { getRegistryItem, type GetRegistryItemResult } from '@oneui/experience-builder-registry';
import { BRAND_ALLOWED_REGEX } from '@oneui/shared/engine/tokenBoundary';

const STRUCTURAL_COMPONENTS = new Set(['Container', 'Grid', 'Surface']);
const STRUCTURAL_PROPS = new Set([
  'layout',
  'direction',
  'gap',
  'rowGap',
  'columnGap',
  'padding',
  'paddingX',
  'paddingY',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'columns',
  'rows',
  'align',
  'alignSelf',
  'justify',
  'wrap',
  'variant',
  'maxWidth',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxHeight',
  'position',
  'overflow',
  'grow',
  'shrink',
  'basis',
  'as',
  'material',
  'appearance',
]);

const FORBIDDEN_PROP_KEYS = new Set([
  'class',
  'className',
  'style',
  'css',
  'sx',
  'rawHtml',
  'html',
  'dangerouslySetInnerHTML',
  'tag',
  'surfaceMode',
  'children',
]);

const ALWAYS_ALLOWED_PROP_PREFIXES = ['aria-'];
const ALWAYS_ALLOWED_PROP_KEYS = new Set(['id', 'role', 'tabIndex']);

const VISUAL_LITERAL_RE =
  /(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em)\b|\b\d+(?:\.\d+)?(?:ms|s)\b|\brgba?\(|\bhsla?\()/;
const FONT_PROP_RE = /^(font(family|-family)?)$/i;
const ICON_PROP_RE = /^icon(name|-name)?$/i;
const MANUAL_BACKGROUND_PROP_RE = /^(background|backgroundColor|bg|fill|color)$/i;
const ICON_COMPONENTS = new Set(['Icon', 'IconButton', 'IconContained', 'SelectableIconButton', 'FAB']);

const CONTENT_PROP_NAMES = new Set([
  'children',
  'title',
  'label',
  'heading',
  'text',
  'caption',
  'alt',
  'description',
  'content',
  'src',
  'href',
  'url',
  'imageUrl',
  'imageSrc',
]);

const PLACEHOLDER_URL_RE = /placehold\.co/i;
const HUMANIZED_ITEM_PLACEHOLDER_RE = /^[A-Z][A-Za-z0-9-]*(?: [A-Z][A-Za-z0-9-]*)* item$/;
const UNTITLED_PLACEHOLDER_RE = /^untitled$/i;
const WEB_HEADER_ALIASES = new Set([
  'Header',
  'Navbar',
  'NavBar',
  'Navigation',
  'NavigationHeader',
  'SiteHeader',
  'TopBar',
  'AppBar',
]);

interface ValidateCompositionSpecContext {
  brandId?: string;
  outputProfile?: string;
  strictStorybook?: boolean;
  storybookMcpStatus?: 'available' | 'unavailable' | 'not-required';
  storybookDocsUsed?: string[];
}

interface WalkAcc {
  blocking: ViolationT[];
  warnings: ViolationT[];
  repairSuggestions: string[];
  componentGaps: ComponentGapT[];
  content: Record<string, string>;
}

function blocking(code: string, message: string, extra: Partial<ViolationT> = {}): ViolationT {
  return { code, message, severity: 'blocking', ...extra };
}

function isAlwaysAllowedProp(name: string): boolean {
  if (ALWAYS_ALLOWED_PROP_KEYS.has(name)) return true;
  return ALWAYS_ALLOWED_PROP_PREFIXES.some((prefix) => name.startsWith(prefix));
}

function isGenuineTokenRef(value: string): boolean {
  if (!value.includes('var(--')) return false;
  return BRAND_ALLOWED_REGEX.test(value.replace(/^.*var\(/, ''));
}

function isPlaceholderContentValue(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (PLACEHOLDER_URL_RE.test(trimmed)) return true;
  if (HUMANIZED_ITEM_PLACEHOLDER_RE.test(trimmed)) return true;
  if (UNTITLED_PLACEHOLDER_RE.test(trimmed)) return true;
  return false;
}

function pushSchemaIssues(error: unknown, acc: WalkAcc): void {
  const issues =
    error && typeof error === 'object' && 'issues' in error
      ? (error as { issues?: Array<{ path: Array<string | number>; message: string }> }).issues ?? []
      : [];
  for (const issue of issues) {
    acc.blocking.push(
      blocking('invalid-composition-spec', issue.message, {
        offender: issue.path.map(String).join('.'),
      }),
    );
  }
  if (issues.length === 0) {
    acc.blocking.push(
      blocking('invalid-composition-spec', 'CompositionSpec failed schema validation.'),
    );
  }
  acc.repairSuggestions.push(
    'Emit a CompositionSpec v1 object with registry components, props, slots, and canonical surface fields only.',
  );
}

function checkForbiddenProps(node: CompositionNodeT, acc: WalkAcc): void {
  for (const key of Object.keys(node.props ?? {})) {
    if (!FORBIDDEN_PROP_KEYS.has(key)) continue;
    acc.blocking.push(
      blocking(
        'forbidden-spec-prop',
        `Prop "${key}" is not allowed in CompositionSpec. Use component props, slots, and the top-level surface field.`,
        { nodeId: node.id, offender: key },
      ),
    );
    acc.repairSuggestions.push(`Remove "${key}" from node "${node.id}".`);
  }
}

function checkContentRef(node: CompositionNodeT, acc: WalkAcc): void {
  if (!node.contentRef) return;
  if (Object.prototype.hasOwnProperty.call(acc.content, node.contentRef)) return;
  acc.blocking.push(
    blocking(
      'missing-content-ref',
      `Node "${node.id}" references contentRef "${node.contentRef}", but the spec content pool does not define it.`,
      { nodeId: node.id, offender: node.contentRef },
    ),
  );
  acc.repairSuggestions.push(`Add content["${node.contentRef}"] or remove the stale contentRef.`);
}

function walkPropStrings(
  value: CompositionPropValueT,
  visit: (text: string, keyPath: string) => void,
  keyPath: string,
): void {
  if (typeof value === 'string') {
    visit(value, keyPath);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) => walkPropStrings(child, visit, `${keyPath}.${index}`));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      walkPropStrings(child, visit, `${keyPath}.${key}`);
    }
  }
}

function checkLiteralProps(node: CompositionNodeT, acc: WalkAcc): void {
  for (const [propName, value] of Object.entries(node.props ?? {})) {
    walkPropStrings(
      value,
      (text) => {
        if (MANUAL_BACKGROUND_PROP_RE.test(propName) && text.includes('var(--')) {
          acc.blocking.push(
            blocking(
              'manual-background-without-surface',
              `Prop "${propName}" on "${node.component}" attempts to set a background/fill token directly. Use the node surface field so descendants get data-surface remapping.`,
              { nodeId: node.id, offender: propName },
            ),
          );
          return;
        }
        if (ICON_PROP_RE.test(propName) && ICON_COMPONENTS.has(node.component)) {
          if (text.includes('var(--')) {
            acc.blocking.push(
              blocking(
                'invalid-icon-name',
                `Prop "${propName}" on "${node.component}" must be a semantic icon name, not a token reference.`,
                { nodeId: node.id, offender: text },
              ),
            );
          }
          return;
        }
        if (isGenuineTokenRef(text)) return;
        const isFakeVar = text.includes('var(--');
        if ((FONT_PROP_RE.test(propName) || ICON_PROP_RE.test(propName)) && text.trim()) {
          acc.blocking.push(
            blocking(
              'literal-value-hook',
              `Prop "${propName}" on "${node.component}" is a raw font/icon literal ("${text}"). Use the component contract value.`,
              { nodeId: node.id, offender: text },
            ),
          );
          return;
        }
        if (isFakeVar || VISUAL_LITERAL_RE.test(text)) {
          acc.blocking.push(
            blocking(
              'literal-value-hook',
              `Prop "${propName}" on "${node.component}" is a hardcoded visual literal ("${text}"). Use a OneUI token.`,
              { nodeId: node.id, offender: text },
            ),
          );
        }
      },
      propName,
    );
  }
}

function checkPlaceholderString(
  node: CompositionNodeT,
  propOrSlotName: string,
  value: string,
  acc: WalkAcc,
): void {
  if (!CONTENT_PROP_NAMES.has(propOrSlotName)) return;
  if (!isPlaceholderContentValue(value)) return;
  acc.blocking.push(
    blocking(
      'placeholder-content',
      `Content "${propOrSlotName}" on "${node.component}" is placeholder content ("${value}").`,
      { nodeId: node.id, offender: value },
    ),
  );
  acc.repairSuggestions.push(
    `Replace placeholder "${value}" on node "${node.id}" with real ToV-backed copy.`,
  );
}

function checkPlaceholderContent(node: CompositionNodeT, acc: WalkAcc): void {
  for (const [propName, value] of Object.entries(node.props ?? {})) {
    if (typeof value === 'string') checkPlaceholderString(node, propName, value, acc);
  }
  for (const [slotName, slot] of Object.entries(node.slots ?? {})) {
    if (typeof slot === 'string') checkPlaceholderString(node, slotName, slot, acc);
  }
}

function propAllowed(
  propName: string,
  node: CompositionNodeT,
  item: JioComponentRegistryItemT,
): boolean {
  if (isAlwaysAllowedProp(propName)) return true;
  if (STRUCTURAL_COMPONENTS.has(node.component) && STRUCTURAL_PROPS.has(propName)) return true;
  return item.props.some((prop) => prop.name === propName);
}

function checkComponentContract(
  node: CompositionNodeT,
  item: JioComponentRegistryItemT,
  acc: WalkAcc,
): void {
  const propByName = new Map(item.props.map((prop) => [prop.name, prop]));
  const allowedSlots = new Set(item.slots);

  for (const [propName, propValue] of Object.entries(node.props ?? {})) {
    if (!propAllowed(propName, node, item)) {
      acc.blocking.push(
        blocking(
          'invalid-prop',
          `Prop "${propName}" is not a valid prop of OneUI component "${node.component}".`,
          { nodeId: node.id, offender: propName },
        ),
      );
      acc.repairSuggestions.push(`Remove "${propName}" from <${node.component}/> in the spec.`);
      continue;
    }
    const meta = propByName.get(propName);
    if (
      meta?.values &&
      meta.values.length > 0 &&
      typeof propValue === 'string' &&
      !meta.values.includes(propValue)
    ) {
      acc.blocking.push(
        blocking(
          'invalid-variant',
          `"${propValue}" is not valid for prop "${propName}" of "${node.component}".`,
          { nodeId: node.id, offender: propValue },
        ),
      );
      acc.repairSuggestions.push(
        `Set "${propName}" on <${node.component}/> to one of: ${meta.values.join(', ')}.`,
      );
    }
  }

  for (const propMeta of item.props) {
    if (!propMeta.required) continue;
    if (Object.prototype.hasOwnProperty.call(node.props ?? {}, propMeta.name)) continue;
    if (Object.prototype.hasOwnProperty.call(node.slots ?? {}, propMeta.name)) continue;
    acc.blocking.push(
      blocking(
        'missing-required-prop',
        `Required prop/slot "${propMeta.name}" is missing on OneUI component "${node.component}".`,
        { nodeId: node.id, offender: propMeta.name },
      ),
    );
    acc.repairSuggestions.push(`Add required "${propMeta.name}" to <${node.component}/>.`);
  }

  for (const slotName of Object.keys(node.slots ?? {})) {
    if (slotName === 'children') continue;
    if (STRUCTURAL_COMPONENTS.has(node.component)) continue;
    if (allowedSlots.has(slotName)) continue;
    acc.blocking.push(
      blocking(
        'invalid-slot',
        `Slot "${slotName}" is not declared by OneUI component "${node.component}".`,
        { nodeId: node.id, offender: slotName },
      ),
    );
    acc.repairSuggestions.push(`Move or remove slot "${slotName}" on <${node.component}/>.`);
  }
}

function checkSurfaceContract(node: CompositionNodeT, acc: WalkAcc): void {
  if (node.component === 'Surface' && !node.surface) {
    acc.blocking.push(
      blocking(
        'missing-surface',
        'Surface nodes must use the canonical CompositionSpec `surface` field so data-surface remapping is explicit.',
        { nodeId: node.id, offender: 'Surface' },
      ),
    );
    acc.repairSuggestions.push(`Set surface on Surface node "${node.id}".`);
  }
}

function slotNodes(node: CompositionNodeT, slotName: string): CompositionNodeT[] {
  const slot = node.slots?.[slotName];
  return Array.isArray(slot) ? slot : [];
}

function requireArraySlot(node: CompositionNodeT, slotName: string, acc: WalkAcc): CompositionNodeT[] {
  const slot = node.slots?.[slotName];
  if (Array.isArray(slot)) return slot;
  acc.blocking.push(
    blocking(
      'compound-contract-violation',
      `"${node.component}" slot "${slotName}" must contain OneUI component nodes for the documented compound recipe.`,
      { nodeId: node.id, offender: slotName },
    ),
  );
  acc.repairSuggestions.push(`Use a component-node array for "${slotName}" on <${node.component}/>.`);
  return [];
}

function checkSlotComponents(
  node: CompositionNodeT,
  slotName: string,
  allowed: Set<string>,
  acc: WalkAcc,
  required = false,
): void {
  const nodes = slotNodes(node, slotName);
  if (nodes.length === 0) {
    if (required) {
      acc.blocking.push(
        blocking(
          'compound-contract-violation',
          `"${node.component}" must provide the documented "${slotName}" slot in the WebHeader recipe.`,
          { nodeId: node.id, offender: slotName },
        ),
      );
      acc.repairSuggestions.push(`Add a documented OneUI component to the "${slotName}" slot.`);
    }
    return;
  }
  for (const slotNode of nodes) {
    if (allowed.has(slotNode.component)) continue;
    acc.blocking.push(
      blocking(
        'compound-contract-violation',
        `"${node.component}" slot "${slotName}" must use documented OneUI component(s): ${[
          ...allowed,
        ].join(', ')}.`,
        { nodeId: slotNode.id, offender: slotNode.component },
      ),
    );
    acc.repairSuggestions.push(
      `Replace "${slotNode.component}" in "${slotName}" with ${[...allowed].join(', ')}.`,
    );
  }
}

function checkNavItems(navNode: CompositionNodeT, navLabel: string, acc: WalkAcc): void {
  const navChildren = requireArraySlot(navNode, 'children', acc);
  const activeValue = typeof navNode.props?.activeValue === 'string' ? navNode.props.activeValue : undefined;
  let activeMatchFound = false;

  for (const item of navChildren) {
    if (item.component !== 'HeaderItem') {
      acc.blocking.push(
        blocking(
          'compound-contract-violation',
          `${navLabel} children must be HeaderItem components in the documented WebHeader recipe.`,
          { nodeId: item.id, offender: item.component },
        ),
      );
      acc.repairSuggestions.push(`Replace "${item.component}" under ${navLabel} with <HeaderItem/>.`);
      continue;
    }

    const value = typeof item.props?.value === 'string' ? item.props.value : undefined;
    const active = item.props?.active === true;
    if (activeValue && value === activeValue && active) activeMatchFound = true;
    if (activeValue && active && value !== activeValue) {
      acc.blocking.push(
        blocking(
          'compound-contract-violation',
          `Active HeaderItem value "${value ?? ''}" does not match ${navLabel} activeValue "${activeValue}".`,
          { nodeId: item.id, offender: value ?? '' },
        ),
      );
      acc.repairSuggestions.push(`Set active=true only on the HeaderItem with value "${activeValue}".`);
    }
  }

  if (activeValue && !activeMatchFound) {
    acc.blocking.push(
      blocking(
        'compound-contract-violation',
        `${navLabel} activeValue "${activeValue}" must match exactly one active HeaderItem.`,
        { nodeId: navNode.id, offender: activeValue },
      ),
    );
    acc.repairSuggestions.push(`Add active=true to the HeaderItem whose value is "${activeValue}".`);
  }
}

function checkWebHeaderCompoundContract(node: CompositionNodeT, acc: WalkAcc): void {
  const children = requireArraySlot(node, 'children', acc);
  const primaryNavs = children.filter((child) => child.component === 'PrimaryNav');
  if (primaryNavs.length === 0) {
    acc.blocking.push(
      blocking(
        'compound-contract-violation',
        'WebHeader must contain a PrimaryNav child in the documented compound recipe.',
        { nodeId: node.id, offender: 'PrimaryNav' },
      ),
    );
    acc.repairSuggestions.push('Compose WebHeader as WebHeader > PrimaryNav > HeaderItem[].');
  }
  if (primaryNavs.length > 1) {
    acc.blocking.push(
      blocking(
        'compound-contract-violation',
        'WebHeader must contain a single PrimaryNav child.',
        { nodeId: node.id, offender: 'PrimaryNav' },
      ),
    );
  }

  for (const child of children) {
    if (child.component === 'PrimaryNav' || child.component === 'SecondaryNav') continue;
    acc.blocking.push(
      blocking(
        'compound-contract-violation',
        'WebHeader children may only be PrimaryNav and optional SecondaryNav in the documented recipe.',
        { nodeId: child.id, offender: child.component },
      ),
    );
    acc.repairSuggestions.push(`Move "${child.component}" into a documented WebHeader slot or remove it.`);
  }

  for (const primaryNav of primaryNavs) {
    checkSlotComponents(primaryNav, 'logo', new Set(['Logo']), acc, true);
    checkSlotComponents(primaryNav, 'end', new Set(['IconButton']), acc, true);
    checkSlotComponents(primaryNav, 'avatar', new Set(['Avatar']), acc, primaryNav.props?.showAvatar !== false);
    checkNavItems(primaryNav, 'PrimaryNav', acc);
  }

  for (const secondaryNav of children.filter((child) => child.component === 'SecondaryNav')) {
    checkNavItems(secondaryNav, 'SecondaryNav', acc);
  }
}

function walkSlot(slot: CompositionSlotValueT, acc: WalkAcc): void {
  if (typeof slot === 'string') return;
  slot.forEach((node) => walkNode(node, acc));
}

function walkNode(node: CompositionNodeT, acc: WalkAcc): void {
  if (WEB_HEADER_ALIASES.has(node.component)) {
    acc.blocking.push(
      blocking(
        'storybook-recipe-drift',
        `"${node.component}" is an alias/improvised navigation type. Use the exact Storybook component WebHeader.`,
        { nodeId: node.id, offender: node.component },
      ),
    );
    acc.repairSuggestions.push(
      'Replace navigation aliases with WebHeader > PrimaryNav > HeaderItem[] from the Storybook recipe.',
    );
    checkForbiddenProps(node, acc);
    checkContentRef(node, acc);
    checkLiteralProps(node, acc);
    checkPlaceholderContent(node, acc);
    for (const slot of Object.values(node.slots ?? {})) walkSlot(slot, acc);
    return;
  }

  const lookup: GetRegistryItemResult = getRegistryItem(node.component);
  if (!lookup.ok) {
    acc.componentGaps.push({
      componentType: node.component,
      reason: lookup.message,
    });
    acc.blocking.push(
      blocking('unregistered-component', lookup.message, {
        nodeId: node.id,
        offender: node.component,
      }),
    );
  } else {
    checkComponentContract(node, lookup.item, acc);
  }

  checkForbiddenProps(node, acc);
  checkContentRef(node, acc);
  checkLiteralProps(node, acc);
  checkPlaceholderContent(node, acc);
  checkSurfaceContract(node, acc);
  if (node.component === 'WebHeader') checkWebHeaderCompoundContract(node, acc);

  for (const slot of Object.values(node.slots ?? {})) walkSlot(slot, acc);
}

function containsComponent(node: CompositionNodeT, component: string): boolean {
  if (node.component === component) return true;
  for (const slot of Object.values(node.slots ?? {})) {
    if (typeof slot === 'string') continue;
    if (slot.some((child) => containsComponent(child, component))) return true;
  }
  return false;
}

export function validateCompositionSpec(
  input: unknown,
  ctx: ValidateCompositionSpecContext = {},
): JioValidationResultT {
  const acc: WalkAcc = {
    blocking: [],
    warnings: [],
    repairSuggestions: [],
    componentGaps: [],
    content: {},
  };

  const parsed = CompositionSpec.safeParse(input);
  if (!parsed.success) {
    pushSchemaIssues(parsed.error, acc);
    return JioValidationResult.parse({
      passed: false,
      blocking: acc.blocking,
      warnings: acc.warnings,
      repairSuggestions: acc.repairSuggestions,
      componentGaps: acc.componentGaps,
      foundationGaps: [],
    });
  }

  const spec: CompositionSpecT = parsed.data;
  acc.content = spec.content ?? {};
  if (
    ctx.strictStorybook &&
    ctx.storybookMcpStatus === 'unavailable' &&
    (!ctx.storybookDocsUsed || ctx.storybookDocsUsed.length === 0) &&
    containsComponent(spec.root, 'WebHeader')
  ) {
    acc.blocking.push(
      blocking(
        'storybook-docs-unavailable',
        'Strict Storybook generation requires WebHeader documentation from Storybook MCP before emitting the compound recipe.',
        { offender: 'WebHeader' },
      ),
    );
    acc.repairSuggestions.push('Start Storybook on port 6006 and verify the /mcp endpoint before retrying.');
  }
  walkNode(spec.root, acc);

  return JioValidationResult.parse({
    passed: acc.blocking.length === 0,
    blocking: acc.blocking,
    warnings: acc.warnings,
    repairSuggestions: acc.repairSuggestions,
    componentGaps: acc.componentGaps,
    foundationGaps: [],
  });
}
