/**
 * TemplateLibrary.tsx
 *
 * Sidebar panel showing available templates that can be instantiated
 * on the canvas. Organized by component category.
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { track, useEditor } from 'tldraw';
import {
  TEMPLATE_REGISTRY,
  COMPOSITION_TEMPLATES,
  getAllTemplates,
} from '@oneui/shared/templates';
import { astToReact } from '@oneui/shared/codegen';
import type { ASTRoot, ASTNode } from '@oneui/shared';
import { COMPONENT_SHAPE_TYPE } from './ComponentShape';
import { sanitizeComponentPropsForTldraw } from './canvasHelpers';
import styles from './TemplateLibrary.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Flatten an AST tree to get all component nodes */
function collectComponents(node: ASTNode): Array<{ type: string; props: Record<string, any>; text: string }> {
  if (node.kind === 'text') return [];
  if (node.kind === 'component') {
    const textChild = node.children.find((c) => c.kind === 'text');
    return [{
      type: node.type,
      props: node.props as Record<string, any>,
      text: textChild?.kind === 'text' ? textChild.text : '',
    }];
  }
  // element — recurse into children
  return node.children.flatMap(collectComponents);
}

// ---------------------------------------------------------------------------
// Template card
// ---------------------------------------------------------------------------

function TemplateCard({ template, onInsert }: { template: ASTRoot; onInsert: (t: ASTRoot) => void }) {
  const code = useMemo(
    () => astToReact(template, { includeImports: false, indent: 2 }),
    [template],
  );
  const preview = code.length > 120 ? code.slice(0, 120) + '...' : code;

  return (
    <button
      className={styles.card}
      onClick={() => onInsert(template)}
      title={`Add "${template.name}" to canvas`}
    >
      <span className={styles.cardName}>{template.name}</span>
      <pre className={styles.cardPreview}><code>{preview}</code></pre>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const TemplateLibrary = track(() => {
  const editor = useEditor();

  const handleInsert = useCallback(
    (template: ASTRoot) => {
      const bounds = editor.getViewportPageBounds();
      const cx = bounds.x + bounds.w / 2;
      const cy = bounds.y + bounds.h / 2;

      const components = collectComponents(template.root);
      const spacing = 80;
      const startY = cy - ((components.length - 1) * spacing) / 2;

      components.forEach((comp, i) => {
        editor.createShape({
          type: COMPONENT_SHAPE_TYPE as any,
          x: cx - 100,
          y: startY + i * spacing,
          props: {
            w: 200,
            h: 60,
            componentType: comp.type,
            componentProps: sanitizeComponentPropsForTldraw(comp.props as Record<string, unknown>),
            childText: comp.text,
          },
        });
      });
    },
    [editor],
  );

  const slugEntries = useMemo(
    () => Object.entries(TEMPLATE_REGISTRY),
    [],
  );

  return (
    <div className={styles.library}>
      <div className={styles.header}>Templates</div>

      {/* Component templates by slug */}
      {slugEntries.map(([slug, templates]) => (
        <div key={slug} className={styles.section}>
          <div className={styles.sectionTitle}>{slug}</div>
          {templates.map((t, i) => (
            <TemplateCard key={`${slug}-${i}`} template={t} onInsert={handleInsert} />
          ))}
        </div>
      ))}

      {/* Composition templates */}
      {COMPOSITION_TEMPLATES.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Compositions</div>
          {COMPOSITION_TEMPLATES.map((t, i) => (
            <TemplateCard key={`comp-${i}`} template={t} onInsert={handleInsert} />
          ))}
        </div>
      )}
    </div>
  );
});
