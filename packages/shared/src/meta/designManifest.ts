/**
 * designManifest.ts
 *
 * Assembles a single machine-readable DESIGN.md document from the four layers
 * the Design Composition Agent already owns:
 *
 *   1. Identity    — brand name, vertical, personality, context
 *   2. Rules       — do/don't prescriptions (compositionRules)
 *   3. Skills      — reusable compositions (compositionSkills)
 *   4. Components  — per-component reference + JSON Schema props contract
 *
 * The output is the canonical per-brand manifest. Analogous to CLAUDE.md:
 * a live, committed artifact that any LLM (platform canvas, Cursor, Claude
 * Desktop, a Figma plugin) can drop in as context and generate brand-correct
 * UIs against.
 *
 * Pure function — no I/O, no React, safe for edge runtimes.
 */

import type {
  CompositionConfig,
  CompositionRule,
  CompositionSkill,
  CompositionContext,
} from '../engine/compositionTypes';
import type { ComponentMeta } from '../types/componentMeta';
import { generateAIContext } from './generateAIContext';
import { getAllComponentSchemasJSON } from './componentSchemas';

export interface DesignManifestInput {
  /** Display brand name (e.g., "Jio", "Tira") */
  brandName: string;
  /** Optional slug — used only as metadata comment */
  brandSlug?: string;
  /** Brand composition config (vertical + personality dials) */
  config: CompositionConfig;
  /** Resolved composition rules (merged base + brand, sorted by priority) */
  rules: CompositionRule[];
  /** Active composition skills applicable to the target context(s) */
  skills: CompositionSkill[];
  /** All registered component metas */
  components: ComponentMeta[];
  /** Optional — limit the manifest to a specific context. Defaults to all contexts. */
  context?: CompositionContext;
  /** Optional per-brand prop defaults to document alongside component reference */
  brandOverrides?: Record<string, Record<string, unknown>>;
  /** Timestamp override (for deterministic tests). Defaults to `new Date()`. */
  now?: Date;
}

export function generateDesignManifest(input: DesignManifestInput): string {
  const {
    brandName,
    brandSlug,
    config,
    rules,
    skills,
    components,
    context,
    brandOverrides,
    now = new Date(),
  } = input;

  const lines: string[] = [];

  // --- Frontmatter-style header -------------------------------------------
  lines.push(`# Design System — ${brandName}`);
  lines.push('');
  lines.push('> Machine-readable brand manifest. Generated from the One UI Studio engine.');
  lines.push('> Assembled from: composition config + rules + skills + component registry + generated prop schemas.');
  lines.push('');
  lines.push(`- **Brand:** ${brandName}${brandSlug ? ` (\`${brandSlug}\`)` : ''}`);
  lines.push(`- **Generated:** ${now.toISOString()}`);
  if (context) lines.push(`- **Context scope:** ${context}`);
  lines.push('');

  // --- Section 1: Identity ------------------------------------------------
  lines.push('## 1. Identity');
  lines.push('');
  lines.push(`- Vertical: \`${config.vertical}\``);
  if (config.layoutPersonality) {
    const dials = Object.entries(config.layoutPersonality)
      .map(([k, v]) => `\`${k}=${v}\``)
      .join(', ');
    if (dials) lines.push(`- Layout personality: ${dials}`);
  }
  lines.push(`- Default context: \`${config.defaultContext}\``);
  if (config.maxComponentsPerScreen != null) {
    lines.push(`- Max components per screen: ${config.maxComponentsPerScreen}`);
  }
  if (config.preferBoldHeros) lines.push('- Prefers bold heroes.');
  if (config.preferMinimalContainers) lines.push('- Prefers minimal containers.');
  lines.push('');

  // --- Section 2: Rules ---------------------------------------------------
  lines.push('## 2. Composition Rules');
  lines.push('');
  if (rules.length === 0) {
    lines.push('_No rules configured._');
  } else {
    // Group by sectionId for readability; preserves priority order within each section.
    const bySection = new Map<string, CompositionRule[]>();
    for (const r of rules) {
      if (!r.isActive) continue;
      const key = r.sectionId || 'general';
      const bucket = bySection.get(key) ?? [];
      bucket.push(r);
      bySection.set(key, bucket);
    }
    for (const [sectionId, sectionRules] of bySection) {
      lines.push(`### ${titleCase(sectionId)}`);
      lines.push('');
      for (const rule of sectionRules) {
        const scopeTag = rule.scope === 'brand' ? ' _(brand override)_' : '';
        lines.push(`- **${rule.title}**${scopeTag} — ${rule.content}`);
      }
      lines.push('');
    }
  }

  // --- Section 3: Skills --------------------------------------------------
  lines.push('## 3. Composition Skills');
  lines.push('');
  const applicableSkills = context
    ? skills.filter(s => s.applicableContexts.includes(context))
    : skills;
  if (applicableSkills.length === 0) {
    lines.push('_No skills configured._');
  } else {
    for (const skill of applicableSkills) {
      lines.push(`### ${skill.name} <small>(${skill.category})</small>`);
      lines.push('');
      lines.push(skill.description);
      lines.push('');
      if (skill.examples && skill.examples.length > 0) {
        lines.push(`**Example prompt:** _${skill.examples[0].prompt}_`);
        lines.push('');
      }
      lines.push(`_Applicable contexts: ${skill.applicableContexts.join(', ')}_`);
      lines.push('');
    }
  }

  // --- Section 4: Component Reference ------------------------------------
  lines.push('## 4. Component Reference');
  lines.push('');
  lines.push(
    'The LLM MUST only emit components listed here. Any component type outside this catalog is invalid.',
  );
  lines.push('');
  lines.push(
    generateAIContext(components, {
      brandName,
      brandOverrides,
      includeSlots: true,
    })
      // Strip the generateAIContext header; we already have one.
      .replace(/^# OneUI Component Reference[\s\S]*?\n\n/, '')
      .trim(),
  );
  lines.push('');

  // --- Section 5: Generation Schemas (JSON Schema) -----------------------
  const schemas = getAllComponentSchemasJSON();
  const schemaNames = Object.keys(schemas);
  if (schemaNames.length > 0) {
    lines.push('## 5. Component Props Schemas (JSON Schema)');
    lines.push('');
    lines.push(
      'When a schema is available for a component, the LLM MUST emit props that validate against it. Unknown props are rejected by `.strict()` validation. Deprecated enum values are excluded — use the canonical options only.',
    );
    lines.push('');
    for (const name of schemaNames) {
      lines.push(`### ${name}`);
      lines.push('');
      lines.push('```json');
      lines.push(JSON.stringify(schemas[name], null, 2));
      lines.push('```');
      lines.push('');
    }
  }

  // --- Section 6: Global don'ts (negative constraints) -------------------
  lines.push('## 6. Global Prohibitions');
  lines.push('');
  lines.push('- Never emit hard-coded colors, pixels, or font sizes — every visual value must be a design token (`var(--Token-Name)`).');
  lines.push('- Never stack two high-attention buttons in the same view.');
  lines.push('- Never set `background-color` on a container that holds interactive components — use `<Surface mode="...">` so child components adapt via `[data-surface]`.');
  lines.push('- Never emit a prop that is not declared in the Component Reference above.');
  lines.push('- Never use deprecated enum values (see `deprecatedOptions` in each component).');
  lines.push('');

  return lines.join('\n');
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, ch => ch.toUpperCase())
    .trim();
}
