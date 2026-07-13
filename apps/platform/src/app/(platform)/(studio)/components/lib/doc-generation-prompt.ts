/**
 * doc-generation-prompt.ts
 *
 * Builds the system prompt for AI-powered component documentation generation.
 * Includes design system vocabulary, component metadata, and output format rules.
 */

import type { DocumentationSectionKey } from '@oneui/shared';

interface PromptContext {
  componentName: string;
  section?: DocumentationSectionKey;
  currentSpec: Record<string, unknown>;
  componentContext: {
    propsInterface?: Record<string, unknown>[];
    tokenManifest?: Record<string, unknown>;
    recipeDefinition?: Record<string, unknown>;
    slotDefinitions?: Record<string, unknown>[];
  };
  brandContext?: {
    brandName?: string;
    theme?: string;
  };
}

const SECTION_SCHEMAS: Record<DocumentationSectionKey, string> = {
  intentAndPurpose: `{
  "intent": { "value": "<string: concise statement of what this component does>", "attribution": { "source": "overridden", "updatedAt": <timestamp>, "updatedBy": "ai-assisted" } },
  "taskContexts": { "value": ["<string[]>"], "attribution": { "source": "overridden", "updatedAt": <timestamp>, "updatedBy": "ai-assisted" } },
  "sentiments": { "value": ["<string[]>"], "attribution": { "source": "overridden", "updatedAt": <timestamp>, "updatedBy": "ai-assisted" } }
}`,
  compositionRules: `{
  "requires": { "value": ["<string[]>"], "attribution": { "source": "overridden", "updatedAt": <timestamp>, "updatedBy": "ai-assisted" } },
  "allows": { "value": ["<string[]>"], "attribution": { "source": "overridden", "updatedAt": <timestamp>, "updatedBy": "ai-assisted" } },
  "forbids": { "value": ["<string[]>"], "attribution": { "source": "overridden", "updatedAt": <timestamp>, "updatedBy": "ai-assisted" } }
}`,
  variantLogic: `{
  "rules": [{ "name": "<variant>", "useWhen": { "value": ["<string[]>"], "attribution": {...} }, "avoidWhen": { "value": ["<string[]>"], "attribution": {...} } }]
}`,
  relationshipsAndDependencies: `{
  "related": { "value": ["<string[]>"], "attribution": {...} },
  "escalatesTo": { "value": ["<string[]>"], "attribution": {...} },
  "degradesTo": { "value": ["<string[]>"], "attribution": {...} },
  "groupsWith": { "value": ["<string[]>"], "attribution": {...} }
}`,
  contextSignals: `{
  "density": { "value": ["<string[]>"], "attribution": {...} },
  "modality": { "value": ["<string[]>"], "attribution": {...} },
  "brand": { "value": ["<string[]>"], "attribution": {...} },
  "mode": { "value": ["<string[]>"], "attribution": {...} }
}`,
  observabilityHooks: `{
  "track": { "value": ["<string[]>"], "attribution": {...} },
  "health": { "value": ["<string[]>"], "attribution": {...} }
}`,
  accessibilityGuidelines: `{
  "wcagLevel": { "value": ["<string[]>"], "attribution": {...} },
  "keyboardBehavior": { "value": ["<string[]>"], "attribution": {...} },
  "screenReaderNotes": { "value": ["<string[]>"], "attribution": {...} },
  "contrastRequirements": { "value": ["<string[]>"], "attribution": {...} }
}`,
  migrationNotes: `{
  "breakingChanges": { "value": ["<string[]>"], "attribution": {...} },
  "deprecations": { "value": ["<string[]>"], "attribution": {...} },
  "upgradeSteps": { "value": ["<string[]>"], "attribution": {...} }
}`,
};

export function buildDocGenerationPrompt(context: PromptContext): string {
  const {
    componentName,
    section,
    currentSpec,
    componentContext,
    brandContext,
  } = context;

  const parts: string[] = [];

  // System identity
  parts.push(`You are a design system documentation expert for One UI Studio, a multi-brand design system platform serving 7+ brands and 1.4B users.`);

  // Design system vocabulary
  parts.push(`
## Design System Vocabulary

- **Surfaces**: V4 system with 7 surface modes × 9 appearance roles × 9 on-colour tokens per surface
- **Density**: CSS-only remapping — compact shifts tokens down 1 f-step, open shifts up
- **Appearance roles**: primary, secondary, neutral, sparkle, positive, negative, warning, informative, brand-bg
- **Token cascade**: Component override → Brand CSS → Density → Theme → Semantic → Primitive
- **Surface context**: Components adapt via [data-surface] CSS attribute — zero JS runtime
- **Bold inversion**: On fg-bold surface, fills invert to white, text inverts to surface color
- **F-Scale**: 25-step modular scale (f-8 to f16) drives all spacing + typography sizing
- **Shape**: T-shirt sizes (6XS–6XL) derived from f-scale, Shape-Pill = 9999px standalone
`);

  // Component metadata
  parts.push(`## Component: ${componentName}`);

  if (componentContext.propsInterface?.length) {
    parts.push(`### Props\n${JSON.stringify(componentContext.propsInterface, null, 2)}`);
  }

  if (componentContext.tokenManifest) {
    const manifest = componentContext.tokenManifest as Record<string, unknown>;
    parts.push(`### Token Manifest\n- Total tokens: ${manifest.totalTokens ?? 'unknown'}`);
    if (manifest.categories) {
      parts.push(`- Categories: ${JSON.stringify(manifest.categories)}`);
    }
    if (manifest.tokens) {
      const tokenNames = Object.keys(manifest.tokens as Record<string, unknown>);
      parts.push(`- Token names: ${tokenNames.join(', ')}`);
    }
  }

  if (componentContext.recipeDefinition) {
    parts.push(`### Recipe Definition\n${JSON.stringify(componentContext.recipeDefinition, null, 2)}`);
  }

  if (componentContext.slotDefinitions?.length) {
    parts.push(`### Slots\n${JSON.stringify(componentContext.slotDefinitions, null, 2)}`);
  }

  // Current state (so AI refines, not regenerates from scratch)
  if (section && currentSpec[section]) {
    parts.push(`### Current "${section}" Content (refine this, don't regenerate from scratch)\n${JSON.stringify(currentSpec[section], null, 2)}`);
  } else {
    parts.push(`### Current Documentation State\n${JSON.stringify(currentSpec, null, 2)}`);
  }

  // Brand context
  if (brandContext?.brandName) {
    parts.push(`### Brand Context\nBrand: ${brandContext.brandName}${brandContext.theme ? `, Theme: ${brandContext.theme}` : ''}`);
  }

  // Output format
  parts.push(`## Output Rules

1. Return ONLY valid JSON — no markdown fences, no explanation, no preamble.
2. Use design system terminology: reference actual token names (e.g., --Button-borderRadius, --Primary-Bold).
3. Be specific and actionable — avoid generic advice.
4. For array values, provide 3-6 items that are concise and distinct.
5. All attribution objects must have: { "source": "overridden", "updatedAt": ${Date.now()}, "updatedBy": "ai-assisted" }.
6. Match the exact interface shape for the section.`);

  // Section-specific schema
  if (section) {
    parts.push(`## Expected JSON Schema for "${section}"\n${SECTION_SCHEMAS[section]}`);
  } else {
    parts.push(`## Expected JSON Schema\nReturn an object with keys for each section:\n${Object.entries(SECTION_SCHEMAS)
      .map(([key, schema]) => `"${key}": ${schema}`)
      .join(',\n')}`);
  }

  return parts.join('\n\n');
}
