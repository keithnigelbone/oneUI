import type {
  ASTNode,
  ASTRoot,
  ASTSerializableValue,
  ComponentASTNode,
  ElementASTNode,
} from '../types/componentAST';

export type CompositionASTNormalizationKind =
  | 'component-alias'
  | 'compound-component'
  | 'unknown-component'
  | 'invalid-element-tag'
  | 'icon-name'
  | 'image-prop';

export interface CompositionASTNormalizationIssue {
  kind: CompositionASTNormalizationKind;
  path: string;
  message: string;
}

export interface CompositionASTNormalizationResult {
  ast: ASTRoot;
  issues: CompositionASTNormalizationIssue[];
}

export const VALID_SEMANTIC_ICON_NAMES = new Set([
  'add', 'remove', 'close', 'edit', 'delete', 'copy', 'save', 'refresh',
  'download', 'upload', 'share', 'link', 'unlink', 'menu', 'search', 'home',
  'settings', 'arrowLeft', 'arrowRight', 'arrowUp', 'arrowDown', 'chevronLeft',
  'chevronRight', 'chevronUp', 'chevronDown', 'externalLink', 'firstPage', 'lastPage', 'back', 'next', 'check',
  'checkCircle', 'warning', 'error', 'info', 'help', 'loading', 'play', 'pause',
  'stop', 'volumeOn', 'volumeOff', 'microphone', 'image', 'video', 'user',
  'users', 'userAdd', 'userRemove', 'eye', 'eyeOff', 'lock', 'unlock', 'star',
  'starFilled', 'heart', 'heartFilled', 'bookmark', 'bookmarkFilled', 'filter',
  'sort', 'grid', 'list', 'mail', 'phone', 'chat', 'notification', 'file',
  'folder', 'document', 'calendar', 'clock', 'location', 'sun', 'moon',
  'palette', 'layers', 'components', 'canvas', 'create', 'sparkles', 'globe',
  'smartphone', 'tablet', 'monitor', 'tv', 'printer', 'billboard', 'bus',
]);

const VALID_COMPONENTS = new Set([
  'Button', 'Avatar', 'Icon', 'IconContained', 'Image', 'Checkbox', 'Radio',
  'IconButton', 'Switch', 'Stepper', 'CounterBadge',
  'IndicatorBadge', 'Divider', 'Chip', 'Tabs', 'SelectableButton',
  'SelectableIconButton', 'SelectableSingleTextButton', 'WebHeader',
  'InputField', 'Input', 'Spinner', 'Slider', 'TouchSlider', 'Badge', 'Logo',
  'PaginationDots', 'Carousel', 'BottomNavigation', 'BottomNavItem',
  'Container', 'FAB', 'ChipGroup', 'ListItem', 'ListItemGroup', 'Surface',
  'Tooltip', 'Grid', 'HeaderItem', 'PrimaryNav', 'SecondaryNav',
  'MobileDrawer', 'Select', 'SegmentedControl', 'Dialog', 'Toast', 'Progress',
  'Accordion', 'Separator', 'Menu', 'Link', 'CircularProgressIndicator',
  'Collapsible', 'NumberField', 'NavigationMenu', 'Popover', 'Column', 'Meter',
  'ContentBlock', 'JioRibbon',
]);

const COMPONENT_ALIASES: Record<string, string> = {
  TextInput: 'Input',
  TextField: 'Input',
  InputFieldControl: 'Input',
  TextArea: 'Input',
  Textarea: 'Input',
  Anchor: 'Link',
  Fab: 'FAB',
  fab: 'FAB',
  Header: 'WebHeader',
  TopBar: 'WebHeader',
  AppBar: 'WebHeader',
  Navbar: 'WebHeader',
  NavBar: 'WebHeader',
  Navigation: 'WebHeader',
  NavigationHeader: 'WebHeader',
  SiteHeader: 'WebHeader',
  NavigationBar: 'BottomNavigation',
  TabBar: 'BottomNavigation',
  BottomBar: 'BottomNavigation',
  BottomTabs: 'BottomNavigation',
  BrandLogo: 'Logo',
  JioLogo: 'Logo',
  AppLogo: 'Logo',
  CompanyLogo: 'Logo',
};

const TEXT_COMPONENT_ALIASES = new Set(['Text', 'Heading', 'Paragraph', 'Label']);

const VALID_ELEMENT_TAGS = new Set([
  'div', 'span', 'section', 'main', 'header', 'footer', 'aside', 'nav',
  'article', 'ul', 'ol', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'label', 'strong', 'em', 'small',
]);

const FALLBACK_IMAGE_SRC = '/oneui-generated-image-placeholder.svg';
const FALLBACK_LOGO_SRC = '/JioLogo.svg';

const INLINE_COMPONENTS = new Set([
  'Badge',
  'Chip',
  'CounterBadge',
  'IndicatorBadge',
  'Icon',
  'IconContained',
  'Logo',
]);

