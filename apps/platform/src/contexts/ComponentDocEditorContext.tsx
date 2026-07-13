/**
 * ComponentDocEditorContext.tsx
 *
 * React context for managing component documentation editing state.
 * Provides view/edit toggle, draft changes, and persistence to Convex.
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import type {
  ComponentDocumentationSpec,
  DocumentationSectionKey,
} from '@oneui/shared';

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === 'object' &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(
        out[key] as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

type EditorMode = 'view' | 'edit';

interface ComponentDocEditorState {
  mode: EditorMode;
  baselineSpec: ComponentDocumentationSpec;
  brandOverride: Record<string, unknown> | null;
  resolvedSpec: ComponentDocumentationSpec;
  draftChanges: Record<string, unknown>;
  isDirty: boolean;
  isSaving: boolean;
}

interface ComponentDocEditorActions {
  setMode: (mode: EditorMode) => void;
  updateField: (sectionKey: DocumentationSectionKey, fieldPath: string, value: unknown) => void;
  saveToBrand: () => Promise<void>;
  discardDraft: () => void;
  deleteOverride: () => Promise<void>;
}

interface ComponentDocEditorContextValue
  extends ComponentDocEditorState,
    ComponentDocEditorActions {}

const ComponentDocEditorCtx = createContext<ComponentDocEditorContextValue | null>(null);

interface ComponentDocEditorProviderProps {
  children: ReactNode;
  componentName: string;
  brandId: string | null;
  baselineSpec: ComponentDocumentationSpec;
}

export function ComponentDocEditorProvider({
  children,
  componentName,
  brandId,
  baselineSpec,
}: ComponentDocEditorProviderProps) {
  const [mode, setMode] = useState<EditorMode>('view');
  const [draftChanges, setDraftChanges] = useState<Record<string, unknown>>({});
  const [isSaving, setIsSaving] = useState(false);

  const overrideEntry = useQuery(
    api.componentDocs.getOverride,
    brandId ? { brandId: brandId as Id<'brands'>, componentName } : 'skip',
  );

  const brandOverride = (overrideEntry?.override as Record<string, unknown>) ?? null;

  const upsertOverride = useMutation(api.componentDocs.upsertOverride);
  const deleteOverrideMutation = useMutation(api.componentDocs.deleteOverride);

  const resolvedSpec = useMemo(() => {
    let merged = baselineSpec;
    if (brandOverride) {
      merged = deepMerge(baselineSpec as unknown as Record<string, unknown>, brandOverride) as unknown as ComponentDocumentationSpec;
    }
    if (Object.keys(draftChanges).length > 0) {
      merged = deepMerge(merged as unknown as Record<string, unknown>, draftChanges) as unknown as ComponentDocumentationSpec;
    }
    return merged;
  }, [baselineSpec, brandOverride, draftChanges]);

  const isDirty = Object.keys(draftChanges).length > 0;

  const updateField = useCallback(
    (sectionKey: DocumentationSectionKey, fieldPath: string, value: unknown) => {
      setDraftChanges((prev) => {
        const next = { ...prev };
        const section = (next[sectionKey] as Record<string, unknown>) ?? {};
        const updatedSection = { ...section };

        // fieldPath is a dot-separated path within the section, e.g. "intent.value"
        const parts = fieldPath.split('.');
        if (parts.length === 1) {
          updatedSection[parts[0]] = value;
        } else {
          // Nested path: e.g. "intent.value" → { intent: { value: ... } }
          let current = updatedSection;
          for (let i = 0; i < parts.length - 1; i++) {
            const existing = current[parts[i]];
            const nested = (existing && typeof existing === 'object' && !Array.isArray(existing))
              ? { ...(existing as Record<string, unknown>) }
              : {};
            current[parts[i]] = nested;
            current = nested;
          }
          current[parts[parts.length - 1]] = value;
        }

        next[sectionKey] = updatedSection;
        return next;
      });
    },
    [],
  );

  const saveToBrand = useCallback(async () => {
    if (!brandId || !isDirty) return;
    setIsSaving(true);
    try {
      // Merge existing brand override with draft changes
      const mergedOverride = brandOverride
        ? deepMerge(brandOverride as Record<string, unknown>, draftChanges)
        : draftChanges;

      await upsertOverride({
        brandId: brandId as Id<'brands'>,
        componentName,
        override: mergedOverride,
        updatedBy: 'platform-editor',
      });
      setDraftChanges({});
    } finally {
      setIsSaving(false);
    }
  }, [brandId, isDirty, brandOverride, draftChanges, upsertOverride, componentName]);

  const discardDraft = useCallback(() => {
    setDraftChanges({});
  }, []);

  const deleteOverride = useCallback(async () => {
    if (!brandId) return;
    setIsSaving(true);
    try {
      await deleteOverrideMutation({
        brandId: brandId as Id<'brands'>,
        componentName,
      });
      setDraftChanges({});
    } finally {
      setIsSaving(false);
    }
  }, [brandId, deleteOverrideMutation, componentName]);

  const value = useMemo<ComponentDocEditorContextValue>(
    () => ({
      mode,
      baselineSpec,
      brandOverride,
      resolvedSpec,
      draftChanges,
      isDirty,
      isSaving,
      setMode,
      updateField,
      saveToBrand,
      discardDraft,
      deleteOverride,
    }),
    [
      mode,
      baselineSpec,
      brandOverride,
      resolvedSpec,
      draftChanges,
      isDirty,
      isSaving,
      updateField,
      saveToBrand,
      discardDraft,
      deleteOverride,
    ],
  );

  return (
    <ComponentDocEditorCtx.Provider value={value}>
      {children}
    </ComponentDocEditorCtx.Provider>
  );
}

export function useComponentDocEditor(): ComponentDocEditorContextValue {
  const context = useContext(ComponentDocEditorCtx);
  if (!context) {
    throw new Error(
      'useComponentDocEditor must be used within a ComponentDocEditorProvider',
    );
  }
  return context;
}
