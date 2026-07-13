/**
 * components/toggle-group/page.tsx
 *
 * ToggleGroup component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline } from 'lucide-react';
import styles from '../component.module.css';

export default function ToggleGroupPage() {
  const [alignment, setAlignment] = React.useState<string | string[]>('left');
  const [formatting, setFormatting] = React.useState<string | string[]>([]);
  const [size, setSize] = React.useState<string | string[]>('medium');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>ToggleGroup</h1>
        <p className={styles.description}>
          Group of toggles with single or multiple selection modes. Supports keyboard navigation
          (Arrow keys) and automatic focus management. WCAG AA accessible.
        </p>
      </div>

      <div className={styles.content}>
        {/* Single Selection */}
        <FoundationCard
          title="Single Selection"
          description="Only one item can be selected at a time (radio behavior)."
        >
          <div className={styles.showcaseColumn}>
            <ToggleGroup
              value={alignment}
              onValueChange={setAlignment}
              toggleMultiple={false}
            >
              <ToggleGroup.Item value="left" aria-label="Align left">
                <AlignLeft size={16} />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="center" aria-label="Align center">
                <AlignCenter size={16} />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="right" aria-label="Align right">
                <AlignRight size={16} />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="justify" aria-label="Align justify">
                <AlignJustify size={16} />
              </ToggleGroup.Item>
            </ToggleGroup>
            <span className={styles.showcaseLabel}>
              Selected: {alignment}
            </span>
          </div>
        </FoundationCard>

        {/* Multiple Selection */}
        <FoundationCard
          title="Multiple Selection"
          description="Multiple items can be selected simultaneously (checkbox behavior)."
        >
          <div className={styles.showcaseColumn}>
            <ToggleGroup
              value={formatting}
              onValueChange={setFormatting}
              toggleMultiple={true}
            >
              <ToggleGroup.Item value="bold" aria-label="Bold">
                <Bold size={16} />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="italic" aria-label="Italic">
                <Italic size={16} />
              </ToggleGroup.Item>
              <ToggleGroup.Item value="underline" aria-label="Underline">
                <Underline size={16} />
              </ToggleGroup.Item>
            </ToggleGroup>
            <span className={styles.showcaseLabel}>
              Selected: {Array.isArray(formatting) ? formatting.join(', ') || 'none' : 'none'}
            </span>
          </div>
          <div className={styles.infoBox} style={{ marginTop: 'var(--Spacing-4)' }}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className={styles.infoText}>
              Use <code>toggleMultiple=true</code> to allow multiple selections.
            </p>
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard
          title="Sizes"
          description="Three size options for different contexts."
        >
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <ToggleGroup size="small" defaultValue="left">
                <ToggleGroup.Item value="left" aria-label="Left">
                  <AlignLeft size={14} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="center" aria-label="Center">
                  <AlignCenter size={14} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="right" aria-label="Right">
                  <AlignRight size={14} />
                </ToggleGroup.Item>
              </ToggleGroup>
              <span className={styles.showcaseLabel}>Small</span>
            </div>
            <div className={styles.showcaseItem}>
              <ToggleGroup
                size="medium"
                value={size}
                onValueChange={setSize}
              >
                <ToggleGroup.Item value="left" aria-label="Left">
                  <AlignLeft size={16} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="center" aria-label="Center">
                  <AlignCenter size={16} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="right" aria-label="Right">
                  <AlignRight size={16} />
                </ToggleGroup.Item>
              </ToggleGroup>
              <span className={styles.showcaseLabel}>Medium</span>
            </div>
            <div className={styles.showcaseItem}>
              <ToggleGroup size="large" defaultValue="left">
                <ToggleGroup.Item value="left" aria-label="Left">
                  <AlignLeft size={20} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="center" aria-label="Center">
                  <AlignCenter size={20} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="right" aria-label="Right">
                  <AlignRight size={20} />
                </ToggleGroup.Item>
              </ToggleGroup>
              <span className={styles.showcaseLabel}>Large</span>
            </div>
          </div>
        </FoundationCard>

        {/* Disabled State */}
        <FoundationCard
          title="Disabled State"
          description="Disable the entire group or individual items."
        >
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <ToggleGroup disabled defaultValue="left">
                <ToggleGroup.Item value="left" aria-label="Left">
                  <AlignLeft size={16} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="center" aria-label="Center">
                  <AlignCenter size={16} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="right" aria-label="Right">
                  <AlignRight size={16} />
                </ToggleGroup.Item>
              </ToggleGroup>
              <span className={styles.showcaseLabel}>Entire group disabled</span>
            </div>
            <div className={styles.showcaseItem}>
              <ToggleGroup defaultValue="left">
                <ToggleGroup.Item value="left" aria-label="Left">
                  <AlignLeft size={16} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="center" disabled aria-label="Center">
                  <AlignCenter size={16} />
                </ToggleGroup.Item>
                <ToggleGroup.Item value="right" aria-label="Right">
                  <AlignRight size={16} />
                </ToggleGroup.Item>
              </ToggleGroup>
              <span className={styles.showcaseLabel}>Center item disabled</span>
            </div>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="ToggleGroup adapts when placed on different surface backgrounds."
        >
          <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
            {([
              { mode: 'default' as const, label: 'Default' },
              { mode: 'minimal' as const, label: 'Minimal' },
              { mode: 'subtle' as const, label: 'Subtle' },
              { mode: 'moderate' as const, label: 'Moderate' },
              { mode: 'bold' as const, label: 'Bold' },
              { mode: 'elevated' as const, label: 'Elevated' },
            ]).map(({ mode, label }) => (
              <Surface
                key={mode}
                mode={mode}
                style={{
                  padding: 'var(--Spacing-4)',
                  borderRadius: 'var(--Shape-4)',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 'var(--Spacing-4)',
                  width: '100%',
                }}
              >
                <span style={{ color: 'var(--Text-High)', minWidth: '100px', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                  {label}
                </span>
                <ToggleGroup defaultValue="left">
                  <ToggleGroup.Item value="left" aria-label="Left"><AlignLeft size={16} /></ToggleGroup.Item>
                  <ToggleGroup.Item value="center" aria-label="Center"><AlignCenter size={16} /></ToggleGroup.Item>
                  <ToggleGroup.Item value="right" aria-label="Right"><AlignRight size={16} /></ToggleGroup.Item>
                </ToggleGroup>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the ToggleGroup component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { ToggleGroup } from '@oneui/ui';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useState } from 'react';

function MyComponent() {
  const [alignment, setAlignment] = useState('left');
  const [formatting, setFormatting] = useState([]);

  return (
    <>
      {/* Single selection (radio) */}
      <ToggleGroup
        value={alignment}
        onValueChange={setAlignment}
        toggleMultiple={false}
      >
        <ToggleGroup.Item value="left" aria-label="Align left">
          <AlignLeft size={16} />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="center" aria-label="Align center">
          <AlignCenter size={16} />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="right" aria-label="Align right">
          <AlignRight size={16} />
        </ToggleGroup.Item>
      </ToggleGroup>

      {/* Multiple selection (checkbox) */}
      <ToggleGroup
        value={formatting}
        onValueChange={setFormatting}
        toggleMultiple={true}
      >
        <ToggleGroup.Item value="bold" aria-label="Bold">B</ToggleGroup.Item>
        <ToggleGroup.Item value="italic" aria-label="Italic">I</ToggleGroup.Item>
        <ToggleGroup.Item value="underline" aria-label="Underline">U</ToggleGroup.Item>
      </ToggleGroup>
    </>
  );
}`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for ToggleGroup and ToggleGroup.Item."
          collapsible
        >
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Component</th>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan={6}><code>ToggleGroup</code></td>
                <td><code>value</code></td>
                <td><code>string | string[]</code></td>
                <td>-</td>
                <td>Selected value(s) (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>string | string[]</code></td>
                <td>-</td>
                <td>Default value(s) (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: string | string[]) =&gt; void</code></td>
                <td>-</td>
                <td>Called when value changes</td>
              </tr>
              <tr>
                <td><code>toggleMultiple</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Allow multiple selections</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;small&apos; | &apos;medium&apos; | &apos;large&apos;</code></td>
                <td><code>&apos;medium&apos;</code></td>
                <td>Size preset</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable entire group</td>
              </tr>
              <tr>
                <td rowSpan={3}><code>ToggleGroup.Item</code></td>
                <td><code>value</code></td>
                <td><code>string</code></td>
                <td>Required</td>
                <td>Value for this item</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable this item</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Accessible label</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
