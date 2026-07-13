import {
  STROKE_SCALE_TOKENS,
  type StrokeTokenName,
} from './data/stroke-scale';
import { AVAILABLE_TOKENS } from './types/componentTokens';

export type ComponentDecorationKind = 'svg-ornament' | 'css-decoration';

export type ComponentCssDecorationOption =
  | 'none'
  | 'inset-stroke'
  | 'underline'
  | 'cut-corner';

export type ComponentCssDecorationStrokeStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double';

export type ComponentCssDecorationStrokeWidth =
  Exclude<StrokeTokenName, 'Stroke-None'>;

const COMPONENT_DECORATION_STROKE_WIDTH_TOKEN_NAMES = STROKE_SCALE_TOKENS
  .map((stroke) => stroke.token)
  .filter(
    (token): token is ComponentCssDecorationStrokeWidth =>
      token !== 'Stroke-None',
  );

export const COMPONENT_DECORATION_STROKE_WIDTH_OPTIONS =
  COMPONENT_DECORATION_STROKE_WIDTH_TOKEN_NAMES.map((value) => {
    const token = AVAILABLE_TOKENS.stroke.find((option) => option.token === value);
    return {
      value,
      label: token?.label ?? value,
      description: `Foundation ${value} token for CSS-only decoration thickness.`,
    };
  });

export const COMPONENT_DECORATION_STROKE_STYLE_OPTIONS = [
  {
    value: 'solid',
    label: 'Solid',
    description: 'Continuous CSS decoration stroke.',
  },
  {
    value: 'dashed',
    label: 'Dashed',
    description: 'Dashed CSS decoration stroke.',
  },
  {
    value: 'dotted',
    label: 'Dotted',
    description: 'Dotted CSS decoration stroke.',
  },
  {
    value: 'double',
    label: 'Double',
    description: 'Double-line CSS decoration stroke.',
  },
] as const;

export interface ComponentDecorationCapability {
  componentName: string;
  slug: string;
  label: string;
  familyId: 'actions' | 'inputs' | 'display';
  supportedKinds: ComponentDecorationKind[];
  cssOptions?: ComponentCssDecorationOption[];
}

const ACTION_CSS_OPTIONS: ComponentCssDecorationOption[] = [
  'none',
  'inset-stroke',
  'underline',
  'cut-corner',
];

const FORM_CSS_OPTIONS: ComponentCssDecorationOption[] = [
  'none',
  'inset-stroke',
  'cut-corner',
];

export const COMPONENT_DECORATION_CAPABILITIES: readonly ComponentDecorationCapability[] =
  [
    {
      componentName: 'Button',
      slug: 'button',
      label: 'Button',
      familyId: 'actions',
      supportedKinds: ['svg-ornament', 'css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'IconButton',
      slug: 'icon-button',
      label: 'IconButton',
      familyId: 'actions',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'SelectableButton',
      slug: 'selectable-button',
      label: 'Selectable Button',
      familyId: 'actions',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'SelectableIconButton',
      slug: 'selectable-icon-button',
      label: 'Selectable IconButton',
      familyId: 'actions',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'SelectableSingleTextButton',
      slug: 'selectable-single-text-button',
      label: 'Selectable Single Text',
      familyId: 'actions',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'SingleTextButton',
      slug: 'single-text-button',
      label: 'Single Text Button',
      familyId: 'actions',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'Chip',
      slug: 'chip',
      label: 'Chip',
      familyId: 'actions',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'Input',
      slug: 'input',
      label: 'Input',
      familyId: 'inputs',
      supportedKinds: ['css-decoration'],
      cssOptions: FORM_CSS_OPTIONS,
    },
    {
      componentName: 'Badge',
      slug: 'badge',
      label: 'Badge',
      familyId: 'display',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
    {
      componentName: 'CounterBadge',
      slug: 'counter-badge',
      label: 'Counter Badge',
      familyId: 'display',
      supportedKinds: ['css-decoration'],
      cssOptions: ACTION_CSS_OPTIONS,
    },
  ] as const;

export function getComponentDecorationCapability(
  componentNameOrSlug: string,
): ComponentDecorationCapability | undefined {
  const lookup = componentNameOrSlug.toLowerCase();
  return COMPONENT_DECORATION_CAPABILITIES.find(
    (capability) =>
      capability.componentName.toLowerCase() === lookup ||
      capability.slug.toLowerCase() === lookup,
  );
}

export function getSvgDecorationComponents(): ComponentDecorationCapability[] {
  return COMPONENT_DECORATION_CAPABILITIES.filter((capability) =>
    capability.supportedKinds.includes('svg-ornament'),
  );
}

export function getCssDecorationComponents(): ComponentDecorationCapability[] {
  return COMPONENT_DECORATION_CAPABILITIES.filter((capability) =>
    capability.supportedKinds.includes('css-decoration'),
  );
}
