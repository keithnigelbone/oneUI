/**
 * AIStreamingPreview.tsx
 *
 * Displays streaming AI output with accept/reject/edit actions.
 * Parses the streamed JSON and allows the user to accept it into draft changes.
 */

'use client';

import { useMemo, useCallback } from 'react';
import { Button } from '@oneui/ui/components/Button';
import type { DocumentationSectionKey, DocumentationSource } from '@oneui/shared';
import { useComponentDocEditor } from '@/contexts/ComponentDocEditorContext';
import styles from './EditableDocSection.module.css';

interface AIStreamingPreviewProps {
  content: string;
  section?: DocumentationSectionKey;
  isStreaming: boolean;
  onDismiss: () => void;
}

export function AIStreamingPreview({
  content,
  section,
  isStreaming,
  onDismiss,
}: AIStreamingPreviewProps) {
  const { updateField } = useComponentDocEditor();

  const parsed = useMemo(() => {
    try {
      // Try to parse the accumulated content as JSON
      // The AI may stream partial JSON, so we try parsing from the beginning
      const trimmed = content.trim();
      return JSON.parse(trimmed);
    } catch {
      return null;
    }
  }, [content]);

  const handleAccept = useCallback(() => {
    if (!parsed) return;

    if (section) {
      // Apply a single section
      applySection(section, parsed, updateField);
    } else {
      // Apply all sections from the parsed object
      for (const [key, value] of Object.entries(parsed)) {
        if (value && typeof value === 'object') {
          applySection(key as DocumentationSectionKey, value, updateField);
        }
      }
    }

    onDismiss();
  }, [parsed, section, updateField, onDismiss]);

  return (
    <div
      className={styles.section}
      style={{
        borderColor: 'var(--Primary-Tinted, var(--Border-Default))',
        borderStyle: 'dashed',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--Spacing-3-5)',
      }}>
        <span style={{
          color: 'var(--Text-Medium)',
          fontSize: 'var(--Typography-Size-XS)',
          fontWeight: 'var(--Typography-Weight-Medium)',
        }}>
          {isStreaming ? 'Generating...' : 'AI Suggestion'}
        </span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-2-5)' }}>
          <Button
            attention="high"
            size="small"
            onPress={handleAccept}
            disabled={isStreaming || !parsed}
          >
            Accept
          </Button>
          <Button
            attention="low"
            size="small"
            onPress={onDismiss}
          >
            Reject
          </Button>
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          padding: 'var(--Spacing-3-5)',
          borderRadius: 'var(--Shape-3-5)',
          background: 'var(--Surface-Ghost)',
          color: 'var(--Text-High)',
          fontSize: 'var(--Typography-Size-XS)',
          fontFamily: 'var(--Typography-Font-Code, var(--Typography-Font-Mono))',
          lineHeight: 'var(--Typography-LineHeight-Normal)',
          overflow: 'auto',
          maxHeight: '300px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {content}
      </pre>
    </div>
  );
}

/**
 * Apply a parsed section object to the editor draft.
 * Walks each field and calls updateField for value + attribution.
 */
function applySection(
  sectionKey: DocumentationSectionKey,
  sectionData: unknown,
  updateField: (sectionKey: DocumentationSectionKey, fieldPath: string, value: unknown) => void,
) {
  if (!sectionData || typeof sectionData !== 'object') return;
  const data = sectionData as Record<string, unknown>;

  for (const [fieldKey, fieldValue] of Object.entries(data)) {
    if (!fieldValue || typeof fieldValue !== 'object') continue;
    const docValue = fieldValue as Record<string, unknown>;

    if ('value' in docValue) {
      updateField(sectionKey, `${fieldKey}.value`, docValue.value);
      updateField(sectionKey, `${fieldKey}.attribution`, {
        source: 'overridden' as DocumentationSource,
        updatedAt: Date.now(),
        updatedBy: 'ai-assisted',
      });
    }
  }
}
