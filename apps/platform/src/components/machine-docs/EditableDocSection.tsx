/**
 * EditableDocSection.tsx
 *
 * Renders a documentation section in view or edit mode.
 * In view mode: displays badges + text (same as MachineDocSection).
 * In edit mode: inline editors per field type with attribution badges.
 */

'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@oneui/ui/components/Input';
import { IconButton } from '@oneui/ui/components/IconButton';
import type {
  DocumentationValue,
  DocumentationSectionKey,
  DocumentationSource,
} from '@oneui/shared';
import { useComponentDocEditor } from '@/contexts/ComponentDocEditorContext';
import styles from './EditableDocSection.module.css';

interface FieldDef {
  key: string;
  label: string;
  type: 'string' | 'string[]';
}

interface EditableDocSectionProps {
  title: string;
  sectionKey: DocumentationSectionKey;
  fields: FieldDef[];
}

function AttributionDot({ source }: { source: DocumentationSource }) {
  const className =
    source === 'overridden'
      ? styles.dotOverridden
      : source === 'authored'
        ? styles.dotAuthored
        : styles.dotInferred;
  return <span className={`${styles.attributionDot} ${className}`} title={source} />;
}

function StringField({
  value,
  editing,
  onChange,
}: {
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  if (editing) {
    return (
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
      />
    );
  }
  return (
    <div className={styles.fieldValue}>
      {value}
    </div>
  );
}

function ArrayField({
  items,
  editing,
  onChange,
}: {
  items: string[];
  editing: boolean;
  onChange: (items: string[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInputValue('');
  }, [inputValue, items, onChange]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    },
    [handleAdd],
  );

  if (editing) {
    return (
      <div className={styles.chipEditWrap}>
        <div className={styles.chipList}>
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className={styles.chip}>
              {item}
              <IconButton
                icon={<X size={10} />}
                onPress={() => handleRemove(index)}
                attention="low"
                size="small"
                aria-label={`Remove ${item}`}
              />
            </span>
          ))}
        </div>
        <Input
          placeholder="Add..."
          value={inputValue}
          onChange={(val) => setInputValue(val)}
          onKeyDown={handleKeyDown}
          onBlur={handleAdd}
          size="s"
        />
      </div>
    );
  }

  return (
    <div className={styles.chipList}>
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={styles.chip}>
          {item}
        </span>
      ))}
    </div>
  );
}

export function EditableDocSection({
  title,
  sectionKey,
  fields,
}: EditableDocSectionProps) {
  const { mode, resolvedSpec, updateField } = useComponentDocEditor();
  const editing = mode === 'edit';

  const section = resolvedSpec[sectionKey] as Record<string, unknown> | undefined;
  if (!section) return null;

  return (
    <section className={styles.section}>
      {fields.map((field) => {
        const docValue = section[field.key] as DocumentationValue<unknown> | undefined;
        if (!docValue) return null;

        const attribution = docValue.attribution ?? { source: 'inferred' as const };

        return (
          <div key={field.key} className={styles.fieldGroup}>
            {field.type === 'string' ? (
              <StringField
                value={docValue.value as string}
                editing={editing}
                onChange={(val) => {
                  updateField(sectionKey, `${field.key}.value`, val);
                  updateField(sectionKey, `${field.key}.attribution`, {
                    source: 'overridden' as DocumentationSource,
                    updatedAt: Date.now(),
                    updatedBy: 'platform-editor',
                  });
                }}
              />
            ) : (
              <ArrayField
                items={(docValue.value as string[]) ?? []}
                editing={editing}
                onChange={(val) => {
                  updateField(sectionKey, `${field.key}.value`, val);
                  updateField(sectionKey, `${field.key}.attribution`, {
                    source: 'overridden' as DocumentationSource,
                    updatedAt: Date.now(),
                    updatedBy: 'platform-editor',
                  });
                }}
              />
            )}
            <span className={styles.fieldLabel}>
              {field.label}
              {!editing && <AttributionDot source={attribution.source} />}
            </span>
          </div>
        );
      })}
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>{title}</h4>
      </div>
    </section>
  );
}
