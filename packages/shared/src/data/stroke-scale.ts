/**
 * OneUI stroke width scale.
 *
 * Mirrors the Figma plugin's `dimensions/strokes/*` variables:
 * fixed leaves through 2XL, then dimension f-step aliases from 3XL onward.
 */

export type StrokeScaleKey =
  | 'None'
  | 'S'
  | 'M'
  | 'L'
  | 'XL'
  | '2XL'
  | '3XL'
  | '4XL'
  | '5XL'
  | '6XL'
  | '7XL'
  | '8XL'
  | '9XL';

export type StrokeTokenName = `Stroke-${StrokeScaleKey}`;

export type StrokeScaleToken =
  | {
      key: StrokeScaleKey;
      token: StrokeTokenName;
      cssVar: `--${StrokeTokenName}`;
      label: string;
      kind: 'fixed';
      px: number;
      value: string;
      description: string;
    }
  | {
      key: StrokeScaleKey;
      token: StrokeTokenName;
      cssVar: `--${StrokeTokenName}`;
      label: string;
      kind: 'dimension';
      fStep: string;
      value: string;
      description: string;
    };

export const STROKE_SCALE_TOKENS = [
  {
    key: 'None',
    token: 'Stroke-None',
    cssVar: '--Stroke-None',
    label: 'None',
    kind: 'fixed',
    px: 0,
    value: '0px',
    description: 'No stroke',
  },
  {
    key: 'S',
    token: 'Stroke-S',
    cssVar: '--Stroke-S',
    label: 'S',
    kind: 'fixed',
    px: 0.5,
    value: '0.5px',
    description: 'Hairline stroke',
  },
  {
    key: 'M',
    token: 'Stroke-M',
    cssVar: '--Stroke-M',
    label: 'M',
    kind: 'fixed',
    px: 1,
    value: '1px',
    description: 'Default stroke',
  },
  {
    key: 'L',
    token: 'Stroke-L',
    cssVar: '--Stroke-L',
    label: 'L',
    kind: 'fixed',
    px: 1.5,
    value: '1.5px',
    description: 'Emphasized stroke',
  },
  {
    key: 'XL',
    token: 'Stroke-XL',
    cssVar: '--Stroke-XL',
    label: 'XL',
    kind: 'fixed',
    px: 2,
    value: '2px',
    description: 'Focus and strong stroke',
  },
  {
    key: '2XL',
    token: 'Stroke-2XL',
    cssVar: '--Stroke-2XL',
    label: '2XL',
    kind: 'fixed',
    px: 3,
    value: '3px',
    description: 'Heavy fixed stroke',
  },
  {
    key: '3XL',
    token: 'Stroke-3XL',
    cssVar: '--Stroke-3XL',
    label: '3XL',
    kind: 'dimension',
    fStep: 'f-6',
    value: 'var(--Dimension-f-6)',
    description: 'Responsive stroke mapped to f-6',
  },
  {
    key: '4XL',
    token: 'Stroke-4XL',
    cssVar: '--Stroke-4XL',
    label: '4XL',
    kind: 'dimension',
    fStep: 'f-5',
    value: 'var(--Dimension-f-5)',
    description: 'Responsive stroke mapped to f-5',
  },
  {
    key: '5XL',
    token: 'Stroke-5XL',
    cssVar: '--Stroke-5XL',
    label: '5XL',
    kind: 'dimension',
    fStep: 'f-4',
    value: 'var(--Dimension-f-4)',
    description: 'Responsive stroke mapped to f-4',
  },
  {
    key: '6XL',
    token: 'Stroke-6XL',
    cssVar: '--Stroke-6XL',
    label: '6XL',
    kind: 'dimension',
    fStep: 'f-3',
    value: 'var(--Dimension-f-3)',
    description: 'Responsive stroke mapped to f-3',
  },
  {
    key: '7XL',
    token: 'Stroke-7XL',
    cssVar: '--Stroke-7XL',
    label: '7XL',
    kind: 'dimension',
    fStep: 'f-2',
    value: 'var(--Dimension-f-2)',
    description: 'Responsive stroke mapped to f-2',
  },
  {
    key: '8XL',
    token: 'Stroke-8XL',
    cssVar: '--Stroke-8XL',
    label: '8XL',
    kind: 'dimension',
    fStep: 'f-1',
    value: 'var(--Dimension-f-1)',
    description: 'Responsive stroke mapped to f-1',
  },
  {
    key: '9XL',
    token: 'Stroke-9XL',
    cssVar: '--Stroke-9XL',
    label: '9XL',
    kind: 'dimension',
    fStep: 'f0',
    value: 'var(--Dimension-f0)',
    description: 'Responsive stroke mapped to f0',
  },
] as const satisfies readonly StrokeScaleToken[];

export const STROKE_TOKEN_OPTIONS = STROKE_SCALE_TOKENS.map((stroke) => ({
  token: stroke.token,
  label: stroke.kind === 'fixed' ? `${stroke.label} (${stroke.value})` : `${stroke.label} -> ${stroke.fStep}`,
  previewValue: stroke.kind === 'fixed' ? stroke.value : undefined,
}));

