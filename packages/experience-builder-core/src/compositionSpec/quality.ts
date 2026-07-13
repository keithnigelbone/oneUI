import type {
  CompositionNodeT,
  CompositionPropValueT,
  CompositionSpecT,
  CompositionSurfaceModeT,
} from './schema';

export interface CompositionQualityAudit {
  passed: boolean;
  issues: string[];
  sectionCount: number;
  textNodeCount: number;
  emptyContainerCount: number;
  emptySurfaceCount: number;
  maxRepeatedTextCount: number;
}

const QUALITY_RECIPE_VERSION = 'landing-web-v1';

const ROLE_LABELS: Record<SectionRole, readonly string[]> = {
  nav: ['navigation', 'nav', 'global navigation'],
  hero: ['hero', 'banner'],
  plans: ['plan', 'plans', 'card', 'pricing'],
  benefits: ['benefit', 'benefits', 'feature', 'network', 'key benefits'],
  faq: ['faq', 'question', 'questions'],
  footer: ['footer'],
  cta: ['cta', 'action'],
  generic: [],
};

type SectionRole = 'nav' | 'hero' | 'plans' | 'benefits' | 'faq' | 'footer' | 'cta' | 'generic';
type ProductContext = 'jiofiber' | 'jio';
type SurfaceAppearance =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'sparkle'
  | 'brand-bg'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';

function cloneSpec(spec: CompositionSpecT): CompositionSpecT {
  return JSON.parse(JSON.stringify(spec)) as CompositionSpecT;
}

function childrenOf(node: CompositionNodeT): CompositionNodeT[] {
  const children = node.slots?.children;
  return Array.isArray(children) ? children : [];
}

function nodeText(id: string, text: string, props: Record<string, CompositionPropValueT>): CompositionNodeT {
  return {
    id,
    component: 'Text',
    props: {
      text,
      ...props,
    },
  };
}

function button(id: string, label: string, variant: 'bold' | 'subtle' | 'ghost' = 'bold'): CompositionNodeT {
  return {
    id,
    component: 'Button',
    props: { variant, appearance: 'primary', size: 'm' },
    slots: { children: label },
  };
}

function icon(id: string, name: string): CompositionNodeT {
  return {
    id,
    component: 'Icon',
    props: { icon: name, size: '5', appearance: 'primary', emphasis: 'tintedA11y', 'aria-hidden': true },
  };
}

function logo(id: string, alt = 'Jio'): CompositionNodeT {
  return {
    id,
    component: 'Logo',
    props: { alt, size: 'l', variant: 'mark', src: '/JioLogo.svg' },
  };
}

function avatar(id: string, alt = 'Profile'): CompositionNodeT {
  return {
    id,
    component: 'Avatar',
    props: { alt, content: 'icon', size: 'xl', appearance: 'secondary' },
  };
}

function iconButton(
  id: string,
  iconName: string,
  label: string,
  options: { appearance?: SurfaceAppearance; variant?: 'bold' | 'subtle' | 'ghost' } = {},
): CompositionNodeT {
  return {
    id,
    component: 'IconButton',
    props: {
      icon: iconName,
      'aria-label': label,
      variant: options.variant ?? 'ghost',
      appearance: options.appearance ?? 'neutral',
      size: 8,
      condensed: true,
    },
  };
}

function headerItem(
  id: string,
  value: string,
  label: string,
  options: { active?: boolean; icon?: string; attention?: 'low' | 'medium' | 'high' } = {},
): CompositionNodeT {
  return {
    id,
    component: 'HeaderItem',
    props: {
      value,
      href: `#${value}`,
      active: options.active ?? false,
      attention: options.attention ?? (options.active ? 'high' : 'medium'),
      ...(options.icon ? { startSize: 'M' } : {}),
    },
    slots: {
      ...(options.icon ? { start: [icon(`${id}-icon`, options.icon)] } : {}),
      children: label,
    },
  };
}

