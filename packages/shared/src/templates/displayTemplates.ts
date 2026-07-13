/**
 * displayTemplates.ts
 *
 * Predefined AST compositions for display components
 * (Avatar, IconContained, Image).
 */

import type { ASTRoot } from '../types/componentAST';

export const AVATAR_BASIC: ASTRoot = {
  version: 1,
  name: 'Avatar',
  root: {
    id: 'av-basic',
    kind: 'component',
    type: 'Avatar',
    props: { size: 'l', attention: 'high' },
    children: [],
  },
};

export const AVATAR_GROUP: ASTRoot = {
  version: 1,
  name: 'Avatar Group',
  root: {
    id: 'av-group',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', gap: 'var(--Spacing-3)' } },
    children: [
      { id: 'av-g-1', kind: 'component', type: 'Avatar', props: { size: 'm', attention: 'high' }, children: [] },
      { id: 'av-g-2', kind: 'component', type: 'Avatar', props: { size: 'm', attention: 'high' }, children: [] },
      { id: 'av-g-3', kind: 'component', type: 'Avatar', props: { size: 'm', attention: 'high' }, children: [] },
    ],
  },
};

export const ICON_CONTAINED_BASIC: ASTRoot = {
  version: 1,
  name: 'Icon Contained',
  root: {
    id: 'ic-basic',
    kind: 'component',
    type: 'IconContained',
    props: { attention: 'high', size: 'm' },
    children: [],
  },
};

export const ICON_CONTAINED_ROW: ASTRoot = {
  version: 1,
  name: 'Icon Contained Row',
  root: {
    id: 'ic-row',
    kind: 'element',
    tag: 'div',
    props: { style: { display: 'flex', gap: 'var(--Spacing-4)' } },
    children: [
      { id: 'ic-r-1', kind: 'component', type: 'IconContained', props: { attention: 'high', size: 'm' }, children: [] },
      { id: 'ic-r-2', kind: 'component', type: 'IconContained', props: { attention: 'medium', size: 'm' }, children: [] },
      { id: 'ic-r-3', kind: 'component', type: 'IconContained', props: { attention: 'high', size: 'm', appearance: 'positive' }, children: [] },
    ],
  },
};

export const IMAGE_BASIC: ASTRoot = {
  version: 1,
  name: 'Image',
  root: {
    id: 'img-basic',
    kind: 'component',
    type: 'Image',
    props: { src: 'https://placehold.co/400x300', alt: 'Placeholder image', aspectRatio: '4:3' },
    children: [],
  },
};

export const COUNTER_BADGE_BASIC: ASTRoot = {
  version: 1,
  name: 'Counter Badge',
  root: {
    id: 'cb-basic',
    kind: 'component',
    type: 'CounterBadge',
    props: { count: 5 },
    children: [],
  },
};

export const INDICATOR_BADGE_BASIC: ASTRoot = {
  version: 1,
  name: 'Indicator Badge',
  root: {
    id: 'ib-basic',
    kind: 'component',
    type: 'IndicatorBadge',
    props: {},
    children: [],
  },
};

export const AVATAR_TEMPLATES: ASTRoot[] = [AVATAR_BASIC, AVATAR_GROUP];
export const ICON_CONTAINED_TEMPLATES: ASTRoot[] = [ICON_CONTAINED_BASIC, ICON_CONTAINED_ROW];
export const IMAGE_TEMPLATES: ASTRoot[] = [IMAGE_BASIC];
export const COUNTER_BADGE_TEMPLATES: ASTRoot[] = [COUNTER_BADGE_BASIC];
export const INDICATOR_BADGE_TEMPLATES: ASTRoot[] = [INDICATOR_BADGE_BASIC];
