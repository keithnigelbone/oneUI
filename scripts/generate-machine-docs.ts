#!/usr/bin/env node
/**
 * generate-machine-docs.ts
 *
 * Emits machine-readable documentation for every component registered in
 * `@oneui/ui/registry/metaRegistry`. For each component:
 *   - Props are extracted from the colocated `*.shared.ts` via ts-morph (no regex).
 *   - Slots come from the colocated `*.tokens.ts` manifest (`slots` field).
 *   - Recipe decisions come from the colocated `*.recipe.ts` definition.
 *   - Authored intent / composition / variant / relationship / context / observability
 *     content lives in `COMPONENT_TEMPLATES` keyed by component name. New components
 *     in the registry without a template fall back to a sensible baseline.
 *
 * Output (per component):
 *   - docs/components/generated/<slug>.docs.json     (full spec, JSON)
 *   - docs/components/generated/<slug>.md            (markdown view)
 *   - apps/platform/src/generated/component-docs/<slug>.docs.json (mirror)
 *
 * Run: `pnpm docs:machine`. Freshness gate: `pnpm check:machine-docs-fresh`.
 *
 * Determinism: `generatedAt` defaults to a frozen ISO string so CI can diff the
 * regenerated output. Override with MACHINE_DOCS_TIMESTAMP=<iso> if you need a
 * live timestamp for one-off runs.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Project, Node, type SourceFile, type Type } from 'ts-morph';
import type {
  ComponentDocumentationSpec,
  ComponentPropDoc,
  ComponentSlotDoc,
  CompositionRules,
  ContextSignals,
  DocumentationAttribution,
  IntentAndPurpose,
  ObservabilityHooks,
  RelationshipsAndDependencies,
  VariantLogic,
} from '@oneui/shared';
import { buildPropsSchema } from '@oneui/shared';
import type { ComponentMeta } from '@oneui/shared';
import { COMPONENT_META_REGISTRY } from '@oneui/ui/registry/metaRegistry';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

/** Frozen so generated output is stable for CI freshness diffs. */
const FROZEN_TIMESTAMP = '2026-01-01T00:00:00.000Z';
const GENERATED_AT = process.env.MACHINE_DOCS_TIMESTAMP ?? FROZEN_TIMESTAMP;

function inferAttribution(source: DocumentationAttribution['source']): DocumentationAttribution {
  return { source };
}

// ---------------------------------------------------------------------------
// ts-morph prop extraction
// ---------------------------------------------------------------------------

interface ExtractedProp extends ComponentPropDoc {}