function linkButton(id: string, label: string, iconName?: string): CompositionNodeT {
  return {
    id,
    component: 'LinkButton',
    props: { appearance: 'primary' },
    slots: {
      ...(iconName ? { start: [icon(`${id}-icon`, iconName)] } : {}),
      children: label,
    },
  };
}

function badge(id: string, label: string, variant: 'bold' | 'subtle' | 'ghost' = 'subtle'): CompositionNodeT {
  return {
    id,
    component: 'Badge',
    props: { variant, appearance: 'sparkle', size: 's' },
    slots: { children: label },
  };
}

function container(
  id: string,
  props: Record<string, CompositionPropValueT>,
  children: CompositionNodeT[],
  surface?: CompositionSurfaceModeT,
  appearance?: SurfaceAppearance,
): CompositionNodeT {
  return {
    id,
    component: 'Container',
    ...(Object.keys(props).length || appearance ? { props: { ...props, ...(appearance ? { appearance } : {}) } } : {}),
    ...(surface ? { surface } : {}),
    slots: { children },
  };
}

function grid(id: string, columns: number, children: CompositionNodeT[]): CompositionNodeT {
  return {
    id,
    component: 'Grid',
    props: { columns, gap: '6' },
    slots: { children },
  };
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function firstNonEmpty(...values: Array<string | undefined>): string {
  for (const value of values) {
    const normalized = value ? normalizeWhitespace(value) : '';
    if (normalized) return normalized;
  }
  return '';
}

function inferSectionRole(node: CompositionNodeT): SectionRole {
  const haystack = `${node.id} ${JSON.stringify(node.props ?? {})}`.toLowerCase();
  if (/nav|global-navigation|webheader/.test(haystack)) return 'nav';
  if (/hero|banner/.test(haystack)) return 'hero';
  if (/plan|pricing|card/.test(haystack)) return 'plans';
  if (/benefit|feature|network|stats|impact|key/.test(haystack)) return 'benefits';
  if (/faq|question/.test(haystack)) return 'faq';
  if (/footer/.test(haystack)) return 'footer';
  if (/cta|action/.test(haystack)) return 'cta';
  return 'generic';
}

function copyFromContent(
  spec: CompositionSpecT,
  role: SectionRole,
  field: 'headline' | 'body',
): string | undefined {
  const content = spec.content ?? {};
  const labels = ROLE_LABELS[role];
  const fieldSuffix = `.${field}`;
  for (const [key, value] of Object.entries(content)) {
    const normalizedKey = key.toLowerCase();
    if (!normalizedKey.endsWith(fieldSuffix)) continue;
    if (labels.some((label) => normalizedKey.includes(label))) return value;
  }
  return undefined;
}

function defaultHeadline(role: SectionRole): string {
  switch (role) {
    case 'nav':
      return 'Jio';
    case 'hero':
      return 'Connections that keep up with you';
    case 'plans':
      return 'Find your right plan';
    case 'benefits':
      return "Built on India's largest network";
    case 'faq':
      return 'Questions worth asking';
    case 'footer':
      return 'The full Jio picture';
    case 'cta':
      return 'Ready when you are';
    default:
      return 'Explore Jio';
  }
}

function defaultBody(role: SectionRole): string {
  switch (role) {
    case 'hero':
      return 'Fast data, clear calls, entertainment and services come together in one simple Jio experience.';
    case 'plans':
      return 'Compare everyday data, entertainment, family and travel-ready options without losing the details that matter.';
    case 'benefits':
      return 'Jio keeps people connected across cities, homes and workdays with reliable coverage and simple digital access.';
    case 'faq':
      return 'Get clear answers before choosing a plan, from recharge steps to what happens when your needs change.';
    case 'footer':
      return 'Find policies, support and the latest Jio updates in one place.';
    default:
      return 'A focused Jio experience designed around the next useful action.';
  }
}

function inferProductContext(spec: CompositionSpecT): ProductContext {
  const haystack = normalizeWhitespace(
    [
      spec.name,
      spec.intent,
      spec.artifactType,
      ...Object.keys(spec.content ?? {}),
      ...Object.values(spec.content ?? {}),
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' '),
  ).toLowerCase();
  if (/jio\s*fiber|jiofiber|fibre|fiber|broadband|home internet|wi-?fi/.test(haystack)) {
    return 'jiofiber';
  }
  return 'jio';
}

function specSearchText(spec: CompositionSpecT): string {
  return normalizeWhitespace(
    [
      spec.name,
      spec.intent,
      spec.artifactType,
      spec.targetProfile,
      ...Object.keys(spec.content ?? {}),
      ...Object.values(spec.content ?? {}),
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' '),
  ).toLowerCase();
}

function isFocusedModuleSpec(spec: CompositionSpecT): boolean {
  const haystack = specSearchText(spec);
  return (
    /\b(module|widget|panel|dashboard|drawer|sheet|modal)\b/.test(haystack) ||
    /\b(subscription\s+upgrade|upgrade\s+module|offer\s+module|checkout\s+module|recharge\s+module|add-?on\s+module)\b/.test(
      haystack,
    )
  );
}

function productHeadline(role: SectionRole, product: ProductContext): string {
  if (product !== 'jiofiber') return defaultHeadline(role);
  switch (role) {
    case 'nav':
      return 'JioFiber';
    case 'hero':
      return 'High-speed internet built for every room';
    case 'plans':
      return 'Choose a JioFiber plan for your home';
    case 'benefits':
      return 'Wi-Fi, entertainment and support in one connection';
    case 'faq':
      return 'Questions before you book JioFiber';
    case 'footer':
      return 'JioFiber for connected homes';
    case 'cta':
      return 'Bring JioFiber home';
    default:
      return 'Explore JioFiber';
  }
}

function productBody(role: SectionRole, product: ProductContext): string {
  if (product !== 'jiofiber') return defaultBody(role);
  switch (role) {
    case 'hero':
      return 'Stream, work, learn and game on reliable fiber broadband with whole-home Wi-Fi and simple digital service.';
    case 'plans':
      return 'Compare monthly options for speed, entertainment bundles and family usage before you book installation.';
    case 'benefits':
      return 'JioFiber brings fast home internet together with TV, apps, video calls and assisted setup for everyday use.';
    case 'faq':
      return 'Check availability, installation steps, plan changes and support before choosing your JioFiber connection.';
    case 'footer':
      return 'Find support, policies and plan details for JioFiber customers.';
    default:
      return 'A focused JioFiber experience designed around checking availability and choosing the right home plan.';
  }
}

function recipeCopy(spec: CompositionSpecT, role: SectionRole): { headline: string; body: string } {
  const product = inferProductContext(spec);
  return {
    headline: firstNonEmpty(copyFromContent(spec, role, 'headline'), productHeadline(role, product)),
    body: firstNonEmpty(copyFromContent(spec, role, 'body'), productBody(role, product)),
  };
}

function buildNavSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  const { headline } = recipeCopy(spec, 'nav');
  const product = inferProductContext(spec);
  const productLabel = product === 'jiofiber' ? 'JioFiber' : headline || 'Jio';
  const primaryItems =
    product === 'jiofiber'
      ? [
          ['home', 'Home'],
          ['plans', 'Fiber plans'],
          ['availability', 'Availability'],
          ['support', 'Support'],
        ]
      : [
          ['home', 'Home'],
          ['products', 'Products'],
          ['solutions', 'Solutions'],
          ['resources', 'Resources'],
        ];
  const activeValue = 'home';
  return {
    id: original.id,
    component: 'WebHeader',
    props: {
      variant: 'default',
      breakpoint: 'L',
      'aria-label': `${productLabel} site header`,
    },
    slots: {
      children: [
        {
          id: `${original.id}-primary-nav`,
          component: 'PrimaryNav',
          props: {
            type: 'homeBar',
            middle: 'fluid',
            searchInput: 'end',
            showMenuButton: true,
            primaryNavItems: true,
            showAvatar: true,
            divider: true,
            activeValue,
            'aria-label': `${productLabel} primary navigation`,
          },
          slots: {
            logo: [logo(`${original.id}-logo`, productLabel)],
            avatar: [avatar(`${original.id}-avatar`, `${productLabel} profile`)],
            end: [
              iconButton(`${original.id}-hellojio`, 'sparkles', 'Ask HelloJio', {
                appearance: 'primary',
                variant: 'subtle',
              }),
              iconButton(`${original.id}-notifications`, 'notification', 'Notifications'),
            ],
            children: primaryItems.map(([value, label]) =>
              headerItem(`${original.id}-${value}`, value, label, {
                active: value === activeValue,
                attention: 'medium',
              }),
            ),
          },
        },
      ],
    },
  };
}

function buildHeroSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  const { headline, body } = recipeCopy(spec, 'hero');
  const product = inferProductContext(spec);
  return container(
    original.id,
    {
      layout: 'flex',
      direction: 'column',
      gap: '6',
      paddingX: '10',
      paddingY: '12',
      align: 'start',
    },
    [
      badge(`${original.id}-eyebrow`, product === 'jiofiber' ? 'JioFiber home broadband' : 'Jio digital life', 'subtle'),
      nodeText(`${original.id}-headline`, headline, {
        variant: 'headline',
        size: 'L',
        weight: 'high',
        attention: 'high',
        as: 'h1',
      }),
      nodeText(`${original.id}-body`, body, {
        variant: 'body',
        size: 'L',
        weight: 'low',
        attention: 'medium',
        as: 'p',
        maxLines: 4,
      }),
      container(
        `${original.id}-actions`,
        { layout: 'flex', direction: 'row', gap: '4', align: 'center', wrap: true },
        [
          button(`${original.id}-primary-action`, product === 'jiofiber' ? 'Explore JioFiber plans' : 'Explore plans'),
          linkButton(
            `${original.id}-secondary-action`,
            product === 'jiofiber' ? 'Check availability' : 'Check coverage',
            'location',
          ),
        ],
      ),
    ],
    'bold',
    'primary',
  );
}

function buildPlansSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  const { headline, body } = recipeCopy(spec, 'plans');
  const product = inferProductContext(spec);
  const planCards =
    product === 'jiofiber'
      ? [
          ['Fiber starter', 'A reliable home broadband plan for everyday browsing, video calls and learning.', 'View starter'],
          ['Entertainment bundle', 'Fast Wi-Fi with TV and app benefits for streaming across the household.', 'Compare bundles'],
          ['Work and game', 'Higher-speed fiber for large downloads, low-latency play and busy workdays.', 'Check speed'],
        ]
      : [
          ['Everyday 5G', 'Daily data, unlimited calls and entertainment-ready speed for regular use.', 'Explore everyday'],
          ['Family value', 'Share reliable connectivity across home, work and travel without extra complexity.', 'Compare family'],
          ['Entertainment plus', 'Streaming, apps and high-speed data bundled for richer digital moments.', 'See benefits'],
        ];
  const cards = planCards.map(([title, description, cta], index) =>
    container(
      `${original.id}-card-${index + 1}`,
      { layout: 'flex', direction: 'column', gap: '4', padding: '6' },
      [
        nodeText(`${original.id}-card-${index + 1}-title`, title, {
          variant: 'title',
          size: 'M',
          weight: 'high',
          as: 'h3',
        }),
        nodeText(`${original.id}-card-${index + 1}-body`, description, {
          variant: 'body',
          size: 'M',
          weight: 'low',
          attention: 'medium',
          as: 'p',
        }),
        button(`${original.id}-card-${index + 1}-action`, cta, index === 0 ? 'bold' : 'subtle'),
      ],
      index === 0 ? 'elevated' : 'subtle',
      index === 0 ? 'primary' : index === 1 ? 'secondary' : 'sparkle',
    ),
  );

  return container(
    original.id,
    { layout: 'flex', direction: 'column', gap: '7', paddingX: '10', paddingY: '10' },
    [
      nodeText(`${original.id}-headline`, headline, {
        variant: 'headline',
        size: 'M',
        weight: 'high',
        as: 'h2',
      }),
      nodeText(`${original.id}-body`, body, {
        variant: 'body',
        size: 'M',
        attention: 'medium',
        as: 'p',
        maxLines: 3,
      }),
      grid(`${original.id}-grid`, 3, cards),
    ],
    'default',
  );
}

function buildBenefitsSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  const { headline, body } = recipeCopy(spec, 'benefits');
  const product = inferProductContext(spec);
  const facts =
    product === 'jiofiber'
      ? [
          ['Whole-home Wi-Fi', 'A fiber connection designed for streaming, work and learning across rooms.'],
          ['Entertainment ready', 'Bundle internet with TV and app experiences for shared home viewing.'],
          ['Assisted setup', 'Book installation, manage plans and get support through simple digital flows.'],
        ]
      : [
          ['Coverage', 'Reliable access across everyday places.'],
          ['Speed', 'A 5G-ready experience for work, play and streaming.'],
          ['Support', 'Simple help when plans or recharges need attention.'],
        ];
  return container(
    original.id,
    { layout: 'flex', direction: 'column', gap: '6', paddingX: '10', paddingY: '8' },
    [
      nodeText(`${original.id}-headline`, headline, {
        variant: 'title',
        size: 'L',
        weight: 'high',
        as: 'h2',
      }),
      nodeText(`${original.id}-body`, body, {
        variant: 'body',
        size: 'M',
        attention: 'medium',
        as: 'p',
      }),
      grid(
        `${original.id}-grid`,
        3,
        facts.map(([title, description], index) =>
          container(
            `${original.id}-fact-${index + 1}`,
            { layout: 'flex', direction: 'column', gap: '3', padding: '5' },
            [
              badge(`${original.id}-fact-${index + 1}-badge`, title, 'ghost'),
              nodeText(`${original.id}-fact-${index + 1}-body`, description, {
                variant: 'body',
                size: 'S',
                attention: 'medium',
              }),
            ],
            'minimal',
            index === 0 ? 'primary' : index === 1 ? 'secondary' : 'sparkle',
          ),
        ),
      ),
    ],
    'subtle',
    'secondary',
  );
}

function buildFaqSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  const { headline, body } = recipeCopy(spec, 'faq');
  const product = inferProductContext(spec);
  const questions =
    product === 'jiofiber'
      ? [
          ['How do I check JioFiber availability?', 'Use the availability flow with your address before choosing a plan or booking installation.'],
          ['What can I bundle with JioFiber?', 'Eligible plans can combine broadband with entertainment, TV and app benefits for the home.'],
          ['Can I upgrade later?', 'Yes. Plan changes should stay visible and easy to compare as your home usage grows.'],
        ]
      : [
          ['How do I choose a Jio plan?', 'Start with data needs, validity and entertainment preferences, then compare the options side by side.'],
          ['Can I recharge online?', 'Yes. Jio supports quick digital recharge flows with clear confirmation before payment.'],
          ['Where can I check coverage?', 'Use the coverage flow before buying or upgrading so the plan matches where you use it most.'],
        ];
  return container(
    original.id,
    { layout: 'flex', direction: 'column', gap: '6', paddingX: '10', paddingY: '10' },
    [
      nodeText(`${original.id}-headline`, headline, {
        variant: 'headline',
        size: 'M',
        weight: 'high',
        as: 'h2',
      }),
      nodeText(`${original.id}-body`, body, {
        variant: 'body',
        size: 'M',
        attention: 'medium',
        as: 'p',
      }),
      container(
        `${original.id}-items`,
        { layout: 'flex', direction: 'column', gap: '4' },
        questions.map(([question, answer], index) =>
          container(
            `${original.id}-item-${index + 1}`,
            { layout: 'flex', direction: 'column', gap: '2', padding: '5' },
            [
              nodeText(`${original.id}-item-${index + 1}-question`, question, {
                variant: 'title',
                size: 'S',
                weight: 'high',
                as: 'h3',
              }),
              nodeText(`${original.id}-item-${index + 1}-answer`, answer, {
                variant: 'body',
                size: 'S',
                attention: 'medium',
                as: 'p',
              }),
            ],
            'elevated',
            index === 0 ? 'primary' : index === 1 ? 'secondary' : 'sparkle',
          ),
        ),
      ),
      button(`${original.id}-action`, 'Browse all FAQs', 'subtle'),
    ],
    'subtle',
    'primary',
  );
}

function buildFooterSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  const { headline, body } = recipeCopy(spec, 'footer');
  return container(
    original.id,
    { layout: 'flex', direction: 'row', justify: 'space-between', gap: '6', paddingX: '10', paddingY: '8', wrap: true },
    [
      container(
        `${original.id}-brand`,
        { layout: 'flex', direction: 'column', gap: '3' },
        [
          logo(`${original.id}-logo`, inferProductContext(spec) === 'jiofiber' ? 'JioFiber' : 'Jio'),
          nodeText(`${original.id}-headline`, headline, {
            variant: 'title',
            size: 'S',
            weight: 'high',
          }),
          nodeText(`${original.id}-body`, body, {
            variant: 'body',
            size: 'S',
            attention: 'medium',
            maxLines: 2,
          }),
        ],
      ),
      container(
        `${original.id}-links`,
        { layout: 'flex', direction: 'row', gap: '4', align: 'center', wrap: true },
        [
          linkButton(`${original.id}-privacy`, 'Privacy'),
          linkButton(`${original.id}-terms`, 'Terms'),
          linkButton(`${original.id}-support`, 'Support'),
        ],
      ),
    ],
    'subtle',
    'primary',
  );
}

function buildGenericSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  const role = inferSectionRole(original);
  const { headline, body } = recipeCopy(spec, role);
  const product = inferProductContext(spec);
  return container(
    original.id,
    { layout: 'flex', direction: 'column', gap: '5', paddingX: '10', paddingY: '8' },
    [
      nodeText(`${original.id}-headline`, headline, {
        variant: 'title',
        size: 'L',
        weight: 'high',
        as: 'h2',
      }),
      nodeText(`${original.id}-body`, body, {
        variant: 'body',
        size: 'M',
        attention: 'medium',
        as: 'p',
      }),
      button(`${original.id}-action`, product === 'jiofiber' ? 'Explore JioFiber' : 'Explore Jio', 'subtle'),
    ],
    original.surface ?? 'default',
  );
}

function buildSection(original: CompositionNodeT, spec: CompositionSpecT): CompositionNodeT {
  switch (inferSectionRole(original)) {
    case 'nav':
      return buildNavSection(original, spec);
    case 'hero':
      return buildHeroSection(original, spec);
    case 'plans':
      return buildPlansSection(original, spec);
    case 'benefits':
      return buildBenefitsSection(original, spec);
    case 'faq':
      return buildFaqSection(original, spec);
    case 'footer':
      return buildFooterSection(original, spec);
    default:
      return buildGenericSection(original, spec);
  }
}

function shouldIncludeHeader(spec: CompositionSpecT): boolean {
  const haystack = normalizeWhitespace(
    [
      spec.name,
      spec.intent,
      spec.artifactType,
      spec.targetProfile,
      ...Object.keys(spec.content ?? {}),
      ...Object.values(spec.content ?? {}),
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' '),
  ).toLowerCase();
  return /\b(web\s*header|webheader|header|nav|navigation|landing)\b/.test(haystack);
}

function visitNodes(node: CompositionNodeT, visitor: (node: CompositionNodeT) => void): void {
  visitor(node);
  for (const child of childrenOf(node)) visitNodes(child, visitor);
}

