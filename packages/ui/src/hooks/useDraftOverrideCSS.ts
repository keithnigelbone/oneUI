/**
 * useDraftOverrideCSS
 *
 * Injects component token overrides (manifest defaults + user draft edits)
 * as scoped CSS via @layer brand. Most vars live on `.editor-preview-scope`;
 * component paint vars that the saved theme applies to the component element
 * are scoped to `.editor-preview-scope [data-oneui-component="..."]`.
 *
 * This ensures the Advanced Editor uses the same CSS cascade path as Storybook,
 * eliminating inline style overrides for component tokens. Inline styles bypass
 * the cascade and break CSS intermediate variable architecture (e.g., per-role
 * appearance remapping via --_btn-bold).
 *
 * Usage:
 *   useDraftOverrideCSS(componentName, draftOverrides, manifest.tokens);
 *   // Then add className="editor-preview-scope" to the preview container
 */

'use client';

import { useMemo } from 'react';
import { useStyleInjection } from './useStyleInjection';
import {
  buildComponentPreviewStyles,
  mergeComponentPreviewOverrides,
  type DraftOverrideEntry,
  type ComponentTokenManifest,
} from '@oneui/shared';

/**
 * Style element ID for draft override CSS.
 * NOTE: This is a singleton — only one AdvancedEditor should be mounted at a time.
 * If multi-editor surfaces are added later, this ID must be made unique per instance.
 */
const DRAFT_OVERRIDE_STYLE_ID = 'oneui-draft-overrides';

const COMPONENT_SCOPED_PREFIXES: Record<string, string[]> = {
  Button: [
    '--Button-role',
    '--Button-backgroundColor',
    '--Button-textColor',
    '--Button-borderColor',
    '--Button-strokeImage',
    '--Button-solidStrokeColor',
    '--Button-cssDecorationColor',
  ],
  /* LinkButton paint resolves on the element (like Button) so role tokens
     remap inside [data-surface] contexts instead of pinning the scope value. */
  LinkButton: [
    '--LinkButton-role',
    '--LinkButton-textColor',
    '--LinkButton-underlineColor',
    '--LinkButton-underlineImage',
  ],
  /* IconButton paint resolves on the element (like Button) so role tokens
     remap inside [data-surface] contexts — keeps the editor's surface-context
     ladder adapting even when the user pins colour/material overrides. */
  IconButton: [
    '--IconButton-role',
    '--IconButton-backgroundColor',
    '--IconButton-iconColor',
    '--IconButton-borderColor',
    '--IconButton-strokeImage',
    '--IconButton-solidStrokeColor',
    '--IconButton-cssDecorationColor',
  ],
  /* CircularProgressIndicator arc/track/label colours resolve on the element so
     they remap per surface in the editor's surface-context ladder. */
  CircularProgressIndicator: [
    '--CircularProgressIndicator-indicatorColor',
    '--CircularProgressIndicator-trackColor',
    '--CircularProgressIndicator-textColor',
  ],
};

function shouldScopeOnComponentElement(componentName: string, prop: string): boolean {
  const prefixes = COMPONENT_SCOPED_PREFIXES[componentName];
  return Boolean(prefixes?.some((prefix) => prop.startsWith(prefix)));
}

/**
 * Injects component token overrides as scoped CSS for the editor preview.
 *
 * @param componentName - PascalCase component name (e.g. 'Button')
 * @param draftOverrides - Current draft overrides from ComponentTokenEditorContext
 * @param manifestTokens - Token manifest definitions for the component
 */
export function useDraftOverrideCSS(
  componentName: string,
  draftOverrides: ReadonlyMap<string, DraftOverrideEntry>,
  manifestTokens: ComponentTokenManifest['tokens'],
): void {
  const css = useMemo(() => {
    const merged = mergeComponentPreviewOverrides(manifestTokens, draftOverrides);
    const styles = buildComponentPreviewStyles(componentName, merged, manifestTokens);

    const wrapperDeclarations: string[] = [];
    const componentDeclarations: string[] = [];

    for (const [prop, val] of Object.entries(styles)) {
      const declaration = `    ${prop}: ${val};`;
      if (shouldScopeOnComponentElement(componentName, prop)) {
        componentDeclarations.push(declaration);
      } else {
        wrapperDeclarations.push(declaration);
      }
    }

    const blocks: string[] = [];
    if (wrapperDeclarations.length > 0) {
      blocks.push(`  .editor-preview-scope {\n${wrapperDeclarations.join('\n')}\n  }`);
    }
    if (componentDeclarations.length > 0) {
      blocks.push(`  .editor-preview-scope [data-oneui-component="${componentName}"] {\n${componentDeclarations.join('\n')}\n  }`);
    }

    if (blocks.length === 0) return '';
    return `@layer brand {\n${blocks.join('\n')}\n}`;
  }, [componentName, draftOverrides, manifestTokens]);

  useStyleInjection(DRAFT_OVERRIDE_STYLE_ID, css);
}
