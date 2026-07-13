/**
 * documentationMarkdown.ts
 *
 * Shared markdown generator for component documentation specs.
 * Used by the CLI script (batch generation), the UI (live preview + download),
 * and includes attribution as HTML comments.
 */

import type {
  ComponentDocumentationSpec,
  DocumentationValue,
} from '../types/componentDocumentation';

function renderAttribution(attr: { source: string; updatedBy?: string }): string {
  if (attr.updatedBy) {
    return `<!-- source: ${attr.source}, by: ${attr.updatedBy} -->`;
  }
  return `<!-- source: ${attr.source} -->`;
}

function renderStringField(label: string, field: DocumentationValue<string>): string {
  return `**${label}:** ${field.value} ${renderAttribution(field.attribution)}`;
}

function renderArrayField(label: string, field: DocumentationValue<string[]> | undefined): string {
  if (!field || !field.value?.length) return '';
  return `**${label}:** ${field.value.join(', ')} ${renderAttribution(field.attribution)}`;
}

function renderArrayFieldAsList(label: string, field: DocumentationValue<string[]> | undefined): string {
  if (!field || !field.value?.length) return '';
  const items = field.value.map((item) => `- ${item}`).join('\n');
  return `**${label}:** ${renderAttribution(field.attribution)}\n${items}`;
}

/**
 * Convert a ComponentDocumentationSpec to a markdown string.
 * Includes all sections, attribution as HTML comments, and new
 * accessibility/migration sections.
 */
export function specToMarkdown(spec: ComponentDocumentationSpec): string {
  const lines: string[] = [];

  lines.push(`# ${spec.componentName} — Machine-Readable Documentation`);
  lines.push('');
  lines.push(`> Schema: v${spec.schemaVersion} | Generated: ${spec.generatedAt}`);
  if (spec.sourceHash) {
    lines.push(`> Source Hash: ${spec.sourceHash}`);
  }
  lines.push('');

  // Intent & Purpose
  lines.push('## Intent & Purpose');
  lines.push('');
  lines.push(renderStringField('Intent', spec.intentAndPurpose.intent));
  lines.push(renderArrayField('Task Contexts', spec.intentAndPurpose.taskContexts));
  lines.push(renderArrayField('Sentiments', spec.intentAndPurpose.sentiments));
  lines.push('');

  // Composition Rules
  lines.push('## Composition Rules');
  lines.push('');
  lines.push(renderArrayField('Requires', spec.compositionRules.requires));
  lines.push(renderArrayField('Allows', spec.compositionRules.allows));
  lines.push(renderArrayField('Forbids', spec.compositionRules.forbids));
  lines.push('');

  // Variant Logic
  if (spec.variantLogic.rules.length > 0) {
    lines.push('## Variant Logic');
    lines.push('');
    for (const rule of spec.variantLogic.rules) {
      lines.push(`### ${rule.name}`);
      lines.push(renderArrayField('Use When', rule.useWhen));
      if (rule.avoidWhen) lines.push(renderArrayField('Avoid When', rule.avoidWhen));
      if (rule.pairWith) lines.push(renderArrayField('Pair With', rule.pairWith));
      lines.push('');
    }
  }

  // Relationships & Dependencies
  lines.push('## Relationships & Dependencies');
  lines.push('');
  lines.push(renderArrayField('Related', spec.relationshipsAndDependencies.related));
  lines.push(renderArrayField('Escalates To', spec.relationshipsAndDependencies.escalatesTo));
  lines.push(renderArrayField('Degrades To', spec.relationshipsAndDependencies.degradesTo));
  lines.push(renderArrayField('Groups With', spec.relationshipsAndDependencies.groupsWith));
  lines.push('');

  // Context Signals
  lines.push('## Context Signals');
  lines.push('');
  lines.push(renderArrayField('Density', spec.contextSignals.density));
  lines.push(renderArrayField('Modality', spec.contextSignals.modality));
  lines.push(renderArrayField('Brand', spec.contextSignals.brand));
  lines.push(renderArrayField('Mode', spec.contextSignals.mode));
  lines.push('');

  // Observability Hooks
  lines.push('## Observability Hooks');
  lines.push('');
  lines.push(renderArrayField('Track', spec.observabilityHooks.track));
  lines.push(renderArrayField('Health', spec.observabilityHooks.health));
  lines.push('');

  // Accessibility Guidelines (new in v1.1.0)
  if (spec.accessibilityGuidelines) {
    lines.push('## Accessibility Guidelines');
    lines.push('');
    lines.push(renderArrayFieldAsList('WCAG Level', spec.accessibilityGuidelines.wcagLevel));
    lines.push(renderArrayFieldAsList('Keyboard Behavior', spec.accessibilityGuidelines.keyboardBehavior));
    lines.push(renderArrayFieldAsList('Screen Reader Notes', spec.accessibilityGuidelines.screenReaderNotes));
    lines.push(renderArrayFieldAsList('Contrast Requirements', spec.accessibilityGuidelines.contrastRequirements));
    lines.push('');
  }

  // Migration Notes (new in v1.1.0)
  if (spec.migrationNotes) {
    lines.push('## Migration Notes');
    lines.push('');
    lines.push(renderArrayFieldAsList('Breaking Changes', spec.migrationNotes.breakingChanges));
    lines.push(renderArrayFieldAsList('Deprecations', spec.migrationNotes.deprecations));
    lines.push(renderArrayFieldAsList('Upgrade Steps', spec.migrationNotes.upgradeSteps));
    lines.push('');
  }

  // Props
  if (spec.props.length > 0) {
    lines.push('## Props');
    lines.push('');
    lines.push('| Prop | Type | Required | Default | Description |');
    lines.push('|------|------|----------|---------|-------------|');
    for (const prop of spec.props) {
      lines.push(
        `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.defaultValue ?? '-'} | ${prop.description} |`,
      );
    }
    lines.push('');
  }

  // Slots
  if (spec.slots.length > 0) {
    lines.push('## Slots');
    lines.push('');
    for (const slot of spec.slots) {
      lines.push(`### ${slot.name}`);
      lines.push(`- Types: ${slot.types.join(', ')}`);
      lines.push(`- Tokens: ${slot.tokens.join(', ')}`);
      lines.push('');
    }
  }

  // Tags
  if (spec.tags?.length) {
    lines.push(`**Tags:** ${spec.tags.join(', ')}`);
    lines.push('');
  }

  // Filter out empty lines from fields that returned ''
  return lines.filter((line) => line !== '').join('\n') + '\n';
}