function hasSectionText(node: CompositionNodeT): boolean {
  let found = false;
  visitNodes(node, (child) => {
    if (found || child.component !== 'Text') return;
    const text = typeof child.props?.text === 'string' ? normalizeWhitespace(child.props.text) : '';
    const slotText = typeof child.slots?.children === 'string'
      ? normalizeWhitespace(child.slots.children)
      : '';
    if (text || slotText) found = true;
  });
  return found;
}

function hasEmptyStructure(node: CompositionNodeT): boolean {
  let found = false;
  visitNodes(node, (child) => {
    if (found) return;
    const childCount = childrenOf(child).length;
    if ((child.component === 'Container' || child.component === 'Grid' || child.component === 'Surface') && childCount === 0) {
      found = true;
    }
  });
  return found;
}

function shouldRecipeRewriteSection(section: CompositionNodeT): boolean {
  const role = inferSectionRole(section);
  if (role === 'nav' && section.component !== 'WebHeader') return true;
  return hasEmptyStructure(section) || !hasSectionText(section);
}

export function auditCompositionSpecQuality(spec: CompositionSpecT): CompositionQualityAudit {
  const issues: string[] = [];
  const textCounts = new Map<string, number>();
  let textNodeCount = 0;
  let emptyContainerCount = 0;
  let emptySurfaceCount = 0;

  visitNodes(spec.root, (node) => {
    const children = childrenOf(node);
    if ((node.component === 'Container' || node.component === 'Grid') && children.length === 0) {
      emptyContainerCount += 1;
    }
    if (node.component === 'Surface' && children.length === 0) emptySurfaceCount += 1;
    if (node.component === 'Text') {
      textNodeCount += 1;
      const text = typeof node.props?.text === 'string' ? node.props.text : '';
      if (text) textCounts.set(text, (textCounts.get(text) ?? 0) + 1);
    }
  });

  const sections = childrenOf(spec.root);
  const maxRepeatedTextCount = Math.max(0, ...Array.from(textCounts.values()));
  if (sections.length < 3 && spec.artifactType === 'web-ui' && !isFocusedModuleSpec(spec)) {
    issues.push('too-few-sections');
  }
  if (textNodeCount < Math.max(4, sections.length)) issues.push('missing-text-hierarchy');
  if (emptySurfaceCount > 0) issues.push('empty-surface-nodes');
  if (emptyContainerCount > 2) issues.push('empty-container-noise');
  if (maxRepeatedTextCount > 2) issues.push('repeated-visible-copy');

  return {
    passed: issues.length === 0,
    issues,
    sectionCount: sections.length,
    textNodeCount,
    emptyContainerCount,
    emptySurfaceCount,
    maxRepeatedTextCount,
  };
}

export function improveCompositionSpecQuality(spec: CompositionSpecT): CompositionSpecT {
  if (spec.artifactType && spec.artifactType !== 'web-ui') return spec;
  const before = auditCompositionSpecQuality(spec);
  if (before.passed) return spec;
  if (isFocusedModuleSpec(spec)) {
    return spec;
  }
  const next = cloneSpec(spec);
  const sections = childrenOf(next.root);
  if (sections.length === 0) return spec;
  const hasHeader = sections.some((section) => inferSectionRole(section) === 'nav');
  const recipeSections =
    !hasHeader && shouldIncludeHeader(next)
      ? [{ id: 'section-nav', component: 'WebHeader' } as CompositionNodeT, ...sections]
      : sections;

  next.root = {
    ...next.root,
    props: {
      ...(next.root.props ?? {}),
      direction: 'column',
      gap: '0',
    },
    slots: {
      ...(next.root.slots ?? {}),
      children: recipeSections.map((section) =>
        shouldRecipeRewriteSection(section) ? buildSection(section, next) : section,
      ),
    },
  };
  next.metadata = {
    ...(next.metadata ?? {}),
    qualityRecipeVersion: QUALITY_RECIPE_VERSION,
    qualityIssuesBefore: before.issues.join(',') || 'none',
  };
  return next;
}
