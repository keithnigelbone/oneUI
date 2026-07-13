/**
 * actionTemplates.ts
 *
 * Predefined AST compositions for action components
 * (IconButton and multi-component action patterns).
 */

import type { ASTRoot } from '../types/componentAST';

export const ICON_BUTTON_BASIC: ASTRoot = {
  version: 1,
  name: 'Icon Button',
  root: {
    id: 'ib-basic',
    kind: 'component',
    type: 'IconButton',
    props: { variant: 'bold', 'aria-label': 'Add' },
    children: [],
  },
};

export const ICON_BUTTON_TOOLBAR: ASTRoot = {
  version: 1,
  name: 'Icon Button Toolbar',
  root: {
    id: 'ib-toolbar',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', gap: 'var(--Spacing-3)' } },
    children: [
      {
        id: 'ib-tb-edit',
        kind: 'component',
        type: 'IconButton',
        props: { variant: 'ghost', 'aria-label': 'Edit' },
        children: [],
      },
      {
        id: 'ib-tb-copy',
        kind: 'component',
        type: 'IconButton',
        props: { variant: 'ghost', 'aria-label': 'Copy' },
        children: [],
      },
      {
        id: 'ib-tb-delete',
        kind: 'component',
        type: 'IconButton',
        props: { variant: 'ghost', 'aria-label': 'Delete' },
        children: [],
      },
    ],
  },
};

export const ICON_BUTTON_TEMPLATES: ASTRoot[] = [ICON_BUTTON_BASIC, ICON_BUTTON_TOOLBAR];
