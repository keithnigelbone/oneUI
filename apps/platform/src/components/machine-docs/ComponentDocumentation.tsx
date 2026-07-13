/**
 * ComponentDocumentation.tsx
 *
 * Reusable component documentation panel with view/edit modes.
 * Renders all doc sections, props table, code snippets, and token info.
 * Edit mode allows inline editing with persistence to Convex per brand.
 */

'use client';

import { useState, useCallback } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import type {
  ComponentDocumentationSpec,
  ComponentTokenManifest,
  ComponentRecipeDefinition,
} from '@oneui/shared';
import { useDocStaleness } from '@/hooks/useDocStaleness';
import {
  ComponentDocEditorProvider,
  useComponentDocEditor,
} from '@/contexts/ComponentDocEditorContext';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { EditableDocSection } from './EditableDocSection';
import { AIGenerateButton } from './AIGenerateButton';
import { MarkdownPreview } from './MarkdownPreview';
import { CodeSnippet } from './CodeSnippet';
import { PropsTableAuto } from './PropsTableAuto';
import styles from './ComponentDocumentation.module.css';

/**
 * Section field definitions for the editable sections.
 */
const SECTION_DEFS = [
  {
    key: 'intentAndPurpose' as const,
    title: 'Intent & Purpose',
    fields: [
      { key: 'intent', label: 'Intent', type: 'string' as const },
      { key: 'taskContexts', label: 'Task Contexts', type: 'string[]' as const },
      { key: 'sentiments', label: 'Sentiments', type: 'string[]' as const },
    ],
  },
  {
    key: 'compositionRules' as const,
    title: 'Composition Rules',
    fields: [
      { key: 'requires', label: 'Requires', type: 'string[]' as const },
      { key: 'allows', label: 'Allows', type: 'string[]' as const },
      { key: 'forbids', label: 'Forbids', type: 'string[]' as const },
    ],
  },
  {
    key: 'relationshipsAndDependencies' as const,
    title: 'Relationships & Dependencies',
    fields: [
      { key: 'related', label: 'Related', type: 'string[]' as const },
      { key: 'escalatesTo', label: 'Escalates To', type: 'string[]' as const },
      { key: 'degradesTo', label: 'Degrades To', type: 'string[]' as const },
      { key: 'groupsWith', label: 'Groups With', type: 'string[]' as const },
    ],
  },
  {
    key: 'contextSignals' as const,
    title: 'Context Signals',
    fields: [
      { key: 'density', label: 'Density', type: 'string[]' as const },
      { key: 'modality', label: 'Modality', type: 'string[]' as const },
      { key: 'brand', label: 'Brand', type: 'string[]' as const },
      { key: 'mode', label: 'Mode', type: 'string[]' as const },
    ],
  },
  {
    key: 'observabilityHooks' as const,
    title: 'Observability Hooks',
    fields: [
      { key: 'track', label: 'Track', type: 'string[]' as const },
      { key: 'health', label: 'Health', type: 'string[]' as const },
    ],
  },
  {
    key: 'accessibilityGuidelines' as const,
    title: 'Accessibility Guidelines',
    fields: [
      { key: 'wcagLevel', label: 'WCAG Level', type: 'string[]' as const },
      { key: 'keyboardBehavior', label: 'Keyboard Behavior', type: 'string[]' as const },
      { key: 'screenReaderNotes', label: 'Screen Reader Notes', type: 'string[]' as const },
      { key: 'contrastRequirements', label: 'Contrast Requirements', type: 'string[]' as const },
    ],
  },
  {
    key: 'migrationNotes' as const,
    title: 'Migration Notes',
    fields: [
      { key: 'breakingChanges', label: 'Breaking Changes', type: 'string[]' as const },
      { key: 'deprecations', label: 'Deprecations', type: 'string[]' as const },
      { key: 'upgradeSteps', label: 'Upgrade Steps', type: 'string[]' as const },
    ],
  },
];

type ViewTab = 'editor' | 'markdown';

