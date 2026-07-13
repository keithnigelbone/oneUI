/**
 * components/icon-button/page.tsx
 *
 * IconButton component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function IconButtonComponentPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>IconButton</h1>
        <p className={styles.description}>
          Icon-only button for compact actions. Requires aria-label for accessibility.
          Uses Pill shape (999px) for consistent interactive affordance.
        </p>
      </div>

      <div className={styles.content}>
        {/* Variants */}
        <FoundationCard
          title="Variants"
          description="Three visual variants for different emphasis levels."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" attention="high" aria-label="Add (bold)" />
              <span className={styles.showcaseLabel}>Bold</span>
            </div>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" attention="medium" aria-label="Add (subtle)" />
              <span className={styles.showcaseLabel}>Subtle</span>
            </div>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" attention="low" aria-label="Add (ghost)" />
              <span className={styles.showcaseLabel}>Ghost</span>
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
              <IconButton icon="add" size="small" aria-label="Add (small)" />
              <span className={styles.showcaseLabel}>Small</span>
            </div>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" size="medium" aria-label="Add (medium)" />
              <span className={styles.showcaseLabel}>Medium</span>
            </div>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" size="large" aria-label="Add (large)" />
              <span className={styles.showcaseLabel}>Large</span>
            </div>
          </div>
        </FoundationCard>

        {/* States */}
        <FoundationCard
          title="States"
          description="Interactive states for feedback and loading."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" aria-label="Default" />
              <span className={styles.showcaseLabel}>Default</span>
            </div>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" disabled aria-label="Disabled" />
              <span className={styles.showcaseLabel}>Disabled</span>
            </div>
            <div className={styles.showcaseItem}>
              <IconButton icon="add" loading aria-label="Loading" />
              <span className={styles.showcaseLabel}>Loading</span>
            </div>
          </div>
        </FoundationCard>

        {/* Icon Examples */}
        <FoundationCard
          title="Icon Examples"
          description="Various semantic icons for common actions."
        >
          <div className={styles.showcase}>
            <IconButton icon="add" aria-label="Add" />
            <IconButton icon="close" aria-label="Close" />
            <IconButton icon="search" aria-label="Search" />
            <IconButton icon="settings" aria-label="Settings" />
            <IconButton icon="edit" aria-label="Edit" />
            <IconButton icon="delete" aria-label="Delete" />
            <IconButton icon="menu" aria-label="Menu" />
            <IconButton icon="user" aria-label="User" />
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="IconButton adapts when placed on different surface backgrounds."
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
                  <IconButton icon="add" attention="high" aria-label={`Add (bold on ${label})`} />
                  <IconButton icon="add" attention="medium" aria-label={`Add (subtle on ${label})`} />
                  <IconButton icon="add" attention="low" aria-label={`Add (ghost on ${label})`} />
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Accessibility Notice */}
        <FoundationCard title="Accessibility">
          <div className={styles.infoBox}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className={styles.infoText}>
              IconButton <strong>requires</strong> an <code>aria-label</code> prop for screen reader accessibility.
              Without visible text, the label provides context for assistive technologies.
            </p>
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the IconButton component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { IconButton } from '@oneui/ui';

// Basic usage (aria-label required!)
<IconButton icon="add" aria-label="Add item" />

// With variant and size
<IconButton
  icon="settings"
  attention="low"
  size="large"
  aria-label="Open settings"
/>

// States
<IconButton icon="save" disabled aria-label="Save" />
<IconButton icon="refresh" loading aria-label="Refreshing" />`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the IconButton component."
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
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>Required</td>
                <td>Accessibility label</td>
              </tr>
              <tr>
                <td><code>variant</code></td>
                <td><code>&apos;bold&apos; | &apos;subtle&apos; | &apos;ghost&apos;</code></td>
                <td><code>&apos;bold&apos;</code></td>
                <td>Visual variant</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;small&apos; | &apos;medium&apos; | &apos;large&apos;</code></td>
                <td><code>&apos;medium&apos;</code></td>
                <td>Button size</td>
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
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
