/**
 * templates/index.ts
 *
 * Predefined AST compositions for common UI patterns.
 * Templates are pure data (no React dependency) — usable by
 * both ASTRenderer (visual) and astToReact (code export).
 */

import type { ASTRoot } from '../types/componentAST';

// Button templates
export { BUTTON_BASIC, BUTTON_WITH_ICON, BUTTON_GROUP, BUTTON_VARIANT_ROW, BUTTON_TEMPLATES } from './buttonTemplates';

// Action templates (IconButton)
export {
  ICON_BUTTON_BASIC, ICON_BUTTON_TOOLBAR, ICON_BUTTON_TEMPLATES,
} from './actionTemplates';

// Input templates (Checkbox, Switch, Stepper)
export {
  CHECKBOX_BASIC, CHECKBOX_GROUP, CHECKBOX_TEMPLATES,
  SWITCH_BASIC, SWITCH_TEMPLATES,
  STEPPER_BASIC, STEPPER_QUANTITY, STEPPER_TEMPLATES,
} from './inputTemplates';

// Display templates (Avatar, IconContained, Image, Badges)
export {
  AVATAR_BASIC, AVATAR_GROUP, AVATAR_TEMPLATES,
  ICON_CONTAINED_BASIC, ICON_CONTAINED_ROW, ICON_CONTAINED_TEMPLATES,
  IMAGE_BASIC, IMAGE_TEMPLATES,
  COUNTER_BADGE_BASIC, COUNTER_BADGE_TEMPLATES,
  INDICATOR_BADGE_BASIC, INDICATOR_BADGE_TEMPLATES,
} from './displayTemplates';

// Form composition templates
export { FORM_SETTINGS, FORM_LOGIN, FORM_TEMPLATES } from './formTemplates';

// ---------------------------------------------------------------------------
// Template registry — keyed by component slug for editor lookup
// ---------------------------------------------------------------------------

import { BUTTON_TEMPLATES } from './buttonTemplates';
import { ICON_BUTTON_TEMPLATES } from './actionTemplates';
import { CHECKBOX_TEMPLATES, SWITCH_TEMPLATES, STEPPER_TEMPLATES } from './inputTemplates';
import {
  AVATAR_TEMPLATES, ICON_CONTAINED_TEMPLATES, IMAGE_TEMPLATES,
  COUNTER_BADGE_TEMPLATES, INDICATOR_BADGE_TEMPLATES,
} from './displayTemplates';
import { FORM_TEMPLATES } from './formTemplates';

/** All templates organized by component slug */
export const TEMPLATE_REGISTRY: Record<string, ASTRoot[]> = {
  button: BUTTON_TEMPLATES,
  'icon-button': ICON_BUTTON_TEMPLATES,
  checkbox: CHECKBOX_TEMPLATES,
  switch: SWITCH_TEMPLATES,
  stepper: STEPPER_TEMPLATES,
  avatar: AVATAR_TEMPLATES,
  'icon-contained': ICON_CONTAINED_TEMPLATES,
  image: IMAGE_TEMPLATES,
  'counter-badge': COUNTER_BADGE_TEMPLATES,
  'indicator-badge': INDICATOR_BADGE_TEMPLATES,
};

/** All composition templates (multi-component patterns) */
export const COMPOSITION_TEMPLATES: ASTRoot[] = [
  ...FORM_TEMPLATES,
];

/** Get templates for a specific component slug */
export function getTemplatesForComponent(slug: string): ASTRoot[] {
  return TEMPLATE_REGISTRY[slug] ?? [];
}

/** Get all available templates */
export function getAllTemplates(): ASTRoot[] {
  return [
    ...Object.values(TEMPLATE_REGISTRY).flat(),
    ...COMPOSITION_TEMPLATES,
  ];
}