const INLINE_STYLE_KEYS_TO_STRIP = new Set([
  'display',
  'width',
  'minWidth',
  'maxWidth',
  'inlineSize',
  'minInlineSize',
  'maxInlineSize',
  'alignSelf',
  'justifySelf',
  'flex',
  'flexGrow',
  'gridColumn',
  'gridColumnStart',
  'gridColumnEnd',
]);

function pushIssue(
  issues: CompositionASTNormalizationIssue[],
  kind: CompositionASTNormalizationKind,
  path: string,
  message: string,
): void {
  issues.push({ kind, path, message });
}

function normalizeSerializableValue(value: ASTSerializableValue): ASTSerializableValue {
  if (Array.isArray(value)) return value.map((item) => normalizeSerializableValue(item));
  if (value && typeof value === 'object') {
    const out: Record<string, ASTSerializableValue> = {};
    for (const [key, child] of Object.entries(value)) {
      out[key] = normalizeSerializableValue(child);
    }
    return out;
  }
  return value;
}

function isPlaceholderSrc(src: string): boolean {
  const normalized = src.toLowerCase();
  return (
    normalized.includes('placeholder') ||
    normalized.includes('placehold.co') ||
    normalized.includes('dummyimage')
  );
}

function sanitizeInlineComponentProps(
  type: string,
  props: Record<string, ASTSerializableValue>,
  path: string,
  issues: CompositionASTNormalizationIssue[],
): Record<string, ASTSerializableValue> {
  if (!INLINE_COMPONENTS.has(type)) return props;
  const next = { ...props };
  if ('fullWidth' in next) {
    delete next.fullWidth;
    pushIssue(issues, 'image-prop', path, `Removed fullWidth from inline ${type}.`);
  }
  const style = next.style;
  if (!style || typeof style !== 'object' || Array.isArray(style)) return next;
  const styleObject = style as Record<string, ASTSerializableValue>;
  let changed = false;
  const cleanStyle: Record<string, ASTSerializableValue> = {};
  for (const [key, value] of Object.entries(styleObject)) {
    if (INLINE_STYLE_KEYS_TO_STRIP.has(key)) {
      changed = true;
      continue;
    }
    cleanStyle[key] = value;
  }
  if (changed) {
    if (Object.keys(cleanStyle).length > 0) next.style = cleanStyle;
    else delete next.style;
    pushIssue(issues, 'image-prop', path, `Removed layout-forcing style from inline ${type}.`);
  }
  return next;
}

function hasTextDescendant(node: ASTNode): boolean {
  if (node.kind === 'text') return node.text.trim().length > 0;
  if (node.kind === 'component' || node.kind === 'element') {
    return (Array.isArray(node.children) ? node.children : []).some(hasTextDescendant);
  }
  return false;
}

function textElementTagFor(type: string): string {
  if (type === 'Heading') return 'h2';
  if (type === 'Label') return 'span';
  return 'p';
}

function normalizeIconProps(
  type: string,
  props: Record<string, ASTSerializableValue>,
  path: string,
  issues: CompositionASTNormalizationIssue[],
): Record<string, ASTSerializableValue> {
  const next = { ...props };
  if (type === 'Icon' || type === 'IconContained') {
    if (typeof next.icon === 'string' && typeof next.name !== 'string') {
      next.name = next.icon;
      delete next.icon;
      pushIssue(issues, 'icon-name', path, 'Moved Icon.icon string to Icon.name.');
    }
    const name = typeof next.name === 'string' ? next.name : undefined;
    if (!name || !VALID_SEMANTIC_ICON_NAMES.has(name)) {
      next.name = 'image';
      pushIssue(issues, 'icon-name', path, `Replaced invalid icon name "${name ?? 'missing'}".`);
    }
  }
  if (type === 'IconButton' && typeof next.icon === 'string' && !VALID_SEMANTIC_ICON_NAMES.has(next.icon)) {
    next.icon = 'menu';
    pushIssue(issues, 'icon-name', path, 'Replaced invalid IconButton icon.');
  }
  return next;
}

function normalizeImageProps(
  type: string,
  props: Record<string, ASTSerializableValue>,
  path: string,
  issues: CompositionASTNormalizationIssue[],
): Record<string, ASTSerializableValue> {
  if (type !== 'Image') return props;
  const next = { ...props };
  if (typeof next.src === 'string' && isPlaceholderSrc(next.src)) {
    next.src = FALLBACK_IMAGE_SRC;
    pushIssue(issues, 'image-prop', path, 'Replaced unresolved placeholder image source.');
  }
  if (typeof next.src !== 'string' || next.src.trim().length === 0) {
    next.src = FALLBACK_IMAGE_SRC;
    pushIssue(issues, 'image-prop', path, 'Added a placeholder image source.');
  }
  if (typeof next.alt !== 'string' || next.alt.trim().length === 0) {
    next.alt = 'Generated composition image';
    pushIssue(issues, 'image-prop', path, 'Added image alt text.');
  }
  return next;
}

