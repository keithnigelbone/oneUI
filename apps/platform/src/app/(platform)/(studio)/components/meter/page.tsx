/**
 * components/meter/page.tsx
 *
 * Meter component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Meter } from '@oneui/ui/components/Meter';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function MeterPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Meter</h1>
        <p className={styles.description}>
          A meter component for displaying a scalar measurement within a known range, such as disk usage, progress, or ratings.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Default" description="Basic meter with different values.">
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <Meter value={25} aria-label="25% complete" />
              <span className={styles.showcaseLabel}>25%</span>
            </div>
            <div className={styles.showcaseItem}>
              <Meter value={50} aria-label="50% complete" />
              <span className={styles.showcaseLabel}>50%</span>
            </div>
            <div className={styles.showcaseItem}>
              <Meter value={75} aria-label="75% complete" />
              <span className={styles.showcaseLabel}>75%</span>
            </div>
            <div className={styles.showcaseItem}>
              <Meter value={100} aria-label="100% complete" />
              <span className={styles.showcaseLabel}>100%</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Custom Range" description="Meters with custom min/max values.">
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <Meter value={150} min={0} max={200} aria-label="150 of 200" />
              <span className={styles.showcaseLabel}>150 / 200</span>
            </div>
            <div className={styles.showcaseItem}>
              <Meter value={7} min={0} max={10} aria-label="7 of 10" />
              <span className={styles.showcaseLabel}>7 / 10</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Sizes" description="Three size variants for different contexts.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <Meter value={60} size="small" aria-label="Small meter" />
              <span className={styles.showcaseLabel}>Small</span>
            </div>
            <div className={styles.showcaseItem}>
              <Meter value={60} size="medium" aria-label="Medium meter" />
              <span className={styles.showcaseLabel}>Medium</span>
            </div>
            <div className={styles.showcaseItem}>
              <Meter value={60} size="large" aria-label="Large meter" />
              <span className={styles.showcaseLabel}>Large</span>
            </div>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard title="Surface Context" description="Meter adapts when placed on different surface backgrounds.">
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
                  <Meter value={65} aria-label={`${label} surface meter`} />
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the Meter component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Meter } from '@oneui/ui';

// Basic usage
<Meter value={75} aria-label="75% complete" />

// Custom range
<Meter value={150} min={0} max={200} aria-label="150 of 200" />

// Different sizes
<Meter value={60} size="small" aria-label="Small meter" />
<Meter value={60} size="medium" aria-label="Medium meter" />
<Meter value={60} size="large" aria-label="Large meter" />`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the Meter component." collapsible>
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
                <td>Current value (required)</td>
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