function createProject(): Project {
  // Use the repo tsconfig so type aliases (e.g. ComponentAppearance) resolve.
  // skipAddingFilesFromTsConfig avoids loading the entire workspace up front;
  // we add source files explicitly per component.
  return new Project({
    tsConfigFilePath: resolve(ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });
}

/** Strip undefined/null members to detect the "real" type behind optionality. */
function stripNullish(types: Type[]): Type[] {
  return types.filter((t) => !t.isUndefined() && !t.isNull());
}

/**
 * Render a prop's type using the annotation as written in source. This
 * preserves type aliases (ButtonVariant, ComponentAppearance, etc.) verbatim
 * — what the AI prompt and prop tables care about. Falls back to the resolved
 * Type's text when the prop is declared without an explicit annotation.
 *
 * Strips ts-morph's `import("/abs/path").Foo` decorations that surface when
 * the resolved type can't be captured by name.
 */
function formatPropType(sym: import('ts-morph').Symbol, fallbackType: Type): string {
  const decl = sym.getDeclarations()[0];

  // PropertySignature / PropertyDeclaration / Parameter all expose getTypeNode()
  // when an explicit annotation exists.
  if (decl && Node.isPropertySignature(decl)) {
    const typeNode = decl.getTypeNode();
    if (typeNode) {
      return cleanTypeText(typeNode.getText());
    }
  }

  // Fall back: synthesize from the resolved Type, dropping `| undefined`.
  let effective = fallbackType;
  if (effective.isUnion()) {
    const members = stripNullish(effective.getUnionTypes());
    if (members.length === 1) effective = members[0];
    else if (members.length > 1) {
      return cleanTypeText(members.map((m) => m.getText()).join(' | '));
    }
  }
  return cleanTypeText(effective.getText());
}

/**
 * Drop absolute import() paths and strip leading `?:` artefacts so the type
 * surface stays portable across machines.
 */
function cleanTypeText(text: string): string {
  return text
    .replace(/import\("[^"]+"\)\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ParsePropsOptions {
  /** Component name (used for error messages) */
  componentName: string;
  /** Absolute path to the *.shared.ts file */
  sharedPath: string;
  /** Candidate interface names to try, in priority order */
  candidateInterfaces: readonly string[];
}

interface ParsePropsResult {
  props: ExtractedProp[];
  /** Interface name that was successfully resolved, if any. */
  interfaceName: string | null;
  /** Set when the props could not be resolved through ts-morph. */
  warning?: string;
}

/**
 * Walk a Props interface (and its inherited members) via ts-morph.
 * Falls back through `candidateInterfaces` (e.g. ButtonProps, ButtonBaseProps)
 * until one resolves, and returns a warning if none do.
 */
function parsePropsWithTsMorph(
  project: Project,
  options: ParsePropsOptions,
): ParsePropsResult {
  const { componentName, sharedPath, candidateInterfaces } = options;

  if (!existsSync(sharedPath)) {
    return {
      props: [],
      interfaceName: null,
      warning: `${componentName}: shared file not found at ${sharedPath}`,
    };
  }

  let source: SourceFile;
  try {
    source = project.addSourceFileAtPath(sharedPath);
  } catch (err) {
    return {
      props: [],
      interfaceName: null,
      warning: `${componentName}: failed to load ${sharedPath} — ${(err as Error).message}`,
    };
  }

  for (const ifaceName of candidateInterfaces) {
    const iface = source.getInterface(ifaceName);
    const alias = source.getTypeAlias(ifaceName);
    const type = iface?.getType() ?? alias?.getType();
    if (!type) continue;

    const props: ExtractedProp[] = [];
    for (const sym of type.getProperties()) {
      const name = sym.getName();
      if (name === 'ref' || name === 'key') continue;

      const decl = sym.getDeclarations()[0];
      const propType = decl ? sym.getTypeAtLocation(decl) : type;
      const optional = sym.isOptional();
      const required = !optional;

      const description = extractJSDocDescription(sym) ?? `${name} property`;
      const defaultValue = extractJSDocDefault(sym);

      const typeText = formatPropType(sym, propType);

      props.push({
        name,
        type: typeText,
        required,
        defaultValue,
        description,
      });
    }

    // Sort for stable output: required first, then alphabetical.
    props.sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { props, interfaceName: ifaceName };
  }

  return {
    props: [],
    interfaceName: null,
    warning: `${componentName}: none of the candidate Props interfaces (${candidateInterfaces.join(', ')}) resolved in ${sharedPath}`,
  };
}

function extractJSDocDescription(sym: import('ts-morph').Symbol): string | undefined {
  const decl = sym.getDeclarations()[0];
  if (!decl || typeof (decl as { getJsDocs?: () => unknown[] }).getJsDocs !== 'function') {
    return undefined;
  }
  const docs = (decl as { getJsDocs: () => Array<{ getDescription: () => string }> }).getJsDocs();
  for (const doc of docs) {
    const text = doc.getDescription().trim();
    if (text) {
      // Collapse whitespace + newlines into a single line for the prop table.
      return text.replace(/\s+/g, ' ');
    }
  }
  return undefined;
}

function extractJSDocDefault(sym: import('ts-morph').Symbol): string | undefined {
  const decl = sym.getDeclarations()[0];
  if (!decl || typeof (decl as { getJsDocs?: () => unknown[] }).getJsDocs !== 'function') {
    return undefined;
  }
  const docs = (decl as {
    getJsDocs: () => Array<{
      getTags: () => Array<{ getTagName: () => string; getCommentText?: () => string | undefined }>;
    }>;
  }).getJsDocs();
  for (const doc of docs) {
    for (const tag of doc.getTags()) {
      if (tag.getTagName() === 'default') {
        const raw = tag.getCommentText?.()?.trim();
        if (raw) return raw.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Authored content templates
//
// Each template provides the human-curated documentation fields that ts-morph
// cannot infer (intent, composition rules, variant guidance, relationships,
// context signals, observability hooks, code snippets). Tags + slots come from
// the meta / tokenManifest at build time.
// ---------------------------------------------------------------------------

interface ComponentTemplate {
  intentAndPurpose: IntentAndPurpose;
  compositionRules: CompositionRules;
  variantLogic: VariantLogic;
  relationshipsAndDependencies: RelationshipsAndDependencies;
  contextSignals: ContextSignals;
  observabilityHooks: ObservabilityHooks;
  /**
   * Code snippets keyed by id. The auto-generated "recipe-decisions" snippet
   * is appended automatically when the component has a recipe definition.
   */
  codeSnippets: ComponentDocumentationSpec['codeSnippets'];
  /** Optional override for the props interface candidates. */
  propsInterfaceCandidates?: readonly string[];
  /** Extra props synthesized in code (e.g. aria-label). */
  extraProps?: ComponentPropDoc[];
}

const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  Button: {
    intentAndPurpose: {
      intent: { value: 'Trigger a single user action with clear emphasis and accessible states.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['form-submission', 'destructive-action', 'navigation', 'inline-action'], attribution: inferAttribution('inferred') },
      sentiments: { value: ['positive', 'warning', 'destructive'], attribution: inferAttribution('inferred') },
    },
    compositionRules: {
      requires: { value: ['label or aria-label', 'interactive button root'], attribution: inferAttribution('inferred') },
      allows: { value: ['leftIcon', 'rightIcon', 'loading spinner'], attribution: inferAttribution('inferred') },
      forbids: { value: ['table content', 'image-only content without aria-label'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'bold', useWhen: { value: ['single primary action per view', 'high emphasis CTA'], attribution: inferAttribution('inferred') }, pairWith: { value: ['secondary action as subtle or ghost'], attribution: inferAttribution('authored') } },
        { name: 'subtle', useWhen: { value: ['secondary action with visible affordance'], attribution: inferAttribution('inferred') } },
        { name: 'ghost', useWhen: { value: ['low-attention inline action', 'toolbar-like controls'], attribution: inferAttribution('inferred') }, avoidWhen: { value: ['primary action in dense workflows'], attribution: inferAttribution('authored') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['IconButton', 'ToggleButton'], attribution: inferAttribution('authored') },
      escalatesTo: { value: ['Dialog', 'ConfirmationDialog'], attribution: inferAttribution('authored') },
      degradesTo: { value: ['TextLink'], attribution: inferAttribution('authored') },
      groupsWith: { value: ['ButtonGroup', 'Toolbar'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile', 'web'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['click', 'impression', 'abandonment'], attribution: inferAttribution('authored') },
      health: { value: ['adoption_rate', 'override_frequency', 'a11y_violations'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'import-basic', title: 'Basic Usage', language: 'tsx', code: `import { Button } from '@oneui/ui';\n\n<Button>Click me</Button>` },
      { id: 'variants', title: 'Variants', language: 'tsx', code: `<Button variant="bold">Primary</Button>\n<Button variant="subtle">Secondary</Button>\n<Button variant="ghost">Tertiary</Button>` },
    ],
    propsInterfaceCandidates: ['ButtonBaseProps', 'ButtonProps'],
    extraProps: [
      {
        name: 'aria-label',
        type: 'string',
        required: false,
        description: 'Accessible label override. Button always has a visible text label; for label-less icon buttons use <IconButton>.',
      },
    ],
  },

  IconButton: {
    intentAndPurpose: {
      intent: { value: 'Trigger compact single actions with icon-only affordance.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['toolbar-action', 'inline-compact-action', 'navigation-control'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive', 'warning'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['icon', 'aria-label'], attribution: inferAttribution('inferred') },
      allows: { value: ['loading spinner'], attribution: inferAttribution('inferred') },
      forbids: { value: ['text-only content'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'bold', useWhen: { value: ['primary compact action'], attribution: inferAttribution('inferred') } },
        { name: 'subtle', useWhen: { value: ['secondary compact action'], attribution: inferAttribution('inferred') } },
        { name: 'ghost', useWhen: { value: ['minimal chrome action'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['Button', 'Toggle'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware'], attribution: inferAttribution('authored') },
      mode: { value: ['light', 'dark'], attribution: inferAttribution('authored') },
    },
    observabilityHooks: {
      track: { value: ['click'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'icon-button-basic', title: 'Basic Usage', language: 'tsx', code: `import { IconButton } from '@oneui/ui';\n\n<IconButton icon="add" aria-label="Add item" />` },
    ],
  },

  Chip: {
    intentAndPurpose: {
      intent: { value: 'Compact interactive label for filtering, tagging, or selecting values.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['filter-selection', 'tag-display', 'multi-select', 'categorisation'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive', 'informative'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['label text or aria-label'], attribution: inferAttribution('inferred') },
      allows: { value: ['start slot (icon, avatar, badge)', 'end slot (icon, counter)'], attribution: inferAttribution('inferred') },
      forbids: { value: ['multi-line text content'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'bold', useWhen: { value: ['selected/active state in filter groups'], attribution: inferAttribution('inferred') } },
        { name: 'subtle', useWhen: { value: ['suggested or pre-selected options'], attribution: inferAttribution('inferred') } },
        { name: 'ghost', useWhen: { value: ['unselected filter options (default)'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['ChipGroup', 'Button', 'Badge'], attribution: inferAttribution('authored') },
      groupsWith: { value: ['ChipGroup'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['select', 'deselect'], attribution: inferAttribution('authored') },
      health: { value: ['adoption_rate', 'a11y_violations'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'chip-basic', title: 'Basic Usage', language: 'tsx', code: `import { Chip } from '@oneui/ui';\n\n<Chip>Label</Chip>` },
      { id: 'chip-selected', title: 'Selectable Chip', language: 'tsx', code: `<Chip attention="high" selected>Active Filter</Chip>` },
    ],
  },

  Checkbox: {
    intentAndPurpose: {
      intent: { value: 'Binary selection control for forms and settings with tri-state (indeterminate) support.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['form-field', 'settings-toggle', 'multi-select-list', 'bulk-selection'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['label or aria-label'], attribution: inferAttribution('inferred') },
      allows: { value: ['indeterminate state', 'read-only mode'], attribution: inferAttribution('inferred') },
      forbids: { value: ['use as a toggle for non-boolean values'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'default', useWhen: { value: ['standard form checkbox'], attribution: inferAttribution('inferred') } },
        { name: 'indeterminate', useWhen: { value: ['parent of partially-selected group'], attribution: inferAttribution('inferred') } },
        { name: 'readOnly', useWhen: { value: ['display-only state, value visible but not editable'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['Switch', 'Radio', 'CheckboxGroup'], attribution: inferAttribution('authored') },
      groupsWith: { value: ['CheckboxGroup', 'FormField'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'appearance + accent dual-role'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['check', 'uncheck', 'indeterminate_set'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'override_frequency'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'checkbox-basic', title: 'Basic Usage', language: 'tsx', code: `import { Checkbox } from '@oneui/ui';\n\n<Checkbox>Accept terms</Checkbox>` },
      { id: 'checkbox-controlled', title: 'Controlled', language: 'tsx', code: `<Checkbox checked={isChecked} onCheckedChange={setIsChecked}>Option</Checkbox>` },
    ],
  },

  Radio: {
    intentAndPurpose: {
      intent: { value: 'Single-selection control within a mutually-exclusive option group.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['single-select-form', 'preference-setting', 'wizard-step'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['value prop', 'RadioGroup parent', 'label or aria-label'], attribution: inferAttribution('inferred') },
      allows: { value: ['read-only mode', 'group-level appearance inheritance'], attribution: inferAttribution('inferred') },
      forbids: { value: ['standalone use without RadioGroup', 'multiple selection'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'default', useWhen: { value: ['standard option in a radio group'], attribution: inferAttribution('inferred') } },
        { name: 'readOnly', useWhen: { value: ['display-only, value shown but cannot change'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['Checkbox', 'Switch', 'RadioGroup'], attribution: inferAttribution('authored') },
      groupsWith: { value: ['RadioGroup', 'FormField'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'appearance + accent dual-role'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['select'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'radio-basic', title: 'Basic Usage', language: 'tsx', code: `import { Radio, RadioGroup } from '@oneui/ui';\n\n<RadioGroup value={value} onValueChange={setValue}>\n  <Radio value="a">Option A</Radio>\n  <Radio value="b">Option B</Radio>\n</RadioGroup>` },
    ],
  },

  Switch: {
    intentAndPurpose: {
      intent: { value: 'Immediate binary toggle — state takes effect on change without a submit action.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['settings-toggle', 'feature-flag', 'live-preference'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['label or aria-label'], attribution: inferAttribution('inferred') },
      allows: { value: ['read-only mode', 'accent override'], attribution: inferAttribution('inferred') },
      forbids: { value: ['use in forms requiring explicit submit', 'replace with Checkbox for non-immediate effects'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'default', useWhen: { value: ['immediate on/off setting'], attribution: inferAttribution('inferred') } },
        { name: 'readOnly', useWhen: { value: ['display-only permission or system setting'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['Checkbox', 'Radio'], attribution: inferAttribution('authored') },
      degradesTo: { value: ['Checkbox'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'appearance + accent dual-role'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['toggle_on', 'toggle_off'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'adoption_rate'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'switch-basic', title: 'Basic Usage', language: 'tsx', code: `import { Switch } from '@oneui/ui';\n\n<Switch>Enable notifications</Switch>` },
      { id: 'switch-controlled', title: 'Controlled', language: 'tsx', code: `<Switch checked={isOn} onCheckedChange={setIsOn}>Dark mode</Switch>` },
    ],
  },

  Divider: {
    intentAndPurpose: {
      intent: { value: 'Visual separator between sections, list items, or content groups.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['section-separation', 'list-item-separation', 'content-grouping'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['orientation context'], attribution: inferAttribution('inferred') },
      allows: { value: ['label or icon slot', 'round caps'], attribution: inferAttribution('inferred') },
      forbids: { value: ['interactive content', 'non-separator use'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'low attention', useWhen: { value: ['subtle content separation (default)'], attribution: inferAttribution('inferred') } },
        { name: 'medium attention', useWhen: { value: ['prominent section boundary'], attribution: inferAttribution('inferred') } },
        { name: 'high attention', useWhen: { value: ['strong separator between major sections'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['ContentBlock', 'List'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: [], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'divider-basic', title: 'Basic Usage', language: 'tsx', code: `import { Divider } from '@oneui/ui';\n\n<Divider />` },
      { id: 'divider-with-text', title: 'With Text', language: 'tsx', code: `import { Divider, Text } from '@oneui/ui';\n\n<Divider content={<Text variant="label" size="S" weight="medium" text="Or" />} />` },
      { id: 'divider-vertical', title: 'Vertical', language: 'tsx', code: `<Divider orientation="vertical" />` },
    ],
  },

  Stepper: {
    intentAndPurpose: {
      intent: { value: 'Numeric input control with increment and decrement buttons for bounded integer values.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['quantity-selection', 'numeric-form-field', 'pagination-control'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive', 'warning'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['numeric value context'], attribution: inferAttribution('inferred') },
      allows: { value: ['min/max constraints', 'custom step', 'shift multiplier', 'error state'], attribution: inferAttribution('inferred') },
      forbids: { value: ['non-numeric values', 'string entry'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'high', useWhen: { value: ['primary quantity input requiring high emphasis'], attribution: inferAttribution('inferred') } },
        { name: 'medium', useWhen: { value: ['default quantity field (most common use)'], attribution: inferAttribution('inferred') } },
        { name: 'low', useWhen: { value: ['de-emphasised numeric control'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['Button', 'FormField', 'NumberInput'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'appearance + accent dual-role'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['increment', 'decrement', 'manual_input'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'out_of_range_frequency'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'stepper-basic', title: 'Basic Usage', language: 'tsx', code: `import { Stepper } from '@oneui/ui';\n\n<Stepper defaultValue={1} min={0} max={10} />` },
      { id: 'stepper-controlled', title: 'Controlled', language: 'tsx', code: `<Stepper value={qty} onChange={(_, v) => setQty(v ?? 0)} min={1} max={99} />` },
    ],
  },

  Avatar: {
    intentAndPurpose: {
      intent: { value: 'Display a user or entity representation as image, icon, or text initials.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['user-profile', 'contact-list', 'comment-attribution', 'navigation-header'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['alt text for accessibility'], attribution: inferAttribution('inferred') },
      allows: { value: ['image src', 'icon element', 'text initials via alt'], attribution: inferAttribution('inferred') },
      forbids: { value: ['interactive content within avatar'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'image', useWhen: { value: ['user has a profile photo'], attribution: inferAttribution('inferred') } },
        { name: 'icon', useWhen: { value: ['generic entity or placeholder representation'], attribution: inferAttribution('inferred') } },
        { name: 'text', useWhen: { value: ['no image available, display initials'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['IconContained', 'Image'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['impression'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'image_load_failure_rate'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'avatar-basic', title: 'Basic Usage', language: 'tsx', code: `import { Avatar } from '@oneui/ui';\n\n<Avatar src="/photo.jpg" alt="Jane Doe" />` },
      { id: 'avatar-initials', title: 'Text Initials', language: 'tsx', code: `<Avatar content="text" alt="Jane Doe" />` },
    ],
  },

  Icon: {
    intentAndPurpose: {
      intent: { value: 'Render a semantic or custom icon with configurable size, colour role, and emphasis level.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['inline-decoration', 'button-icon', 'status-indicator', 'navigation-icon'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive', 'negative', 'warning', 'informative'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['icon prop (semantic name or React element)'], attribution: inferAttribution('inferred') },
      allows: { value: ['aria-label for non-decorative use'], attribution: inferAttribution('inferred') },
      forbids: { value: ['interactive behaviour (use IconButton instead)', 'text content'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'high emphasis', useWhen: { value: ['primary content icon requiring strongest contrast'], attribution: inferAttribution('inferred') } },
        { name: 'medium emphasis', useWhen: { value: ['secondary or supporting icon'], attribution: inferAttribution('inferred') } },
        { name: 'low emphasis', useWhen: { value: ['subtle decorative icon'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['IconButton', 'IconContained', 'Button'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: [], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'icon-basic', title: 'Basic Usage', language: 'tsx', code: `import { Icon } from '@oneui/ui';\n\n<Icon icon="check" />` },
      { id: 'icon-appearance', title: 'With Appearance', language: 'tsx', code: `<Icon icon="warning" appearance="negative" emphasis="high" size="7" />` },
    ],
  },

  IconContained: {
    intentAndPurpose: {
      intent: { value: 'Display an icon within a filled container shape with attention-level emphasis.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['status-badge', 'category-indicator', 'feature-highlight', 'list-item-icon'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive', 'negative', 'warning', 'informative'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['icon prop (semantic name or React element)'], attribution: inferAttribution('inferred') },
      allows: { value: ['aria-label for accessibility'], attribution: inferAttribution('inferred') },
      forbids: { value: ['interactive behaviour (non-interactive display only)', 'text content'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'high attention', useWhen: { value: ['prominent solid bold fill container'], attribution: inferAttribution('inferred') } },
        { name: 'medium attention', useWhen: { value: ['subtle tinted fill container'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['Icon', 'Avatar', 'IconButton'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['impression'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'iconcontained-basic', title: 'Basic Usage', language: 'tsx', code: `import { IconContained } from '@oneui/ui';\n\n<IconContained icon="check" />` },
      { id: 'iconcontained-subtle', title: 'Medium Attention', language: 'tsx', code: `<IconContained icon="info" attention="medium" appearance="informative" />` },
    ],
  },

  Image: {
    intentAndPurpose: {
      intent: { value: 'Display an image with aspect ratio presets, loading states, and optional interactive overlay.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['content-image', 'product-photo', 'thumbnail', 'hero-banner', 'gallery-item'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['src (required)', 'alt text (required)'], attribution: inferAttribution('inferred') },
      allows: { value: ['aspect ratio preset', 'interactive mode with click handler', 'custom fallback on error'], attribution: inferAttribution('inferred') },
      forbids: { value: ['decorative images without alt=""', 'interactive mode without aria-label'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'static', useWhen: { value: ['display-only image content'], attribution: inferAttribution('inferred') } },
        { name: 'interactive', useWhen: { value: ['clickable image with state layer and focus ring'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['Avatar', 'Logo'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['click', 'impression'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'image_load_failure_rate'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'image-basic', title: 'Basic Usage', language: 'tsx', code: `import { Image } from '@oneui/ui';\n\n<Image src="/photo.jpg" alt="Product shot" />` },
      { id: 'image-aspect-ratio', title: 'With Aspect Ratio', language: 'tsx', code: `<Image src="/banner.jpg" alt="Hero banner" aspectRatio="16:9" />` },
    ],
  },

  SelectableButton: {
    intentAndPurpose: {
      intent: { value: 'Toggle button with text label and optional start/end slots for binary selection within groups.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['filter-toggle', 'option-selection', 'segmented-control', 'toolbar-toggle'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['children (text label) or aria-label'], attribution: inferAttribution('inferred') },
      allows: { value: ['start/end slots (icon, badge)', 'contained/uncontained mode', 'condensed mode', 'fullWidth'], attribution: inferAttribution('inferred') },
      forbids: { value: ['use for navigation (use Button instead)', 'nested interactive elements'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'high attention', useWhen: { value: ['selected state needs bold fill emphasis'], attribution: inferAttribution('inferred') } },
        { name: 'medium attention', useWhen: { value: ['selected state with subtle tinted fill'], attribution: inferAttribution('inferred') } },
        { name: 'low attention', useWhen: { value: ['selected state with ghost appearance and accent border'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['SelectableIconButton', 'SelectableSingleTextButton', 'Button', 'Toggle', 'ToggleGroup'], attribution: inferAttribution('authored') },
      groupsWith: { value: ['ToggleGroup'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['select', 'deselect'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'adoption_rate'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'selectablebutton-basic', title: 'Basic Usage', language: 'tsx', code: `import { SelectableButton } from '@oneui/ui';\n\n<SelectableButton>Option A</SelectableButton>` },
      { id: 'selectablebutton-controlled', title: 'Controlled', language: 'tsx', code: `<SelectableButton selected={isSelected} onSelectedChange={setIsSelected}>Filter</SelectableButton>` },
    ],
  },

  SelectableIconButton: {
    intentAndPurpose: {
      intent: { value: 'Icon-only toggle button for compact binary selection with configurable shape layout.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['toolbar-toggle', 'icon-filter', 'compact-option-selection', 'grid-view-toggle'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['icon prop', 'aria-label (required — icon-only)'], attribution: inferAttribution('inferred') },
      allows: { value: ['condensed mode', '3:2 layout variant', 'loading state'], attribution: inferAttribution('inferred') },
      forbids: { value: ['text content (use SelectableButton instead)', 'missing aria-label'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'high attention', useWhen: { value: ['selected state needs bold fill emphasis'], attribution: inferAttribution('inferred') } },
        { name: 'medium attention', useWhen: { value: ['selected state with subtle tinted fill'], attribution: inferAttribution('inferred') } },
        { name: 'low attention', useWhen: { value: ['selected state with ghost appearance and accent border'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['SelectableButton', 'SelectableSingleTextButton', 'IconButton', 'Toggle', 'ToggleGroup'], attribution: inferAttribution('authored') },
      groupsWith: { value: ['ToggleGroup'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['select', 'deselect'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'adoption_rate'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'selectableiconbutton-basic', title: 'Basic Usage', language: 'tsx', code: `import { SelectableIconButton } from '@oneui/ui';\n\n<SelectableIconButton icon="star" aria-label="Favourite" />` },
      { id: 'selectableiconbutton-controlled', title: 'Controlled', language: 'tsx', code: `<SelectableIconButton icon="bookmark" selected={isSaved} onSelectedChange={setIsSaved} aria-label="Save" />` },
    ],
  },

  SelectableSingleTextButton: {
    intentAndPurpose: {
      intent: { value: 'Text-only toggle button for binary selection — no start/end slots, simpler than SelectableButton.', attribution: inferAttribution('inferred') },
      taskContexts: { value: ['text-filter-toggle', 'segmented-text-control', 'simple-option-selection'], attribution: inferAttribution('authored') },
      sentiments: { value: ['neutral', 'positive'], attribution: inferAttribution('authored') },
    },
    compositionRules: {
      requires: { value: ['children (text label — required)'], attribution: inferAttribution('inferred') },
      allows: { value: ['condensed mode', 'fullWidth', 'loading state'], attribution: inferAttribution('inferred') },
      forbids: { value: ['icon slots (use SelectableButton instead)', 'missing text content'], attribution: inferAttribution('authored') },
    },
    variantLogic: {
      rules: [
        { name: 'high attention', useWhen: { value: ['selected state needs bold fill emphasis'], attribution: inferAttribution('inferred') } },
        { name: 'medium attention', useWhen: { value: ['selected state with subtle tinted fill'], attribution: inferAttribution('inferred') } },
        { name: 'low attention', useWhen: { value: ['selected state with ghost appearance and accent border'], attribution: inferAttribution('inferred') } },
      ],
    },
    relationshipsAndDependencies: {
      related: { value: ['SelectableButton', 'SelectableIconButton', 'Toggle', 'ToggleGroup'], attribution: inferAttribution('authored') },
      groupsWith: { value: ['ToggleGroup'], attribution: inferAttribution('authored') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('authored') },
      brand: { value: ['theme-scope aware', 'recipe-driven'], attribution: inferAttribution('inferred') },
      mode: { value: ['light', 'dark', 'surface-context'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: ['select', 'deselect'], attribution: inferAttribution('authored') },
      health: { value: ['a11y_violations', 'adoption_rate'], attribution: inferAttribution('authored') },
    },
    codeSnippets: [
      { id: 'selectablesingletextbutton-basic', title: 'Basic Usage', language: 'tsx', code: `import { SelectableSingleTextButton } from '@oneui/ui';\n\n<SelectableSingleTextButton>Option</SelectableSingleTextButton>` },
      { id: 'selectablesingletextbutton-controlled', title: 'Controlled', language: 'tsx', code: `<SelectableSingleTextButton selected={isActive} onSelectedChange={setIsActive}>Active</SelectableSingleTextButton>` },
    ],
  },
};

// ---------------------------------------------------------------------------
// Baseline (used when no authored template exists)
// ---------------------------------------------------------------------------

function buildBaselineTemplate(meta: ComponentMeta): ComponentTemplate {
  const variantNames = meta.previewMatrix.variants.map((v) =>
    typeof v === 'string' ? v : String(v),
  );

  return {
    intentAndPurpose: {
      intent: { value: meta.description, attribution: inferAttribution('inferred') },
      taskContexts: { value: meta.tags ?? [], attribution: inferAttribution('inferred') },
      sentiments: { value: ['neutral'], attribution: inferAttribution('inferred') },
    },
    compositionRules: {
      requires: { value: meta.slots.filter((s) => s.required).map((s) => s.name), attribution: inferAttribution('inferred') },
      allows: { value: meta.slots.filter((s) => !s.required).map((s) => s.name), attribution: inferAttribution('inferred') },
      forbids: { value: [], attribution: inferAttribution('inferred') },
    },
    variantLogic: {
      rules: variantNames.map((name) => ({
        name,
        useWhen: {
          value: [meta.previewMatrix.variantLabels[name] ?? name],
          attribution: inferAttribution('inferred'),
        },
      })),
    },
    relationshipsAndDependencies: {
      related: { value: [], attribution: inferAttribution('inferred') },
    },
    contextSignals: {
      density: { value: ['compact', 'default', 'open'], attribution: inferAttribution('inferred') },
      modality: { value: ['desktop', 'mobile'], attribution: inferAttribution('inferred') },
      brand: { value: meta.tokenManifest ? ['theme-scope aware', 'recipe-driven'] : ['theme-scope aware'], attribution: inferAttribution('inferred') },
      mode: { value: meta.surfaceAware ? ['light', 'dark', 'surface-context'] : ['light', 'dark'], attribution: inferAttribution('inferred') },
    },
    observabilityHooks: {
      track: { value: [], attribution: inferAttribution('inferred') },
      health: { value: ['a11y_violations'], attribution: inferAttribution('inferred') },
    },
    codeSnippets: [
      {
        id: `${meta.slug}-basic`,
        title: 'Basic Usage',
        language: 'tsx',
        code: `import { ${meta.name} } from '@oneui/ui';\n\n<${meta.name} />`,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Spec assembly
// ---------------------------------------------------------------------------

interface BuildSpecArgs {
  project: Project;
  meta: ComponentMeta;
  warnings: string[];
}

/**
 * Resolve the component's directory name. Most components match the meta.name
 * (e.g. Button → packages/ui/src/components/Button), but a few aggregators
 * use a different display name from the directory (e.g. InputField meta lives
 * in components/Input/Input.shared.ts). We fall back to the tokenManifest's
 * componentName, which always matches the directory.
 */
function resolveComponentDir(meta: ComponentMeta): { dir: string; baseName: string } {
  const candidates = new Set<string>();
  candidates.add(meta.name);
  if (meta.tokenManifest?.componentName) candidates.add(meta.tokenManifest.componentName);

  for (const baseName of candidates) {
    const dir = resolve(ROOT, `packages/ui/src/components/${baseName}`);
    if (existsSync(resolve(dir, `${baseName}.shared.ts`))) {
      return { dir, baseName };
    }
  }
  // Fall back to meta.name even if shared.ts doesn't exist — the parser will
  // emit a warning rather than throw.
  return {
    dir: resolve(ROOT, `packages/ui/src/components/${meta.name}`),
    baseName: meta.name,
  };
}

function buildSpec({ project, meta, warnings }: BuildSpecArgs): ComponentDocumentationSpec {
  const template = COMPONENT_TEMPLATES[meta.name] ?? buildBaselineTemplate(meta);

  // Resolve the props interface from the colocated *.shared.ts file.
  const { dir: componentDir, baseName } = resolveComponentDir(meta);
  const sharedPath = resolve(componentDir, `${baseName}.shared.ts`);
  const candidates = template.propsInterfaceCandidates ?? [
    `${meta.name}Props`,
    `${meta.name}OwnProps`,
    `${meta.name}BaseProps`,
    // Fall back to the directory base name when meta.name and dir differ.
    `${baseName}Props`,
    `${baseName}OwnProps`,
    `${baseName}BaseProps`,
  ];

  const parseResult = parsePropsWithTsMorph(project, {
    componentName: meta.name,
    sharedPath,
    candidateInterfaces: candidates,
  });

  if (parseResult.warning) {
    warnings.push(parseResult.warning);
  }

  // Merge ts-morph-derived props with template-defined extras (e.g. aria-label).
  const props = [...parseResult.props];
  if (template.extraProps) {
    for (const extra of template.extraProps) {
      if (!props.some((p) => p.name === extra.name)) {
        props.push(extra);
      }
    }
  }

  // Slots come from tokenManifest, falling back to meta.slots when no token manifest exists.
  const slots: ComponentSlotDoc[] = (() => {
    const manifestSlots = meta.tokenManifest?.slots;
    if (manifestSlots && Object.keys(manifestSlots).length > 0) {
      return Object.values(manifestSlots).map((slot) => ({
        name: slot.name,
        types: slot.types,
        tokens: slot.tokens,
      }));
    }
    return meta.slots.map((slot) => ({
      name: slot.name,
      types: slot.acceptedTypes ?? [],
      tokens: [],
    }));
  })();

  // Code snippets: template snippets + recipe-decisions auto snippet (if applicable).
  const codeSnippets = [...template.codeSnippets];
  const recipe = meta.recipeDefinition;
  if (recipe && !codeSnippets.some((s) => s.id.endsWith('recipe-decisions'))) {
    const decisions = recipe.decisions.map((d) => d.label);
    codeSnippets.push({
      id: `${meta.slug}-recipe-decisions`,
      title: 'Recipe Decisions',
      language: 'json',
      code: JSON.stringify({ component: meta.name, decisions }, null, 2),
    });
  }

  const tags = ['machine-readable', 'generated', meta.slug];

  return {
    schemaVersion: '1.0.0',
    componentName: meta.name,
    generatedAt: GENERATED_AT,
    machineReadable: true,
    intentAndPurpose: template.intentAndPurpose,
    compositionRules: template.compositionRules,
    variantLogic: template.variantLogic,
    relationshipsAndDependencies: template.relationshipsAndDependencies,
    contextSignals: template.contextSignals,
    observabilityHooks: template.observabilityHooks,
    props,
    slots,
    propsSchema: buildPropsSchema(meta, props),
    codeSnippets,
    tags,
  };
}

// B9 — JSON Schema emission lives in @oneui/shared/utils/buildPropsSchema
// so the helper is callable from any consumer without pulling ts-morph in.
// The generator imports it at the top of this file and applies it inline
// when constructing each ComponentDocumentationSpec above.

// ---------------------------------------------------------------------------
// Override + emission
// ---------------------------------------------------------------------------

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const existing = out[key];
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      existing &&
      typeof existing === 'object' &&
      !Array.isArray(existing)
    ) {
      out[key] = deepMerge(existing as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

function applyOverride(spec: ComponentDocumentationSpec): ComponentDocumentationSpec {
  const slug = spec.componentName.toLowerCase();
  const overridePath = resolve(ROOT, `docs/components/overrides/${slug}.override.json`);
  if (!existsSync(overridePath)) return spec;
  const override = JSON.parse(readFileSync(overridePath, 'utf8')) as Partial<ComponentDocumentationSpec>;
  return deepMerge(spec, override);
}

function toMarkdown(spec: ComponentDocumentationSpec): string {
  const propRows = spec.props
    .map((prop) => `| \`${prop.name}\` | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.defaultValue ?? '-'} | ${prop.description} |`)
    .join('\n');
  const slotRows = spec.slots
    .map((slot) => `| \`${slot.name}\` | ${slot.types.join(', ')} | ${slot.tokens.map((t) => `\`${t}\``).join(', ')} |`)
    .join('\n');
  const snippetBlocks = spec.codeSnippets
    .map((snippet) => `### ${snippet.title}\n\n\`\`\`${snippet.language}\n${snippet.code}\n\`\`\``)
    .join('\n\n');

  return `# ${spec.componentName} Machine-Readable Documentation

_Generated from source metadata. Do not edit manually._

## Intent and Purpose

- **Intent**: ${spec.intentAndPurpose.intent.value}
- **Task contexts**: ${spec.intentAndPurpose.taskContexts.value.join(', ')}
- **Sentiments**: ${spec.intentAndPurpose.sentiments.value.join(', ')}

## Composition Rules

- **Requires**: ${spec.compositionRules.requires.value.join(', ')}
- **Allows**: ${spec.compositionRules.allows.value.join(', ')}
- **Forbids**: ${spec.compositionRules.forbids.value.join(', ')}

## Variant Logic

${spec.variantLogic.rules
  .map((rule) => {
    const avoid = rule.avoidWhen?.value?.length ? `; avoid when ${rule.avoidWhen.value.join(', ')}` : '';
    const pair = rule.pairWith?.value?.length ? `; pair with ${rule.pairWith.value.join(', ')}` : '';
    return `- **${rule.name}**: use when ${rule.useWhen.value.join(', ')}${avoid}${pair}`;
  })
  .join('\n')}

## Relationships and Dependencies

- **Related**: ${spec.relationshipsAndDependencies.related.value.join(', ')}
- **Escalates to**: ${spec.relationshipsAndDependencies.escalatesTo?.value.join(', ') ?? '-'}
- **Degrades to**: ${spec.relationshipsAndDependencies.degradesTo?.value.join(', ') ?? '-'}
- **Groups with**: ${spec.relationshipsAndDependencies.groupsWith?.value.join(', ') ?? '-'}

## Context Signals

- **Density**: ${spec.contextSignals.density.value.join(', ')}
- **Modality**: ${spec.contextSignals.modality.value.join(', ')}
- **Brand**: ${spec.contextSignals.brand.value.join(', ')}
- **Mode**: ${spec.contextSignals.mode.value.join(', ')}

## Observability Hooks

- **Track**: ${spec.observabilityHooks.track.value.join(', ')}
- **Health**: ${spec.observabilityHooks.health.value.join(', ')}

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
${propRows}

## Slots

| Slot | Types | Tokens |
| --- | --- | --- |
${slotRows}

## Code Snippets

${snippetBlocks}
`;
}

interface WriteOptions {
  /** Override the docs/components/generated path (used by the freshness gate). */
  docsOutDir?: string;
  /** Override the apps/platform mirror (used by the freshness gate). */
  appOutDir?: string;
}

function writeOutputs(spec: ComponentDocumentationSpec, options: WriteOptions = {}): void {
  const fileSlug = spec.componentName.toLowerCase();
  const docsDir = options.docsOutDir ?? resolve(ROOT, 'docs/components/generated');
  const appDir = options.appOutDir ?? resolve(ROOT, 'apps/platform/src/generated/component-docs');

  const jsonPath = resolve(docsDir, `${fileSlug}.docs.json`);
  const appJsonPath = resolve(appDir, `${fileSlug}.docs.json`);
  const mdPath = resolve(docsDir, `${fileSlug}.md`);

  mkdirSync(dirname(jsonPath), { recursive: true });
  mkdirSync(dirname(appJsonPath), { recursive: true });

  const markdown = toMarkdown(spec);
  const withMarkdown: ComponentDocumentationSpec = {
    ...spec,
    generatedMarkdown: markdown,
  };

  writeFileSync(jsonPath, `${JSON.stringify(withMarkdown, null, 2)}\n`, 'utf8');
  writeFileSync(appJsonPath, `${JSON.stringify(withMarkdown, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, markdown, 'utf8');
}

export interface RunOptions extends WriteOptions {
  /** Limit run to a single component name (debugging). */
  only?: string;
}

export interface RunResult {
  componentsCovered: string[];
  warnings: string[];
}

export function runMachineDocs(options: RunOptions = {}): RunResult {
  const project = createProject();
  const warnings: string[] = [];
  const covered: string[] = [];

  for (const meta of Object.values(COMPONENT_META_REGISTRY)) {
    if (options.only && meta.name !== options.only) continue;
    const baseline = buildSpec({ project, meta, warnings });
    const finalSpec = applyOverride(baseline);
    writeOutputs(finalSpec, options);
    covered.push(meta.name);
  }

  return { componentsCovered: covered, warnings };
}

function main(): void {
  const result = runMachineDocs();
  if (result.warnings.length > 0) {
    console.warn('generate-machine-docs: warnings:');
    for (const w of result.warnings) console.warn(`  - ${w}`);
  }
  console.log(
    `Generated machine-readable docs for ${result.componentsCovered.length} component(s): ${result.componentsCovered.join(', ')}.`,
  );
}

// ESM-safe entrypoint: run main() only when executed as CLI (not when imported).
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main();
}
