/**
 * MarkdownPreview.tsx
 *
 * Tab alongside editor view that renders live markdown from the resolved spec.
 * Updates in real-time as fields are edited.
 */

'use client';

import { useMemo, useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { specToMarkdown } from '@oneui/shared/utils/documentationMarkdown';
import { IconButton } from '@oneui/ui/components/IconButton';
import { useComponentDocEditor } from '@/contexts/ComponentDocEditorContext';
import docStyles from './MachineDocs.module.css';

export function MarkdownPreview() {
  const { resolvedSpec } = useComponentDocEditor();
  const [copied, setCopied] = useState(false);

  const markdown = useMemo(
    () => specToMarkdown(resolvedSpec),
    [resolvedSpec],
  );

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [markdown]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: 'var(--Spacing-3-5)',
      }}>
        <IconButton
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onPress={handleCopy}
          attention="low"
          size="small"
          aria-label="Copy markdown"
        />
      </div>
      <pre
        className={docStyles.code}
        style={{
          border: 'var(--Stroke-M) solid var(--Border-Subtle)',
          borderRadius: 'var(--Shape-4)',
          maxHeight: '600px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {markdown}
      </pre>
    </div>
  );
}
