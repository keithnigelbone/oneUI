/**
 * buttonTemplates.ts
 *
 * Predefined AST compositions for Button variants.
 */

import type { ASTRoot } from '../types/componentAST';

export const BUTTON_BASIC: ASTRoot = {
  version: 1,
  name: 'Basic Button',
  root: {
    id: 'btn-basic',
    kind: 'component',
    type: 'Button',
    props: { variant: 'bold', size: 10 },
    children: [{ id: 'btn-basic-text', kind: 'text', text: 'Get Started' }],
  },
};

export const BUTTON_WITH_ICON: ASTRoot = {
  version: 1,
  name: 'Button with Icon',
  root: {
    id: 'btn-icon',
    kind: 'component',
    type: 'Button',
    props: { variant: 'bold', size: 10 },
    children: [{ id: 'btn-icon-text', kind: 'text', text: 'Add Item' }],
  },
};

export const BUTTON_GROUP: ASTRoot = {
  version: 1,
  name: 'Button Group',
  root: {
    id: 'btn-group',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', gap: 'var(--Spacing-4)' } },
    children: [
      {
        id: 'btn-group-primary',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold' },
        children: [{ id: 'btn-group-primary-text', kind: 'text', text: 'Confirm' }],
      },
      {
        id: 'btn-group-secondary',
        kind: 'component',
        type: 'Button',
        props: { variant: 'subtle' },
        children: [{ id: 'btn-group-secondary-text', kind: 'text', text: 'Cancel' }],
      },
    ],
  },
};

export const BUTTON_VARIANT_ROW: ASTRoot = {
  version: 1,
  name: 'All Button Variants',
  root: {
    id: 'btn-variants',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', gap: 'var(--Spacing-4)', alignItems: 'center' } },
    children: [
      {
        id: 'btn-v-bold',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold' },
        children: [{ id: 'btn-v-bold-text', kind: 'text', text: 'Bold' }],
      },
      {
        id: 'btn-v-subtle',
        kind: 'component',
        type: 'Button',
        props: { variant: 'subtle' },
        children: [{ id: 'btn-v-subtle-text', kind: 'text', text: 'Subtle' }],
      },
      {
        id: 'btn-v-ghost',
        kind: 'component',
        type: 'Button',
        props: { variant: 'ghost' },
        children: [{ id: 'btn-v-ghost-text', kind: 'text', text: 'Ghost' }],
      },
    ],
  },
};

export const BUTTON_TEMPLATES: ASTRoot[] = [
  BUTTON_BASIC,
  BUTTON_WITH_ICON,
  BUTTON_GROUP,
  BUTTON_VARIANT_ROW,
];
