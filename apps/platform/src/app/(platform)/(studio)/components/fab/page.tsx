/**
 * components/fab/page.tsx
 *
 * FAB (Floating Action Button) component showcase page
 * Displays variants, sizes, positions, and usage examples
 */

'use client';

import React from 'react';
import { FAB } from '@oneui/ui/components/FAB';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function FABComponentPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>FAB</h1>
        <p className={styles.description}>
          Floating Action Button for primary or promoted actions. Features elevation shadow,
          fixed positioning, and optional extended mode with label.
        </p>
      </div>

      <div className={styles.content}>
        {/* Variants */}
        <FoundationCard
          title="Variants"
          description="Three color variants for different emphasis levels."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <FAB icon="add" variant="primary" aria-label="Add (primary)" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Primary</span>
            </div>
            <div className={styles.showcaseItem}>
              <FAB icon="add" variant="secondary" aria-label="Add (secondary)" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Secondary</span>
            </div>
            <div className={styles.showcaseItem}>
              <FAB icon="add" variant="surface" aria-label="Add (surface)" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Surface</span>
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
              <FAB icon="add" size="small" aria-label="Add (small)" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Small</span>
            </div>
            <div className={styles.showcaseItem}>
              <FAB icon="add" size="medium" aria-label="Add (medium)" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Medium</span>
            </div>
            <div className={styles.showcaseItem}>
              <FAB icon="add" size="large" aria-label="Add (large)" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Large</span>
            </div>
          </div>
        </FoundationCard>

        {/* Extended FAB */}
        <FoundationCard
          title="Extended FAB"
          description="Add a label to create an extended FAB with icon and text."
        >
          <div className={styles.showcase}>
            <FAB icon="add" label="Create" style={{ position: 'relative' }} />
            <FAB icon="edit" label="Edit document" style={{ position: 'relative' }} />
            <FAB icon="share" label="Share" variant="secondary" style={{ position: 'relative' }} />
          </div>
        </FoundationCard>

        {/* States */}
        <FoundationCard
          title="States"
          description="Interactive states for feedback and loading."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <FAB icon="add" aria-label="Default" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Default</span>
            </div>
            <div className={styles.showcaseItem}>
              <FAB icon="add" disabled aria-label="Disabled" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Disabled</span>
            </div>
            <div className={styles.showcaseItem}>
              <FAB icon="add" loading aria-label="Loading" style={{ position: 'relative' }} />
              <span className={styles.showcaseLabel}>Loading</span>
            </div>
          </div>
        </FoundationCard>

        {/* Positioning Note */}
        <FoundationCard title="Positioning">
          <div className={styles.infoBox}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className={styles.infoText}>
              FAB uses <strong>fixed positioning</strong> by default with three position options:
              <code>bottom-right</code> (default), <code>bottom-left</code>, and <code>bottom-center</code>.
              In this showcase, FABs are set to <code>position: relative</code> for display purposes.
            </p>
          </div>
          <div style={{ marginTop: 'var(--Spacing-4)' }}>
            <p style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)', margin: 0 }}>
              Position options:
            </p>
            <ul style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)', marginTop: 'var(--Spacing-3)' }}>
              <li><code>bottom-right</code> — Default, most common placement</li>
              <li><code>bottom-left</code> — Alternative for RTL or specific layouts</li>
              <li><code>bottom-center</code> — Centered, for prominent actions</li>
            </ul>
          </div>
        </FoundationCard>

        {/* Elevation */}
        <FoundationCard
          title="Elevation"
          description="FAB uses Elevation-3 shadow for floating appearance."
        >
          <div className={styles.infoBox}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            <p className={styles.infoText}>
              The floating appearance comes from <code>--Elevation-3</code> shadow token.
              On hover, it elevates to <code>--Elevation-4</code> for interactive feedback.
            </p>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="FAB adapts when placed on different surface backgrounds."
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
                  <FAB icon="add" variant="primary" aria-label={`Add (primary on ${label})`} style={{ position: 'relative' }} />
                  <FAB icon="add" variant="secondary" aria-label={`Add (secondary on ${label})`} style={{ position: 'relative' }} />
                  <FAB icon="add" variant="surface" aria-label={`Add (surface on ${label})`} style={{ position: 'relative' }} />
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the FAB component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { FAB } from '@oneui/ui';

// Basic FAB (fixed position)
<FAB icon="add" aria-label="Add item" />

// Extended FAB with label
<FAB icon="edit" label="Edit document" />

// Different position
<FAB
  icon="chat"
  aria-label="Open chat"
  position="bottom-left"
/>

// Variant and size
<FAB
  icon="add"
  variant="secondary"
  size="large"
  aria-label="Create new"
/>`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the FAB component."
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
                <td><code>icon</code></td>
                <td><code>SemanticIconName | ReactElement</code></td>
                <td>Required</td>
                <td>Icon to display</td>
              </tr>
              <tr>
                <td><code>label</code></td>
                <td><code>ReactNode</code></td>
                <td>-</td>
                <td>Text label (creates extended FAB)</td>
              </tr>
              <tr>
                <td><code>variant</code></td>
                <td><code>&apos;primary&apos; | &apos;secondary&apos; | &apos;surface&apos;</code></td>
                <td><code>&apos;primary&apos;</code></td>
                <td>Color variant</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;small&apos; | &apos;medium&apos; | &apos;large&apos;</code></td>
                <td><code>&apos;medium&apos;</code></td>
                <td>Button size</td>
              </tr>
              <tr>
                <td><code>position</code></td>
                <td><code>&apos;bottom-right&apos; | &apos;bottom-left&apos; | &apos;bottom-center&apos;</code></td>
                <td><code>&apos;bottom-right&apos;</code></td>
                <td>Fixed position on screen</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable interactions</td>
              </tr>
              <tr>
                <td><code>loading</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Show loading spinner</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Required if no label prop</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