function normalizeLogoProps(
  type: string,
  props: Record<string, ASTSerializableValue>,
  path: string,
  issues: CompositionASTNormalizationIssue[],
): Record<string, ASTSerializableValue> {
  if (type !== 'Logo') return props;
  const next = { ...props };
  if (typeof next.src === 'string' && isPlaceholderSrc(next.src)) {
    next.src = FALLBACK_LOGO_SRC;
    pushIssue(issues, 'image-prop', path, 'Replaced unresolved placeholder logo source.');
  }
  if (typeof next.alt !== 'string' || next.alt.trim().length === 0) {
    next.alt = 'Brand logo';
    pushIssue(issues, 'image-prop', path, 'Added Logo alt text.');
  }
  return next;
}

function normalizeProps(
  type: string,
  props: Record<string, ASTSerializableValue> | undefined,
  path: string,
  issues: CompositionASTNormalizationIssue[],
): Record<string, ASTSerializableValue> {
  const base: Record<string, ASTSerializableValue> = {};
  for (const [key, value] of Object.entries(props ?? {})) {
    base[key] = normalizeSerializableValue(value);
  }
  return normalizeLogoProps(
    type,
    normalizeImageProps(
      type,
      sanitizeInlineComponentProps(type, normalizeIconProps(type, base, path, issues), path, issues),
      path,
      issues,
    ),
    path,
    issues,
  );
}

function toElement(
  node: ComponentASTNode | ElementASTNode,
  tag: string,
  children: ASTNode[],
  props: Record<string, ASTSerializableValue>,
): ElementASTNode {
  return {
    id: node.id,
    kind: 'element',
    tag,
    props,
    children,
  };
}

function normalizeNode(
  node: ASTNode,
  path: string,
  issues: CompositionASTNormalizationIssue[],
): ASTNode {
  if (node.kind === 'text') {
    return { ...node, text: typeof node.text === 'string' ? node.text : String(node.text ?? '') };
  }

  let children = (Array.isArray(node.children) ? node.children : []).map((child, index) =>
    normalizeNode(child, `${path}.children[${index}]`, issues),
  );

  if (node.kind === 'element') {
    const rawTag = typeof node.tag === 'string' ? node.tag : 'div';
    const tag = VALID_ELEMENT_TAGS.has(rawTag.toLowerCase()) ? rawTag.toLowerCase() : 'div';
    if (tag !== rawTag) {
      pushIssue(issues, 'invalid-element-tag', path, `Replaced invalid element tag "${rawTag}" with "div".`);
    }
    return {
      ...node,
      tag,
      props: normalizeProps(tag, node.props, path, issues),
      children,
    };
  }

  const rawType = typeof node.type === 'string' ? node.type : 'div';

  if (TEXT_COMPONENT_ALIASES.has(rawType)) {
    pushIssue(issues, 'component-alias', path, `Converted text component "${rawType}" to an element.`);
    return toElement(node, textElementTagFor(rawType), children, normalizeProps(rawType, node.props, path, issues));
  }

  if (rawType.includes('.')) {
    if (rawType === 'Carousel.Root') {
      pushIssue(issues, 'compound-component', path, 'Replaced Carousel.Root with Carousel.');
      return {
        ...node,
        type: 'Carousel',
        props: normalizeProps('Carousel', node.props, path, issues),
        children,
      };
    }
    pushIssue(issues, 'compound-component', path, `Converted unsupported compound component "${rawType}" to a div.`);
    return toElement(node, 'div', children, normalizeProps(rawType, node.props, path, issues));
  }

  const aliasedType = COMPONENT_ALIASES[rawType] ?? rawType;
  if (aliasedType !== rawType) {
    pushIssue(issues, 'component-alias', path, `Replaced "${rawType}" with "${aliasedType}".`);
  }

  if (!VALID_COMPONENTS.has(aliasedType)) {
    pushIssue(issues, 'unknown-component', path, `Converted unknown component "${rawType}" to a div.`);
    return toElement(node, hasTextDescendant(node) ? 'div' : 'span', children, normalizeProps(rawType, node.props, path, issues));
  }

  const props = normalizeProps(aliasedType, node.props, path, issues);
  if (
    aliasedType === 'Logo' &&
    typeof props.src !== 'string' &&
    typeof props.svgContent !== 'string'
  ) {
    props.src = FALLBACK_LOGO_SRC;
    children = [];
    pushIssue(issues, 'image-prop', path, 'Added Jio logo fallback source.');
  }

  return {
    ...node,
    type: aliasedType,
    props,
    children,
  };
}

export function normalizeCompositionAST(input: ASTRoot): CompositionASTNormalizationResult {
  const issues: CompositionASTNormalizationIssue[] = [];
  const ast: ASTRoot = {
    ...input,
    version: 1,
    name: typeof input.name === 'string' && input.name.trim() ? input.name : 'Generated Composition',
    root: normalizeNode(input.root, 'root', issues),
  };
  return { ast, issues };
}