function DocumentationContent({
  tokenManifest,
  recipeDefinition,
  minimal,
}: {
  tokenManifest?: ComponentTokenManifest;
  recipeDefinition?: ComponentRecipeDefinition;
  minimal?: boolean;
}) {
  const {
    mode,
    setMode,
    resolvedSpec,
    isDirty,
    isSaving,
    saveToBrand,
    discardDraft,
  } = useComponentDocEditor();

  const [activeTab, setActiveTab] = useState<ViewTab>('editor');
  const { isStale, staleReason } = useDocStaleness(resolvedSpec, tokenManifest, recipeDefinition);

  const handleDownloadMarkdown = useCallback(() => {
    const markdown = resolvedSpec.generatedMarkdown ?? '';
    if (!markdown) return;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resolvedSpec.componentName.toLowerCase()}.machine-docs.md`;
    link.click();
    URL.revokeObjectURL(url);
  }, [resolvedSpec]);

  return (
    <div className={styles.container}>
      {/* Header, status, legend, and editable sections — hidden in minimal mode */}
      {!minimal && (
      <>
      {/* Header */}
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <ToggleGroup
            value={[mode]}
            onValueChange={(values) => setMode((values[0] as 'view' | 'edit') ?? 'view')}
            variant="subtool"
            size="small"
          >
            <ToggleGroup.Item value="view">View</ToggleGroup.Item>
            <ToggleGroup.Item value="edit">Edit</ToggleGroup.Item>
          </ToggleGroup>
          <ToggleGroup
            value={[activeTab]}
            onValueChange={(values) => setActiveTab((values[0] as ViewTab) ?? 'editor')}
            variant="subtool"
            size="small"
          >
            <ToggleGroup.Item value="editor">Editor</ToggleGroup.Item>
            <ToggleGroup.Item value="markdown">Markdown</ToggleGroup.Item>
          </ToggleGroup>
        </div>
        <div className={styles.headerRight}>
          {mode === 'edit' && (
            <div className={styles.editActions}>
              <AIGenerateButton
                label="Generate All"
                tokenManifest={tokenManifest}
                recipeDefinition={recipeDefinition}
              />
              <Button
                attention="low"
                size="small"
                onPress={discardDraft}
                disabled={!isDirty}
              >
                Discard
              </Button>
              <Button
                attention="high"
                size="small"
                onPress={saveToBrand}
                disabled={!isDirty}
                loading={isSaving}
              >
                Save
              </Button>
            </div>
          )}
          <Button
            attention="low"
            size="small"
            onPress={handleDownloadMarkdown}
          >
            Download Markdown
          </Button>
        </div>
      </div>

      {/* Status line */}
      <div className={styles.statusLine}>
        <span className={styles.statusText}>machine-readable</span>
        <span className={styles.statusSeparator} />
        <span className={styles.statusText}>generated</span>
        <span className={styles.statusSeparator} />
        <span className={styles.statusText}>ai-collaborative</span>
        <span className={styles.statusSeparator} />
        <span className={styles.statusText}>
          updated {new Date(resolvedSpec.generatedAt).toLocaleDateString()}
        </span>
        {isDirty && (
          <>
            <span className={styles.statusSeparator} />
            <span className={styles.statusTextWarning}>unsaved changes</span>
          </>
        )}
        {isStale && (
          <>
            <span className={styles.statusSeparator} />
            <span className={styles.statusTextCritical}>
              {staleReason ? 'stale — source changed' : 'stale'}
            </span>
          </>
        )}
      </div>

      {/* Legend for attribution dots */}
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDotInferred} />
          inferred
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDotAuthored} />
          authored
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDotOverridden} />
          overridden
        </span>
      </div>

      {activeTab === 'markdown' ? (
        <MarkdownPreview />
      ) : (
      <>
      {/* Editable sections grid */}
      <div className={styles.sectionGrid}>
        {SECTION_DEFS.map((def) => {
          // Skip sections not present in the spec (e.g. optional accessibility/migration)
          const sectionData = resolvedSpec[def.key as keyof ComponentDocumentationSpec];
          if (!sectionData && mode === 'view') return null;

          return (
            <EditableDocSection
              key={def.key}
              title={def.title}
              sectionKey={def.key}
              fields={def.fields}
            />
          );
        })}
      </div>
      </>
      )}
      </>
      )}

      {/* Code Snippets — always visible (including minimal mode) */}
      {resolvedSpec.codeSnippets.length > 0 && (
        <div className={styles.snippetStack}>
          <h4 className={styles.sectionHeadingFlush}>Usage Examples</h4>
          {resolvedSpec.codeSnippets.map((snippet) => (
            <CodeSnippet
              key={snippet.id}
              title={snippet.title}
              language={snippet.language}
              code={snippet.code}
            />
          ))}
        </div>
      )}

      {/* Props table — always visible (including minimal mode) */}
      {resolvedSpec.props.length > 0 && (
        <div>
          <h4 className={styles.sectionHeading}>Props</h4>
          <PropsTableAuto propsList={resolvedSpec.props} />
        </div>
      )}
    </div>
  );
}

/** Minimal empty spec for components without pre-generated docs JSON */
function createEmptySpec(componentName: string): ComponentDocumentationSpec {
  const empty = <T,>(value: T) => ({ value, attribution: { source: 'inferred' as const } });
  return {
    schemaVersion: '1.0.0',
    componentName,
    generatedAt: new Date().toISOString(),
    machineReadable: true,
    intentAndPurpose: { intent: empty(''), taskContexts: empty([]), sentiments: empty([]) },
    compositionRules: { requires: empty([]), allows: empty([]), forbids: empty([]) },
    variantLogic: { rules: [] },
    relationshipsAndDependencies: { related: empty([]), escalatesTo: empty([]), degradesTo: empty([]), groupsWith: empty([]) },
    contextSignals: { density: empty([]), modality: empty([]), brand: empty([]), mode: empty([]) },
    observabilityHooks: { track: empty([]), health: empty([]) },
    props: [],
    slots: [],
    codeSnippets: [],
  };
}

interface ComponentDocumentationProps {
  componentName: string;
  baselineSpec?: ComponentDocumentationSpec;
  tokenManifest?: ComponentTokenManifest;
  recipeDefinition?: ComponentRecipeDefinition;
  /** When true, only shows Usage Examples and Props table — hides header, status, editable doc sections */
  minimal?: boolean;
}

export function ComponentDocumentation({
  componentName,
  baselineSpec,
  tokenManifest,
  recipeDefinition,
  minimal,
}: ComponentDocumentationProps) {
  const { currentBrand } = usePlatformContext();
  const resolvedBaseline = baselineSpec ?? createEmptySpec(componentName);

  return (
    <ComponentDocEditorProvider
      componentName={componentName}
      brandId={currentBrand?.id ?? null}
      baselineSpec={resolvedBaseline}
    >
      <DocumentationContent
        tokenManifest={tokenManifest}
        recipeDefinition={recipeDefinition}
        minimal={minimal}
      />
    </ComponentDocEditorProvider>
  );
}
