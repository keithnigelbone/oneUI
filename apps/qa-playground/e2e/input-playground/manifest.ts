/**
 * Anchors from `InputQaShowcase.tsx` (Test Scenarios tab).
 * `data-testid` is forwarded to the native `<input>` by `Input`.
 *
 * Component type: **input** (text field — interactive, tabbable, typing).
 */

export const INPUT_PLAYGROUND_ROUTE = '/c/input';

export const INPUT_COMPONENT_TYPE = 'input' as const;

export const INPUT_SHOWCASE_AXE_SCOPE = '[data-section^="input-qa-"]';

/** Figma appearance table (+ `auto`). */
export const INPUT_FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

export const INPUT_FIGMA_SIZES = ['S', 'M', 'L'] as const;

export const INPUT_FIGMA_ATTENTIONS = ['medium', 'high'] as const;

export const INPUT_FIGMA_SHAPES = ['default', 'pill'] as const;

export const INPUT_FIGMA_STATES = ['idle', 'filled', 'readonly', 'disabled', 'feedback'] as const;

export const INPUT_SLOT_START = [
  'icon',
  'iconbutton',
  'avatar',
  'image',
  'chipgroup',
  'text',
] as const;

export const INPUT_SLOT_START2 = ['text'] as const;

export const INPUT_SLOT_END = ['iconbutton', 'icon', 'button', 'text'] as const;

export const INPUT_SLOT_END2 = ['text', 'icon', 'iconbutton'] as const;

export const INPUT_HTML_TYPES = [
  { type: 'text', testId: 'input-type-text', placeholder: 'Text' },
  { type: 'email', testId: 'input-type-email', placeholder: 'you@example.com' },
  { type: 'password', testId: 'input-type-password', placeholder: 'Password' },
  { type: 'number', testId: 'input-type-number', placeholder: '0' },
  { type: 'tel', testId: 'input-type-tel', placeholder: '+1 000 000 0000' },
  { type: 'search', testId: 'input-type-search', placeholder: 'Search' },
] as const;

/** Maps Figma `state` values to stable showcase `data-testid`s (legacy ids preserved). */
const STATE_TESTID_BY_FIGMA: Record<(typeof INPUT_FIGMA_STATES)[number], string> = {
  idle: 'input-state-idle',
  filled: 'input-state-filled',
  readonly: 'input-readonly',
  disabled: 'input-disabled',
  feedback: 'input-error',
};

export const INPUT_ROOT_TESTIDS = {
  default: 'input-default',
  placeholder: 'input-placeholder',
  labeled: 'input-labeled',
  autofocus: 'input-autofocus',
  maxlength: 'input-maxlength',
  pattern: 'input-pattern',
  fullwidth: 'input-fullwidth',
  typePassword: 'input-type-password',
  passwordToggle: 'input-password-toggle',
  typeEmail: 'input-type-email',
  typeNumber: 'input-type-number',
  typeText: 'input-type-text',
  typeTel: 'input-type-tel',
  typeSearch: 'input-type-search',
  startAdornment: 'input-start-adornment',
  endAdornment: 'input-end-adornment',
  required: 'input-required',
} as const;

export function inputAppearanceTestId(appearance: (typeof INPUT_FIGMA_APPEARANCES)[number]): string {
  return `input-appearance-${appearance}`;
}

export function inputSizeTestId(figma: (typeof INPUT_FIGMA_SIZES)[number]): string {
  return `input-size-${figma}`;
}

export function inputSizeAliasTestId(alias: 'small' | 'medium' | 'large'): string {
  return `input-size-alias-${alias}`;
}

export function inputAttentionTestId(attention: (typeof INPUT_FIGMA_ATTENTIONS)[number]): string {
  return `input-attention-${attention}`;
}

export function inputShapeTestId(shape: (typeof INPUT_FIGMA_SHAPES)[number]): string {
  return `input-shape-${shape}`;
}

export function inputStateTestId(state: (typeof INPUT_FIGMA_STATES)[number]): string {
  return STATE_TESTID_BY_FIGMA[state];
}

export function inputSlotStartTestId(kind: (typeof INPUT_SLOT_START)[number]): string {
  return `input-slot-start-${kind}`;
}

