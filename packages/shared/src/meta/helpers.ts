/**
 * Meta Helpers — Utility functions for working with ComponentMeta descriptors.
 */

import type { ComponentMeta, ComponentCategory } from '../types/componentMeta';

/**
 * Filter components by category.
 */
export function getComponentsByCategory(
  components: ComponentMeta[],
  category: ComponentCategory,
): ComponentMeta[] {
  return components.filter(c => c.category === category);
}

/**
 * Get all brand-overridable prop names from a component's meta.
 */
export function getBrandOverridableProps(meta: ComponentMeta): string[] {
  return meta.props
    .filter(p => p.brandOverridable)
    .map(p => p.name);
}
