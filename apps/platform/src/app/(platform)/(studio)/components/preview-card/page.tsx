/**
 * components/preview-card/page.tsx
 *
 * PreviewCard component showcase page
 * Displays hover-triggered preview cards with positioning options
 */

'use client';

import React from 'react';
import { PreviewCard, PreviewCardTrigger, PreviewCardPortal } from '@oneui/ui/components/PreviewCard';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function PreviewCardPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Preview Card</h1>
        <p className={styles.description}>
          A hover-triggered card that displays rich preview content anchored to a trigger element. Useful for link previews and contextual information.
        </p>
      </div>
      <div className={styles.content}>
        {/* Basic Preview Card */}
        <FoundationCard
          title="Basic Preview Card"
          description="Hover over the text to see the preview card."
        >
          <div className={styles.showcase}>
            <PreviewCard>
              <PreviewCardTrigger>
                <span style={{
                  color: 'var(--Surface-Bold)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 'var(--Typography-Size-M)'
                }}>
                  Hover over me
                </span>
              </PreviewCardTrigger>
              <PreviewCardPortal>
                <div style={{
                  padding: 'var(--Spacing-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-3-5)',
                  minWidth: '200px'
                }}>
                  <h3 style={{
                    margin: 0,
                    color: 'var(--Text-High)',
                    fontSize: 'var(--Typography-Size-M)',
                    fontWeight: 'var(--Typography-Weight-Medium)'
                  }}>
                    Preview Card
                  </h3>
                  <p style={{
                    margin: 0,
                    color: 'var(--Text-Medium)',
                    fontSize: 'var(--Typography-Size-S)'
                  }}>
                    This card appears on hover and can contain any content like images, text, or actions.
                  </p>
                </div>
              </PreviewCardPortal>
            </PreviewCard>
          </div>
        </FoundationCard>

        {/* With Image */}
        <FoundationCard
          title="With Image"
          description="Preview cards can include images for richer previews."
        >
          <div className={styles.showcase}>
            <PreviewCard>
              <PreviewCardTrigger>
                <span style={{
                  color: 'var(--Surface-Bold)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: 'var(--Typography-Size-M)'
                }}>
                  View product preview
                </span>
              </PreviewCardTrigger>
              <PreviewCardPortal>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-4)',
                  maxWidth: '280px'
                }}>
                  <div style={{
                    width: '100%',
                    height: '140px',
                    backgroundColor: 'var(--Surface-Subtle)',
                    borderRadius: 'var(--Shape-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--Text-Low)',
                    fontSize: 'var(--Typography-Size-S)'
                  }}>
                    Image Placeholder
                  </div>
                  <div style={{ padding: '0 var(--Spacing-4) var(--Spacing-4)' }}>
                    <h3 style={{
                      margin: 0,
                      color: 'var(--Text-High)',
                      fontSize: 'var(--Typography-Size-M)',
                      fontWeight: 'var(--Typography-Weight-Medium)'
                    }}>
                      Product Name
                    </h3>
                    <p style={{
                      margin: 'var(--Spacing-3) 0 0',
                      color: 'var(--Text-Medium)',
                      fontSize: 'var(--Typography-Size-S)'
                    }}>
                      A brief description of the product with key features and benefits.
                    </p>
                  </div>
                </div>
              </PreviewCardPortal>
            </PreviewCard>
          </div>
        </FoundationCard>

        {/* Positioning */}
        <FoundationCard
          title="Positioning"
          description="Control which side the preview card appears on."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <PreviewCard>
                <PreviewCardTrigger>
                  <span style={{
                    color: 'var(--Surface-Bold)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 'var(--Typography-Size-S)'
                  }}>
                    Top
                  </span>
                </PreviewCardTrigger>
                <PreviewCardPortal side="top">
                  <div style={{ padding: 'var(--Spacing-4)', minWidth: '160px' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned above
                    </p>
                  </div>
                </PreviewCardPortal>
              </PreviewCard>
              <span className={styles.showcaseLabel}>Top</span>
            </div>

            <div className={styles.showcaseItem}>
              <PreviewCard>
                <PreviewCardTrigger>
                  <span style={{
                    color: 'var(--Surface-Bold)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 'var(--Typography-Size-S)'
                  }}>
                    Bottom
                  </span>
                </PreviewCardTrigger>
                <PreviewCardPortal side="bottom">
                  <div style={{ padding: 'var(--Spacing-4)', minWidth: '160px' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned below
                    </p>
                  </div>
                </PreviewCardPortal>
              </PreviewCard>
              <span className={styles.showcaseLabel}>Bottom</span>
            </div>

            <div className={styles.showcaseItem}>
              <PreviewCard>
                <PreviewCardTrigger>
                  <span style={{
                    color: 'var(--Surface-Bold)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 'var(--Typography-Size-S)'
                  }}>
                    Left
                  </span>
                </PreviewCardTrigger>
                <PreviewCardPortal side="left">
                  <div style={{ padding: 'var(--Spacing-4)', minWidth: '160px' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned left
                    </p>
                  </div>
                </PreviewCardPortal>
              </PreviewCard>
              <span className={styles.showcaseLabel}>Left</span>
            </div>

            <div className={styles.showcaseItem}>
              <PreviewCard>
                <PreviewCardTrigger>
                  <span style={{
                    color: 'var(--Surface-Bold)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 'var(--Typography-Size-S)'
                  }}>
                    Right
                  </span>
                </PreviewCardTrigger>
                <PreviewCardPortal side="right">
                  <div style={{ padding: 'var(--Spacing-4)', minWidth: '160px' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned right
                    </p>
                  </div>
                </PreviewCardPortal>
              </PreviewCard>
              <span className={styles.showcaseLabel}>Right</span>
            </div>
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the PreviewCard component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { PreviewCard, PreviewCardTrigger, PreviewCardPortal } from '@oneui/ui';

// Basic usage
<PreviewCard>
  <PreviewCardTrigger>
    <span>Hover me</span>
  </PreviewCardTrigger>
  <PreviewCardPortal>
    <div>Preview content here</div>
  </PreviewCardPortal>
</PreviewCard>

// With positioning and arrow
<PreviewCard delay={300} closeDelay={200}>
  <PreviewCardTrigger>
    <a href="#">Link with preview</a>
  </PreviewCardTrigger>
  <PreviewCardPortal side="top" arrow>
    <div>
      <h3>Title</h3>
      <p>Description text</p>
    </div>
  </PreviewCardPortal>
</PreviewCard>

// Controlled
const [isOpen, setIsOpen] = useState(false);

<PreviewCard open={isOpen} onOpenChange={setIsOpen}>
  <PreviewCardTrigger>
    <span>Controlled trigger</span>
  </PreviewCardTrigger>
  <PreviewCardPortal side="bottom" align="start">
    <div>Content here</div>
  </PreviewCardPortal>
</PreviewCard>`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the PreviewCard components."
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
                <td><code>PreviewCard</code></td>
                <td><code>open</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Controlled open state</td>
              </tr>
              <tr>
                <td><code>PreviewCard</code></td>
                <td><code>defaultOpen</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Initial open state</td>
              </tr>
              <tr>
                <td><code>PreviewCard</code></td>
                <td><code>onOpenChange</code></td>
                <td><code>(open: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called when open state changes</td>
              </tr>
              <tr>
                <td><code>PreviewCard</code></td>
                <td><code>delay</code></td>
                <td><code>number</code></td>
                <td><code>200</code></td>
                <td>Delay before showing (ms)</td>
              </tr>
              <tr>
                <td><code>PreviewCard</code></td>
                <td><code>closeDelay</code></td>
                <td><code>number</code></td>
                <td><code>100</code></td>
                <td>Delay before hiding (ms)</td>
              </tr>
              <tr>
                <td><code>PreviewCardPortal</code></td>
                <td><code>side</code></td>
                <td><code>&apos;top&apos; | &apos;bottom&apos; | &apos;left&apos; | &apos;right&apos;</code></td>
                <td><code>&apos;bottom&apos;</code></td>
                <td>Which side to position on</td>
              </tr>
              <tr>
                <td><code>PreviewCardPortal</code></td>
                <td><code>align</code></td>
                <td><code>&apos;start&apos; | &apos;center&apos; | &apos;end&apos;</code></td>
                <td><code>&apos;center&apos;</code></td>
                <td>Alignment along the side</td>
              </tr>
              <tr>
                <td><code>PreviewCardPortal</code></td>
                <td><code>sideOffset</code></td>
                <td><code>number</code></td>
                <td><code>8</code></td>
                <td>Distance from anchor</td>
              </tr>
              <tr>
                <td><code>PreviewCardPortal</code></td>
                <td><code>arrow</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Show arrow pointing to trigger</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
