/**
 * components/progress/page.tsx
 *
 * Progress component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Progress } from '@oneui/ui/components/Progress';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function ProgressPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Progress</h1>
        <p className={styles.description}>
          A progress bar for indicating completion of a task or operation. Supports determinate
          and indeterminate states with configurable value ranges. WCAG AA accessible.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Default" description="Basic progress bar with different values.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <Progress value={0} aria-label="0% complete" />
              <span className={styles.showcaseLabel}>0%</span>
            </div>
            <div className={styles.showcaseItem}>
              <Progress value={25} aria-label="25% complete" />
              <span className={styles.showcaseLabel}>25%</span>
            </div>
            <div className={styles.showcaseItem}>
              <Progress value={50} aria-label="50% complete" />
              <span className={styles.showcaseLabel}>50%</span>
            </div>
            <div className={styles.showcaseItem}>
              <Progress value={75} aria-label="75% complete" />
              <span className={styles.showcaseLabel}>75%</span>
            </div>
            <div className={styles.showcaseItem}>
              <Progress value={100} aria-label="100% complete" />
              <span className={styles.showcaseLabel}>100%</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Indeterminate" description="Progress bar without a known value, shown as an animation.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <Progress aria-label="Loading" />
              <span className={styles.showcaseLabel}>Indeterminate</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Sizes" description="Three size variants for different contexts.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <Progress value={60} size="small" aria-label="Small progress" />
              <span className={styles.showcaseLabel}>Small</span>
            </div>
            <div className={styles.showcaseItem}>
              <Progress value={60} size="medium" aria-label="Medium progress" />
              <span className={styles.showcaseLabel}>Medium</span>
            </div>
            <div className={styles.showcaseItem}>
              <Progress value={60} size="large" aria-label="Large progress" />
              <span className={styles.showcaseLabel}>Large</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Custom Range" description="Progress with custom min/max values.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <Progress value={150} min={0} max={200} aria-label="150 of 200" />
              <span className={styles.showcaseLabel}>150 / 200</span>
            </div>
            <div className={styles.showcaseItem}>
              <Progress value={7} min={0} max={10} aria-label="7 of 10" />
              <span className={styles.showcaseLabel}>7 / 10</span>
            </div>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard title="Surface Context" description="Progress adapts when placed on different surface backgrounds.">
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
                <div style={{ flex: 1 }}>
                  <Progress value={65} aria-label={`${label} surface progress`} />
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the Progress component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Progress } from '@oneui/ui';

// Basic usage
<Progress value={75} aria-label="75% complete" />

// Indeterminate (no value)
<Progress aria-label="Loading" />

// Custom range
<Progress value={150} min={0} max={200} aria-label="150 of 200" />

// Different sizes
<Progress value={60} size="small" aria-label="Small" />
<Progress value={60} size="medium" aria-label="Medium" />
<Progress value={60} size="large" aria-label="Large" />`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the Progress component." collapsible>
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
                <td><code>number</code></td>
                <td>-</td>
                <td>Current value. Omit for indeterminate state.</td>
              </tr>
              <tr>
                <td><code>min</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Minimum value</td>
              </tr>
              <tr>
                <td><code>max</code></td>
                <td><code>number</code></td>
                <td><code>100</code></td>
                <td>Maximum value</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;small&apos; | &apos;medium&apos; | &apos;large&apos;</code></td>
                <td><code>&apos;medium&apos;</code></td>
                <td>Size preset</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Accessible label</td>
              </tr>
              <tr>
                <td><code>aria-labelledby</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>ID of labelling element</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Additional class name</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
