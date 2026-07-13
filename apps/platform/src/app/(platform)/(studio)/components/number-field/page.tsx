/**
 * components/number-field/page.tsx
 *
 * NumberField component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { NumberField } from '@oneui/ui/components/NumberField';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function NumberFieldPage() {
  const [value1, setValue1] = React.useState<number | null>(0);
  const [value2, setValue2] = React.useState<number | null>(5);
  const [value3, setValue3] = React.useState<number | null>(50);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>NumberField</h1>
        <p className={styles.description}>
          Number input with increment/decrement buttons. Supports keyboard navigation
          (Arrow keys, Shift+Arrow for large steps), min/max constraints, and custom step values.
        </p>
      </div>

      <div className={styles.content}>
        {/* Default */}
        <FoundationCard
          title="Default"
          description="Basic number field with increment/decrement controls."
        >
          <div className={styles.showcaseColumn}>
            <NumberField
              label="Quantity"
              value={value1}
              onValueChange={setValue1}
              placeholder="Enter quantity"
            />
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard
          title="Sizes"
          description="Three size options for different contexts."
        >
          <div className={styles.showcaseColumn}>
            <NumberField
              label="Small"
              size="small"
              defaultValue={10}
            />
            <NumberField
              label="Medium (default)"
              size="medium"
              defaultValue={20}
            />
            <NumberField
              label="Large"
              size="large"
              defaultValue={30}
            />
          </div>
        </FoundationCard>

        {/* Min/Max Constraints */}
        <FoundationCard
          title="Min/Max Constraints"
          description="Restrict values within a specific range."
        >
          <div className={styles.showcaseColumn}>
            <NumberField
              label="Percentage (0-100)"
              value={value2}
              onValueChange={setValue2}
              min={0}
              max={100}
              step={5}
            />
          </div>
          <div className={styles.infoBox} style={{ marginTop: 'var(--Spacing-4)' }}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className={styles.infoText}>
              The buttons automatically disable when reaching min/max values.
            </p>
          </div>
        </FoundationCard>

        {/* Step Values */}
        <FoundationCard
          title="Step Values"
          description="Control increment/decrement amounts. Use Shift+Arrow for large steps."
        >
          <div className={styles.showcaseColumn}>
            <NumberField
              label="Price (step: 0.01)"
              defaultValue={9.99}
              step={0.01}
              largeStep={1}
              min={0}
            />
            <NumberField
              label="Count (step: 10)"
              value={value3}
              onValueChange={setValue3}
              step={10}
              largeStep={100}
              min={0}
              max={1000}
            />
          </div>
        </FoundationCard>

        {/* States */}
        <FoundationCard
          title="States"
          description="Disabled and required states."
        >
          <div className={styles.showcaseColumn}>
            <NumberField
              label="Disabled"
              defaultValue={42}
              disabled
            />
            <NumberField
              label="Required field"
              required
              placeholder="Required"
            />
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard title="Surface Context" description="NumberField adapts when placed on different surface backgrounds.">
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
                <NumberField defaultValue={42} aria-label={`Number on ${label}`} />
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the NumberField component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { NumberField } from '@oneui/ui';
import { useState } from 'react';

function MyComponent() {
  const [value, setValue] = useState<number | null>(0);

  return (
    <>
      {/* Basic */}
      <NumberField
        label="Quantity"
        value={value}
        onValueChange={setValue}
      />

      {/* With constraints */}
      <NumberField
        label="Percentage"
        min={0}
        max={100}
        step={5}
        defaultValue={50}
      />

      {/* With custom steps */}
      <NumberField
        label="Price"
        step={0.01}
        largeStep={1}
        defaultValue={9.99}
      />
    </>
  );
}`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the NumberField component."
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
                <td><code>value</code></td>
                <td><code>number | null</code></td>
                <td>-</td>
                <td>Current value (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Default value (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: number | null) =&gt; void</code></td>
                <td>-</td>
                <td>Called when value changes</td>
              </tr>
              <tr>
                <td><code>min</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Minimum value</td>
              </tr>
              <tr>
                <td><code>max</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Maximum value</td>
              </tr>
              <tr>
                <td><code>step</code></td>
                <td><code>number</code></td>
                <td><code>1</code></td>
                <td>Step increment</td>
              </tr>
              <tr>
                <td><code>largeStep</code></td>
                <td><code>number</code></td>
                <td><code>10</code></td>
                <td>Large step (Shift+Arrow)</td>
              </tr>
              <tr>
                <td><code>label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Label text</td>
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
                <td>Whether field is disabled</td>
              </tr>
              <tr>
                <td><code>required</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Whether field is required</td>
              </tr>
              <tr>
                <td><code>placeholder</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Placeholder text</td>
              </tr>
              <tr>
                <td><code>name</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Field name</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
