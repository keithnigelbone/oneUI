/**
 * components/scroll-area/page.tsx
 *
 * ScrollArea component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { ScrollArea } from '@oneui/ui/components/ScrollArea';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function ScrollAreaPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>ScrollArea</h1>
        <p className={styles.description}>
          A scrollable area component with customizable scrollbar visibility and behavior.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Vertical Scroll" description="Scrollable content with vertical overflow.">
          <div className={styles.showcase}>
            <ScrollArea type="hover" style={{ height: '200px', width: '300px' }}>
              <div style={{ padding: 'var(--Spacing-4)' }}>
                <p style={{ margin: 0, color: 'var(--Text-High)' }}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
                  Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
              </div>
            </ScrollArea>
          </div>
        </FoundationCard>

        <FoundationCard title="Horizontal Scroll" description="Scrollable content with horizontal overflow.">
          <div className={styles.showcase}>
            <ScrollArea type="hover" style={{ width: '300px' }}>
              <div style={{ padding: 'var(--Spacing-4)', whiteSpace: 'nowrap' }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <span key={i} style={{
                    display: 'inline-block',
                    padding: 'var(--Spacing-3-5) var(--Spacing-4)',
                    marginRight: 'var(--Spacing-3)',
                    backgroundColor: 'var(--Surface-Subtle)',
                    borderRadius: 'var(--Shape-4)',
                    color: 'var(--Text-High)'
                  }}>
                    Item {i + 1}
                  </span>
                ))}
              </div>
            </ScrollArea>
          </div>
        </FoundationCard>

        <FoundationCard title="Scrollbar Types" description="Different scrollbar visibility behaviors.">
          <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            <div className={styles.showcaseItem}>
              <ScrollArea type="hover" style={{ height: '150px', width: '250px' }}>
                <div style={{ padding: 'var(--Spacing-4)' }}>
                  <p style={{ margin: 0, color: 'var(--Text-High)' }}>
                    Hover type: Scrollbar appears on hover. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </ScrollArea>
              <span className={styles.showcaseLabel}>Hover</span>
            </div>
            <div className={styles.showcaseItem}>
              <ScrollArea type="always" style={{ height: '150px', width: '250px' }}>
                <div style={{ padding: 'var(--Spacing-4)' }}>
                  <p style={{ margin: 0, color: 'var(--Text-High)' }}>
                    Always type: Scrollbar is always visible. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </ScrollArea>
              <span className={styles.showcaseLabel}>Always</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the ScrollArea component." collapsible>
          <pre className={styles.codeBlock}>
{`import { ScrollArea } from '@oneui/ui';

// Vertical scroll
<ScrollArea type="hover" style={{ height: '200px', width: '300px' }}>
  <div>Your scrollable content here</div>
</ScrollArea>

// Horizontal scroll
<ScrollArea type="hover" style={{ width: '300px' }}>
  <div style={{ whiteSpace: 'nowrap' }}>
    Wide content that scrolls horizontally
  </div>
</ScrollArea>

// Always visible scrollbar
<ScrollArea type="always" style={{ height: '200px' }}>
  <div>Your content here</div>
</ScrollArea>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the ScrollArea component." collapsible>
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
                <td>-</td>
                <td>Scrollable content (required)</td>
              </tr>
              <tr>
                <td><code>type</code></td>
                <td><code>&apos;hover&apos; | &apos;scroll&apos; | &apos;always&apos; | &apos;auto&apos;</code></td>
                <td><code>&apos;hover&apos;</code></td>
                <td>When to show scrollbars</td>
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
