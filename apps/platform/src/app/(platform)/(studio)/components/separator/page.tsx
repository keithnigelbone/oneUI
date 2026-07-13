/**
 * components/separator/page.tsx
 *
 * Separator component showcase page
 * Displays horizontal and vertical separators with usage examples
 */

'use client';

import React from 'react';
import { Separator } from '@oneui/ui/components/Separator';
import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function SeparatorPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Separator</h1>
        <p className={styles.description}>
          A visual divider that separates content or UI elements. Can be oriented horizontally or vertically.
        </p>
      </div>
      <div className={styles.content}>
        {/* Horizontal Separator */}
        <FoundationCard
          title="Horizontal"
          description="Default separator orientation for dividing content vertically."
        >
          <div className={styles.showcaseColumn}>
            <div style={{ width: '100%' }}>
              <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                Content above the separator
              </p>
            </div>
            <Separator orientation="horizontal" />
            <div style={{ width: '100%' }}>
              <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                Content below the separator
              </p>
            </div>
          </div>
        </FoundationCard>

        {/* Vertical Separator */}
        <FoundationCard
          title="Vertical"
          description="Vertical orientation for dividing content horizontally."
        >
          <div className={styles.showcase}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', height: '60px' }}>
              <div>
                <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                  Left content
                </p>
              </div>
              <Separator orientation="vertical" />
              <div>
                <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                  Right content
                </p>
              </div>
            </div>
          </div>
        </FoundationCard>

        {/* In Lists */}
        <FoundationCard
          title="In Lists"
          description="Use separators between list items for clear visual hierarchy."
        >
          <div className={styles.showcaseColumn}>
            <div style={{ width: '100%', padding: 'var(--Spacing-3-5) 0' }}>
              <h4 style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-M)', fontWeight: 'var(--Typography-Weight-Medium)' }}>
                Item One
              </h4>
              <p style={{ margin: 'var(--Spacing-2-5) 0 0', color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                Description for the first item
              </p>
            </div>
            <Separator />
            <div style={{ width: '100%', padding: 'var(--Spacing-3-5) 0' }}>
              <h4 style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-M)', fontWeight: 'var(--Typography-Weight-Medium)' }}>
                Item Two
              </h4>
              <p style={{ margin: 'var(--Spacing-2-5) 0 0', color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                Description for the second item
              </p>
            </div>
            <Separator />
            <div style={{ width: '100%', padding: 'var(--Spacing-3-5) 0' }}>
              <h4 style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-M)', fontWeight: 'var(--Typography-Weight-Medium)' }}>
                Item Three
              </h4>
              <p style={{ margin: 'var(--Spacing-2-5) 0 0', color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                Description for the third item
              </p>
            </div>
          </div>
        </FoundationCard>

        {/* In Toolbar */}
        <FoundationCard
          title="In Toolbar"
          description="Use vertical separators to group toolbar actions."
        >
          <div className={styles.showcase}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--Spacing-3-5)',
              padding: 'var(--Spacing-3-5)',
              backgroundColor: 'var(--Surface-Subtle)',
              borderRadius: 'var(--Shape-4)',
            }}>
              <Button attention="low" size="small" onPress={() => {}}>
                Bold
              </Button>
              <Button attention="low" size="small" onPress={() => {}}>
                Italic
              </Button>
              <Separator orientation="vertical" />
              <Button attention="low" size="small" onPress={() => {}}>
                Link
              </Button>
              <Button attention="low" size="small" onPress={() => {}}>
                Image
              </Button>
            </div>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard title="Surface Context" description="Separator adapts when placed on different surface backgrounds.">
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
                  flexDirection: 'column',
                  gap: 'var(--Spacing-3-5)',
                  width: '100%',
                }}
              >
                <span style={{ color: 'var(--Text-High)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                  {label}
                </span>
                <Separator orientation="horizontal" />
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the Separator component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { Separator } from '@oneui/ui';

// Horizontal (default)
<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>

// Explicit horizontal
<Separator orientation="horizontal" />

// Vertical
<div style={{ display: 'flex', alignItems: 'center' }}>
  <span>Left</span>
  <Separator orientation="vertical" />
  <span>Right</span>
</div>

// In a list
<ul>
  <li>Item 1</li>
  <Separator />
  <li>Item 2</li>
  <Separator />
  <li>Item 3</li>
</ul>

// With custom styling
<Separator className={styles.customSeparator} />`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the Separator component."
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
                <td><code>orientation</code></td>
                <td><code>&apos;horizontal&apos; | &apos;vertical&apos;</code></td>
                <td><code>&apos;horizontal&apos;</code></td>
                <td>Visual orientation of the separator</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Additional CSS class for custom styling</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>

        {/* Accessibility */}
        <FoundationCard
          title="Accessibility"
          description="Separator is properly marked up for screen readers."
          collapsible
        >
          <div className={styles.infoBox}>
            <svg className={styles.infoIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p className={styles.infoText}>
              The Separator component uses the <code>separator</code> ARIA role and is properly announced by screen readers. Horizontal separators are announced as dividing vertical content, while vertical separators divide horizontal content.
            </p>
          </div>
        </FoundationCard>
      </div>
    </div>
  );
}
