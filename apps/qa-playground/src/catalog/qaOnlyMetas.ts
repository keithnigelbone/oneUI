/**
 * QA-playground-only catalog entries — not registered in `@oneui/ui` metaRegistry.
 * Keeps dev/Playwright routes (e.g. `/c/input`) out of the published component package.
 */
import type { ComponentMeta } from '@oneui/shared';

/** Bare `Input` control — separate from registry `InputField` (`input-field`). */
export const INPUT_QA_META: ComponentMeta = {
  name: 'Input',
  slug: 'input',
  displayName: 'Input',
  description:
    'Text input control (bordered shell + optional label). QA playground only — use Input Field for composed validation UX.',
  category: 'inputs',
  tags: ['input', 'text', 'form', 'qa-only'],

  props: [],
  slots: [],

  previewMatrix: {
    variants: ['default'],
    variantLabels: { default: 'Default' },
    sizes: [10],
    sizeLabels: { '10': 'M' },
  },

  surfaceAware: true,
  multiAccent: true,
};

/** Figma DynamicText helper row — QA only (lives under `Input/internals`). */
export const INPUT_DYNAMIC_TEXT_QA_META: ComponentMeta = {
  name: 'InputDynamicText',
  slug: 'input-dynamic-text',
  displayName: 'Input Dynamic Text',
  description:
    'Figma DynamicText row: optional leading copy (`content`) and trailing action (`end` Button). QA playground only.',
  category: 'inputs',
  tags: ['input', 'dynamic-text', 'helper', 'qa-only'],

  props: [],
  slots: [],

  previewMatrix: {
    variants: ['default'],
    variantLabels: { default: 'Default' },
    sizes: [8, 10, 12],
    sizeLabels: { '8': 'S', '10': 'M', '12': 'L' },
  },

  surfaceAware: false,
  multiAccent: false,
};

/** Figma InputFeedback row — QA only (lives under `Input/internals`). */
export const INPUT_FEEDBACK_QA_META: ComponentMeta = {
  name: 'InputFeedback',
  slug: 'input-feedback',
  displayName: 'Input Feedback',
  description:
    'Contextual validation or informational message under inputs. Four variants × three attention levels × S/M/L. QA playground only.',
  category: 'inputs',
  tags: ['input', 'feedback', 'validation', 'qa-only'],

  props: [],
  slots: [],

  previewMatrix: {
    variants: ['negative', 'positive', 'warning', 'informative'],
    variantLabels: {
      negative: 'Negative',
      positive: 'Positive',
      warning: 'Warning',
      informative: 'Informative',
    },
    sizes: [8, 10, 12],
    sizeLabels: { '8': 'S', '10': 'M', '12': 'L' },
  },

  surfaceAware: true,
  multiAccent: true,
};

/** Metas merged into the QA catalog alongside `ALL_COMPONENT_METAS`. */
export const QA_ONLY_METAS: ComponentMeta[] = [
  INPUT_QA_META,
  INPUT_DYNAMIC_TEXT_QA_META,
  INPUT_FEEDBACK_QA_META,
];
