/**
 * inputTemplates.ts
 *
 * Predefined AST compositions for input components
 * (Checkbox, Radio, Switch, Stepper).
 */

import type { ASTRoot } from '../types/componentAST';

export const CHECKBOX_BASIC: ASTRoot = {
  version: 1,
  name: 'Checkbox with Label',
  root: {
    id: 'cb-basic',
    kind: 'component',
    type: 'Checkbox',
    props: {},
    children: [{ id: 'cb-basic-text', kind: 'text', text: 'Accept terms and conditions' }],
  },
};

export const CHECKBOX_GROUP: ASTRoot = {
  version: 1,
  name: 'Checkbox Group',
  root: {
    id: 'cb-group',
    kind: 'element',
    tag: 'fieldset',
    props: { style: { display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)', border: 'none', padding: 0 } },
    children: [
      {
        id: 'cb-g-1',
        kind: 'component',
        type: 'Checkbox',
        props: { checked: true },
        children: [{ id: 'cb-g-1-text', kind: 'text', text: 'Email notifications' }],
      },
      {
        id: 'cb-g-2',
        kind: 'component',
        type: 'Checkbox',
        props: { checked: true },
        children: [{ id: 'cb-g-2-text', kind: 'text', text: 'Push notifications' }],
      },
      {
        id: 'cb-g-3',
        kind: 'component',
        type: 'Checkbox',
        props: {},
        children: [{ id: 'cb-g-3-text', kind: 'text', text: 'SMS notifications' }],
      },
    ],
  },
};

export const SWITCH_BASIC: ASTRoot = {
  version: 1,
  name: 'Switch with Label',
  root: {
    id: 'sw-basic',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--Spacing-4)' } },
    children: [
      { id: 'sw-basic-label', kind: 'text', text: 'Dark mode' },
      {
        id: 'sw-basic-ctrl',
        kind: 'component',
        type: 'Switch',
        props: { checked: false },
        children: [],
      },
    ],
  },
};

export const STEPPER_BASIC: ASTRoot = {
  version: 1,
  name: 'Stepper',
  root: {
    id: 'st-basic',
    kind: 'component',
    type: 'Stepper',
    props: { value: 1, min: 0, max: 10 },
    children: [],
  },
};

export const STEPPER_QUANTITY: ASTRoot = {
  version: 1,
  name: 'Quantity Selector',
  root: {
    id: 'st-qty',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' } },
    children: [
      { id: 'st-qty-label', kind: 'text', text: 'Quantity' },
      {
        id: 'st-qty-ctrl',
        kind: 'component',
        type: 'Stepper',
        props: { value: 1, min: 1, max: 99 },
        children: [],
      },
    ],
  },
};

export const CHECKBOX_TEMPLATES: ASTRoot[] = [CHECKBOX_BASIC, CHECKBOX_GROUP];
export const SWITCH_TEMPLATES: ASTRoot[] = [SWITCH_BASIC];
export const STEPPER_TEMPLATES: ASTRoot[] = [STEPPER_BASIC, STEPPER_QUANTITY];