export function inputSlotStart2TestId(kind: (typeof INPUT_SLOT_START2)[number]): string {
  return `input-slot-start2-${kind}`;
}

export function inputSlotEndTestId(kind: (typeof INPUT_SLOT_END)[number]): string {
  return `input-slot-end-${kind}`;
}

export function inputSlotEnd2TestId(kind: (typeof INPUT_SLOT_END2)[number]): string {
  return `input-slot-end2-${kind}`;
}

export const INPUT_DATA_SECTIONS = [
  'input-qa-default',
  'input-qa-placeholder',
  'input-qa-size',
  'input-qa-attention',
  'input-qa-appearance',
  'input-qa-shape',
  'input-qa-states',
  'input-qa-adornments',
  'input-qa-slots',
  'input-qa-types',
  'input-qa-validation',
  'input-qa-layout',
  'input-qa-labeled',
  'input-qa-combos',
] as const;

export const INPUT_SECTION_COUNT = INPUT_DATA_SECTIONS.length;

export const INPUT_COMBO_COUNT = 4;

/** Per-control axe targets (labeled or high-signal scenarios). */
const INPUT_SIZE_ALIASES = ['small', 'medium', 'large'] as const;

/** Every showcase `data-testid` (inputs + password visibility toggle). */
export function allInputPlaygroundTestIds(): string[] {
  const ids: string[] = [
    INPUT_ROOT_TESTIDS.default,
    INPUT_ROOT_TESTIDS.placeholder,
    INPUT_ROOT_TESTIDS.labeled,
    INPUT_ROOT_TESTIDS.autofocus,
    INPUT_ROOT_TESTIDS.maxlength,
    INPUT_ROOT_TESTIDS.pattern,
    INPUT_ROOT_TESTIDS.fullwidth,
    INPUT_ROOT_TESTIDS.startAdornment,
    INPUT_ROOT_TESTIDS.endAdornment,
    INPUT_ROOT_TESTIDS.required,
    INPUT_ROOT_TESTIDS.passwordToggle,
    'input-size-XS',
  ];

  for (const figma of INPUT_FIGMA_SIZES) {
    ids.push(inputSizeTestId(figma));
  }
  for (const alias of INPUT_SIZE_ALIASES) {
    ids.push(inputSizeAliasTestId(alias));
  }
  for (const attention of INPUT_FIGMA_ATTENTIONS) {
    ids.push(inputAttentionTestId(attention));
  }
  for (const appearance of INPUT_FIGMA_APPEARANCES) {
    ids.push(inputAppearanceTestId(appearance));
  }
  for (const shape of INPUT_FIGMA_SHAPES) {
    ids.push(inputShapeTestId(shape));
  }
  for (const state of INPUT_FIGMA_STATES) {
    ids.push(inputStateTestId(state));
  }
  for (const kind of INPUT_SLOT_START) {
    ids.push(inputSlotStartTestId(kind));
  }
  for (const kind of INPUT_SLOT_START2) {
    ids.push(inputSlotStart2TestId(kind));
  }
  for (const kind of INPUT_SLOT_END) {
    ids.push(inputSlotEndTestId(kind));
  }
  for (const kind of INPUT_SLOT_END2) {
    ids.push(inputSlotEnd2TestId(kind));
  }
  for (const { testId } of INPUT_HTML_TYPES) {
    ids.push(testId);
  }
  for (let i = 0; i < INPUT_COMBO_COUNT; i += 1) {
    ids.push(`input-combo-${i}`);
  }

  return ids;
}

export const INPUT_ALL_TESTIDS = allInputPlaygroundTestIds();

export const INPUT_AXE_TARGET_TESTIDS = [
  'input-default',
  'input-placeholder',
  'input-labeled',
  'input-disabled',
  'input-readonly',
  'input-error',
  'input-required',
  'input-state-filled',
  'input-attention-high',
  'input-appearance-primary',
  'input-shape-pill',
  'input-start-adornment',
  'input-end-adornment',
  'input-slot-start-icon',
  'input-type-password',
  'input-type-text',
  'input-fullwidth',
] as const;
