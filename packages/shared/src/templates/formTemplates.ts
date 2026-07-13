/**
 * formTemplates.ts
 *
 * Predefined AST compositions for form patterns.
 */

import type { ASTRoot } from '../types/componentAST';

export const FORM_SETTINGS: ASTRoot = {
  version: 1,
  name: 'Settings Form',
  root: {
    id: 'form-settings',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' } },
    children: [
      {
        id: 'form-switch-notif',
        kind: 'element',
        tag: 'div',
        props: { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        children: [
          { id: 'form-switch-notif-label', kind: 'text', text: 'Enable notifications' },
          {
            id: 'form-switch-notif-ctrl',
            kind: 'component',
            type: 'Switch',
            props: { checked: true },
            children: [],
          },
        ],
      },
      {
        id: 'form-switch-dark',
        kind: 'element',
        tag: 'div',
        props: { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        children: [
          { id: 'form-switch-dark-label', kind: 'text', text: 'Dark mode' },
          {
            id: 'form-switch-dark-ctrl',
            kind: 'component',
            type: 'Switch',
            props: { checked: false },
            children: [],
          },
        ],
      },
      {
        id: 'form-checkbox-terms',
        kind: 'component',
        type: 'Checkbox',
        props: {},
        children: [{ id: 'form-checkbox-terms-text', kind: 'text', text: 'I agree to the terms and conditions' }],
      },
      {
        id: 'form-submit',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold', fullWidth: true },
        children: [{ id: 'form-submit-text', kind: 'text', text: 'Save Settings' }],
      },
    ],
  },
};

export const FORM_LOGIN: ASTRoot = {
  version: 1,
  name: 'Login Actions',
  root: {
    id: 'form-login',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' } },
    children: [
      {
        id: 'form-login-remember',
        kind: 'component',
        type: 'Checkbox',
        props: { checked: true },
        children: [{ id: 'form-login-remember-text', kind: 'text', text: 'Remember me' }],
      },
      {
        id: 'form-login-submit',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold', fullWidth: true },
        children: [{ id: 'form-login-submit-text', kind: 'text', text: 'Sign In' }],
      },
      {
        id: 'form-login-link',
        kind: 'component',
        type: 'Button',
        props: { contained: false, variant: 'ghost' },
        children: [{ id: 'form-login-link-text', kind: 'text', text: 'Forgot password?' }],
      },
    ],
  },
};

export const FORM_TEMPLATES: ASTRoot[] = [
  FORM_SETTINGS,
  FORM_LOGIN,
];
