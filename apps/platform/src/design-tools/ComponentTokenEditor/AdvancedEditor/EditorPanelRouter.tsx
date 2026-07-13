/**
 * EditorPanelRouter.tsx
 *
 * Routes the floating right panel based on panelMode from the toolbar.
 *
 * Panel modes:
 * - overrides: Local component recipe + token overrides
 * - controls: Preview controls (variant, size, surface, slots, layout, state)
 * - inspect: Read-only token values (InspectPanel)
 */

'use client';

import React from 'react';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { ActionsMenu } from './ActionsMenu';
import { EditorPanel } from './EditorPanel';
import { InspectPanel } from './InspectPanel';
import { PreviewControlsContent } from './InspectCanvasControls';
import type { InspectCanvasControlsProps } from './InspectCanvasControls';
import type { EditorPanelProps } from './EditorPanel';
import type { InspectPanelProps } from './InspectPanel';
import { ComponentDocsPanel } from './ComponentDocsPanel';
import type { ComponentTokenManifest, ComponentRecipeDefinition, ComponentMeta } from '@oneui/shared';
import styles from './EditorPanelRouter.module.css';

/** Panel modes driven by the floating toolbar */
export type PanelMode = 'overrides' | 'controls' | 'inspect' | 'docs';

const PANEL_LABELS: Record<PanelMode, string> = {
  overrides: 'Component Overrides',
  controls: 'Controls',
  inspect: 'Inspector',
  docs: 'Documentation',
};

export interface EditorPanelRouterProps {
  /** Component name (used for InspectPanel) */
  componentName: string;
  /** Component token manifest */
  manifest: ComponentTokenManifest;
  /** Callback when reset all is clicked */
  onResetAll: () => void;
  /** Callback when export CSS is clicked */
  onExportCSS: () => void;
  /** Props forwarded to EditorPanel (manifest is auto-injected) */
  editorPanelProps?: Omit<EditorPanelProps, 'manifest'>;
  /** Props forwarded to InspectPanel (manifest and componentName are auto-injected) */
  inspectPanelProps?: Omit<InspectPanelProps, 'manifest' | 'componentName'>;
  /** Recipe definition (optional — only components with recipes show the recipe panel) */
  recipeDefinition?: ComponentRecipeDefinition;
  /** V4 role surface CSS vars (injected as inline styles so color swatches resolve) */
  colorVars?: Record<string, string>;
  /** Panel content mode — which toolbar button is active */
  panelMode: PanelMode;
  /** Props for the preview controls panel (variant, size, surface, etc.) */
  controlsProps?: InspectCanvasControlsProps;
  /** Component metadata for documentation panel */
  componentMeta?: ComponentMeta;
}

export function EditorPanelRouter({
  componentName,
  manifest,
  onResetAll,
  onExportCSS,
  editorPanelProps,
  inspectPanelProps,
  recipeDefinition,
  colorVars,
  panelMode,
  controlsProps,
  componentMeta,
}: EditorPanelRouterProps) {
  const {
    isDirty,
    isSaving,
    draftOverrides,
  } = useComponentTokenEditor();

  const hasOverrides = draftOverrides.size > 0;
  const saveStatus = isSaving ? 'saving' : isDirty ? 'dirty' : 'saved';
  const showSaveActions = panelMode === 'overrides';

  return (
    <div className={styles.router}>
      {/* Header — section name + conditional save status / actions */}
      <div className={styles.routerHeader}>
        <div className={styles.headerTitle}>
          <span className={styles.componentName}>{PANEL_LABELS[panelMode]}</span>
        </div>
        {showSaveActions && (
          <>
            <span
              className={styles.saveStatus}
              data-status={saveStatus}
              aria-label={isSaving ? 'Saving' : isDirty ? 'Unsaved changes' : 'Saved'}
            />
            <ActionsMenu
              isDirty={isDirty}
              hasOverrides={hasOverrides}
              onResetAll={onResetAll}
              onExportCSS={onExportCSS}
            />
          </>
        )}
      </div>

      {/* Scrollable Content */}
      <div className={styles.routerContent}>
        {panelMode === 'overrides' && (
          <EditorPanel
            manifest={manifest}
            {...editorPanelProps}
            colorVars={colorVars}
            onDecorationUpdate={editorPanelProps?.onDecorationUpdate}
            recipeDefinition={recipeDefinition}
          />
        )}

        {panelMode === 'controls' && controlsProps && (
          <div className={styles.controlsContent}>
            <PreviewControlsContent {...controlsProps} />
          </div>
        )}

        {panelMode === 'inspect' && (
          <InspectPanel
            manifest={manifest}
            componentName={componentName}
            {...inspectPanelProps}
          />
        )}

        {panelMode === 'docs' && componentMeta && (
          <ComponentDocsPanel meta={componentMeta} />
        )}
      </div>
    </div>
  );
}

export default EditorPanelRouter;
