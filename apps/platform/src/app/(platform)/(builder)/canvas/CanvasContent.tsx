/**
 * CanvasContent.tsx
 *
 * Full-bleed component canvas — takes 100% of the content area.
 * No secondary nav, no split pane. The tldraw canvas IS the page.
 *
 * Panels:
 * - Code panel (sliding from right) — live JSX export
 * - Saved compositions panel — load previous work
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createShapeId } from 'tldraw';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  ExperienceCanvas,
  SKETCH_HTML_SHAPE_TYPE,
  SKETCH_VIEWPORTS,
  type ValidationError,
} from '@/design-tools/ExperienceCanvas';
import { astToReact } from '@oneui/shared/codegen';
import type { ASTRoot } from '@oneui/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import styles from './canvas.module.css';

const PLAYGROUND_IMPORT_KEY = 'oneui:composition-playground:open-ast';

export default function CanvasContent() {
  const { currentBrand } = usePlatformContext();

  // themeScope is now platform-wide 'global' by default (PlatformContext) —
  // the Canvas no longer needs to force-flip it on mount/unmount.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);
  const [ast, setAST] = useState<ASTRoot | null>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [saving, setSaving] = useState(false);

  const createComposition = useMutation(api.compositions.create);

  const handleASTChange = useCallback((newAST: ASTRoot) => {
    setAST(newAST);
  }, []);

  const handleValidationChange = useCallback((newErrors: ValidationError[]) => {
    setErrors(newErrors);
  }, []);

  const handleEditorReady = useCallback((editor: any) => {
    editorRef.current = editor;

    const rawImport = window.sessionStorage.getItem(PLAYGROUND_IMPORT_KEY);
    if (!rawImport) return;
    window.sessionStorage.removeItem(PLAYGROUND_IMPORT_KEY);

    try {
      const payload = JSON.parse(rawImport) as {
        ast?: ASTRoot;
        prompt?: string;
        context?: string;
      };
      if (!payload.ast?.root) return;

      const viewport =
        payload.context === 'web-app' || payload.context === 'marketing-page'
          ? 'desktop'
          : payload.context === 'print'
          ? 'tablet'
          : 'mobile';
      const viewportSpec = SKETCH_VIEWPORTS[viewport];
      const bounds = editor.getViewportPageBounds() as {
        x?: number;
        y?: number;
        w?: number;
        width?: number;
        h?: number;
        height?: number;
      };
      const id = createShapeId();
      editor.createShape({
        id,
        type: SKETCH_HTML_SHAPE_TYPE,
        x: (bounds?.x ?? 0) + ((bounds?.w ?? bounds?.width ?? 800) / 2) - viewportSpec.w / 2,
        y: (bounds?.y ?? 0) + ((bounds?.h ?? bounds?.height ?? 600) / 2) - viewportSpec.h / 2,
        props: {
          w: viewportSpec.w,
          h: viewportSpec.h,
          ast: payload.ast,
          viewport,
          prompt: payload.prompt ?? '',
        },
      });
      editor.select(id);
      editor.zoomToSelection({ animation: { duration: 300 } });
    } catch (err) {
      console.warn('[CanvasContent] Could not import playground AST:', err);
    }
  }, []);

  const code = useMemo(() => (ast ? astToReact(ast, { indent: 2, importSource: '@oneui/ui' }) : null), [ast]);

  const handleSave = useCallback(async () => {
    if (!ast || !currentBrand?.id || !code) return;
    setSaving(true);
    try {
      const snapshot = editorRef.current?.store?.getSnapshot?.();
      await createComposition({
        brandId: currentBrand.id as Id<'brands'>,
        name: `Canvas ${new Date().toLocaleString()}`,
        ast: JSON.stringify(ast),
        tldrawSnapshot: snapshot ? JSON.stringify(snapshot) : undefined,
        generatedCode: code,
      });
    } finally {
      setSaving(false);
    }
  }, [ast, code, currentBrand?.id, createComposition]);

  const hasContent = ast && ast.root.kind === 'element' && 'children' in ast.root && ast.root.children.length > 0;

  // Keyboard shortcut: Cmd+S to save. The Code view now lives inside the
  // right-docked Chat panel, so Cmd+E is no longer wired here.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasContent && currentBrand?.id && !saving) handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [hasContent, currentBrand?.id, saving, handleSave]);

  return (
    <div className={styles.page} data-full-bleed>
      {/* Validation errors — slim banner */}
      {errors.length > 0 && (
        <div className={styles.errorBanner}>
          {errors.length} {errors.length === 1 ? 'issue' : 'issues'}: {errors.map((e) => e.message).join('; ')}
        </div>
      )}

      {/* Full-bleed canvas — all overlays (Chat panel, artboard toolbar,
          controls cluster, sidebar) are now rendered inside ExperienceCanvas
          so they stack cleanly instead of floating as corner clusters. */}
      <div className={styles.canvasContainer}>
        <ExperienceCanvas
          onASTChange={handleASTChange}
          onValidationChange={handleValidationChange}
          onEditorReady={handleEditorReady}
          canvasBackground="neutral"
        />
      </div>
    </div>
  );
}
