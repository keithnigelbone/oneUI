/**
 * components/toggle/page.tsx
 *
 * Toggle component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Toggle } from '@oneui/ui/components/Toggle';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import styles from '../component.module.css';

export default function TogglePage() {
  const [boldPressed, setBoldPressed] = React.useState(false);
  const [italicPressed, setItalicPressed] = React.useState(true);
  const [underlinePressed, setUnderlinePressed] = React.useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Toggle</h1>
        <p className={styles.description}>
          Two-state button that can be toggled on or off. Commonly used for formatting controls,
          settings, and other binary options. WCAG AA accessible with keyboard support.
        </p>
      </div>

      <div className={styles.content}>
        {/* Default States */}
        <FoundationCard
          title="Default States"
          description="Toggle between pressed and unpressed states."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <Toggle
                pressed={boldPressed}
                onPressedChange={setBoldPressed}
                aria-label="Toggle bold"
              >
                <Bold size={16} />
              </Toggle>
              <span className={styles.showcaseLabel}>
                {boldPressed ? 'Pressed' : 'Not pressed'}
              </span>
            </div>
            <div className={styles.showcaseItem}>
              <Toggle
                pressed={italicPressed}
                onPressedChange={setItalicPressed}
                aria-label="Toggle italic"
              >
                <Italic size={16} />
              </Toggle>
              <span className={styles.showcaseLabel}>
                {italicPressed ? 'Pressed' : 'Not pressed'}
              </span>
            </div>
            <div className={styles.showcaseItem}>
              <Toggle
                pressed={underlinePressed}
                onPressedChange={setUnderlinePressed}
                aria-label="Toggle underline"
              >
                <Underline size={16} />
              </Toggle>
              <span className={styles.showcaseLabel}>
                {underlinePressed ? 'Pressed' : 'Not pressed'}
              </span>
            </div>
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard
          title="Sizes"
          description="Three size options for different contexts."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <Toggle size="small" defaultPressed aria-label="Small toggle">
                <Bold size={14} />
              </Toggle>
              <span className={styles.showcaseLabel}>Small</span>
            </div>
            <div className={styles.showcaseItem}>
              <Toggle size="medium" defaultPressed aria-label="Medium toggle">
                <Bold size={16} />
              </Toggle>
              <span className={styles.showcaseLabel}>Medium</span>
            </div>
            <div className={styles.showcaseItem}>
              <Toggle size="large" defaultPressed aria-label="Large toggle">
                <Bold size={20} />
              </Toggle>
              <span className={styles.showcaseLabel}>Large</span>
            </div>
          </div>
        </FoundationCard>

        {/* With Text */}
        <FoundationCard
          title="With Text"
          description="Toggles can contain text instead of icons."
        >
          <div className={styles.showcase}>
            <Toggle defaultPressed={false} aria-label="Toggle feature">
              Feature
            </Toggle>
            <Toggle defaultPressed={true} aria-label="Toggle option">
              Enabled
            </Toggle>
          </div>
        </FoundationCard>

        {/* Disabled State */}
        <FoundationCard
          title="Disabled State"
          description="Disabled toggles cannot be interacted with."
        >
          <div className={styles.showcase}>
            <Toggle disabled pressed={false} aria-label="Disabled unpressed">
              <AlignLeft size={16} />
            </Toggle>
            <Toggle disabled pressed={true} aria-label="Disabled pressed">
              <AlignCenter size={16} />
            </Toggle>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="Toggle adapts when placed on different surface backgrounds."
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
                <span style={{
                  color: 'var(--Text-High)',
                  minWidth: '100px',
                  margin: 0,
                  fontWeight: 'var(--Typography-Weight-Medium)',
                  fontSize: 'var(--Typography-Size-S)',
                }}>
                  {label}
                </span>
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Toggle defaultPressed={false} aria-label={`Unpressed toggle on ${label}`}>
                    <Bold size={16} />
                  </Toggle>
                  <Toggle defaultPressed={true} aria-label={`Pressed toggle on ${label}`}>
                    <Italic size={16} />
                  </Toggle>
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the Toggle component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { Toggle } from '@oneui/ui';
import { Bold, Italic } from 'lucide-react';
import { useState } from 'react';

function MyComponent() {
  const [bold, setBold] = useState(false);

  return (
    <>
      {/* Controlled */}
      <Toggle
        pressed={bold}
        onPressedChange={setBold}
        aria-label="Toggle bold"
      >
        <Bold size={16} />
      </Toggle>

      {/* Uncontrolled */}
      <Toggle defaultPressed={false} aria-label="Toggle italic">
        <Italic size={16} />
      </Toggle>

      {/* With text */}
      <Toggle aria-label="Toggle feature">
        Feature
      </Toggle>

      {/* Disabled */}
      <Toggle disabled pressed={true} aria-label="Disabled">
        Locked
      </Toggle>
    </>
  );
}`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the Toggle component."
          collapsible
        >
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>Required</td>
                <td>Toggle content (icon or text)</td>
              </tr>
              <tr>
                <td><code>pressed</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Whether pressed (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultPressed</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Default pressed state (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onPressedChange</code></td>
                <td><code>(pressed: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called when pressed state changes</td>
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
                <td>Whether toggle is disabled</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Accessible label (required)</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
