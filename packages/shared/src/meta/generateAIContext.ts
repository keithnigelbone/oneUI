/**
 * generateAIContext.ts
 *
 * Generates a markdown document from ComponentMeta descriptors suitable for
 * use as an LLM system prompt. Includes component descriptions, editable props,
 * slots, and brand-overridable properties.
 */

import type { ComponentMeta, PropDescriptor } from '../types/componentMeta';

interface AIContextOptions {
  /** Brand name for context (e.g., 'Jio', 'Tira') */
  brandName?: string;
  /** Per-brand overrides to document (prop name → override value) */
  brandOverrides?: Record<string, Record<string, unknown>>;
  /** Whether to include slot information */
  includeSlots?: boolean;
  /** Whether to include preview matrix info */
  includePreviewMatrix?: boolean;
}

/**
 * Generate a markdown AI context document from an array of ComponentMeta.
 * This is designed to be injected as a system prompt for LLMs that generate
 * OneUI component compositions.
 */
export function generateAIContext(
  components: ComponentMeta[],
  options: AIContextOptions = {},
): string {
  const { brandName, brandOverrides, includeSlots = true } = options;
  const lines: string[] = [];

  lines.push('# OneUI Component Reference');
  lines.push('');
  if (brandName) {
    lines.push(`Active brand: **${brandName}**`);
    lines.push('');
  }
  lines.push(`${components.length} components available.`);
  lines.push('');

  // Group by category
  const byCategory = new Map<string, ComponentMeta[]>();
  for (const comp of components) {
    const list = byCategory.get(comp.category) ?? [];
    list.push(comp);
    byCategory.set(comp.category, list);
  }

  for (const [category, comps] of byCategory) {
    lines.push(`## ${capitalize(category)}`);
    lines.push('');

    for (const comp of comps) {
      lines.push(`### ${comp.displayName}`);
      lines.push('');
      lines.push(comp.description);
      lines.push('');

      // Props table
      const editableProps = comp.props.filter(p => p.type !== 'function');
      if (editableProps.length > 0) {
        lines.push('| Prop | Type | Default | Description |');
        lines.push('|------|------|---------|-------------|');
        for (const prop of editableProps) {
          lines.push(formatPropRow(prop, brandOverrides?.[comp.name]));
        }
        lines.push('');
      }

      // Brand-overridable props
      const overridable = comp.props.filter(p => p.brandOverridable);
      if (overridable.length > 0) {
        lines.push(`**Brand-customizable:** ${overridable.map(p => `\`${p.name}\``).join(', ')}`);
        lines.push('');
      }

      // Slots
      if (includeSlots && comp.slots.length > 0) {
        lines.push('**Slots:**');
        for (const slot of comp.slots) {
          const types = slot.acceptedTypes?.length
            ? ` (accepts: ${slot.acceptedTypes.join(', ')})`
            : '';
          lines.push(`- \`${slot.name}\`: ${slot.description ?? 'Content slot'}${types}`);
        }
        lines.push('');
      }

      // Surface awareness
      if (comp.surfaceAware) {
        lines.push('*Surface-aware: adapts automatically on colored backgrounds.*');
        lines.push('');
      }
    }
  }

  return lines.join('\n');
}

function formatPropRow(
  prop: PropDescriptor,
  overrides?: Record<string, unknown>,
): string {
  const type = prop.options
    ? prop.options.map(o => `\`${o}\``).join(' \\| ')
    : `\`${prop.type}\``;

  let defaultVal = prop.defaultValue != null ? `\`${prop.defaultValue}\`` : '—';
  if (overrides?.[prop.name] != null) {
    defaultVal = `\`${overrides[prop.name]}\` *(brand)*`;
  }

  const desc = prop.description ?? '';
  return `| \`${prop.name}\` | ${type} | ${defaultVal} | ${desc} |`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
