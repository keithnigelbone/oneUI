/**
 * components/popover/page.tsx
 *
 * Popover component showcase page
 * Displays variants, positioning, and usage examples
 */

'use client';

import React, { useState } from 'react';
import { Popover, PopoverTrigger, PopoverPortal, PopoverClose } from '@oneui/ui/components/Popover';
import { Button } from '@oneui/ui/components/Button';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function PopoverPage() {
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen4, setIsOpen4] = useState(false);
  const [isOpen5, setIsOpen5] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Popover</h1>
        <p className={styles.description}>
          A floating overlay that displays rich content anchored to a trigger element. Useful for tooltips, menus, and contextual information.
        </p>
      </div>
      <div className={styles.content}>
        {/* Basic Popover */}
        <FoundationCard
          title="Basic Popover"
          description="Click the button to show the popover."
        >
          <div className={styles.showcase}>
            <Popover open={isOpen1} onOpenChange={setIsOpen1}>
              <PopoverTrigger>
                <Button>Open Popover</Button>
              </PopoverTrigger>
              <PopoverPortal title="Welcome" description="This is a basic popover with a title and description.">
                <div style={{ padding: 'var(--Spacing-4)' }}>
                  <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                    Popovers can contain any content you need.
                  </p>
                </div>
              </PopoverPortal>
            </Popover>
          </div>
        </FoundationCard>

        {/* Positioning */}
        <FoundationCard
          title="Positioning"
          description="Control which side the popover appears on."
        >
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <Popover open={isOpen2} onOpenChange={setIsOpen2}>
                <PopoverTrigger>
                  <Button attention="medium">Top</Button>
                </PopoverTrigger>
                <PopoverPortal side="top" title="Top Side">
                  <div style={{ padding: 'var(--Spacing-4)' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned above the trigger
                    </p>
                  </div>
                </PopoverPortal>
              </Popover>
              <span className={styles.showcaseLabel}>Top</span>
            </div>

            <div className={styles.showcaseItem}>
              <Popover open={isOpen3} onOpenChange={setIsOpen3}>
                <PopoverTrigger>
                  <Button attention="medium">Bottom</Button>
                </PopoverTrigger>
                <PopoverPortal side="bottom" title="Bottom Side">
                  <div style={{ padding: 'var(--Spacing-4)' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned below the trigger
                    </p>
                  </div>
                </PopoverPortal>
              </Popover>
              <span className={styles.showcaseLabel}>Bottom</span>
            </div>

            <div className={styles.showcaseItem}>
              <Popover open={isOpen4} onOpenChange={setIsOpen4}>
                <PopoverTrigger>
                  <Button attention="medium">Left</Button>
                </PopoverTrigger>
                <PopoverPortal side="left" title="Left Side">
                  <div style={{ padding: 'var(--Spacing-4)' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned to the left
                    </p>
                  </div>
                </PopoverPortal>
              </Popover>
              <span className={styles.showcaseLabel}>Left</span>
            </div>

            <div className={styles.showcaseItem}>
              <Popover open={isOpen5} onOpenChange={setIsOpen5}>
                <PopoverTrigger>
                  <Button attention="medium">Right</Button>
                </PopoverTrigger>
                <PopoverPortal side="right" title="Right Side">
                  <div style={{ padding: 'var(--Spacing-4)' }}>
                    <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                      Positioned to the right
                    </p>
                  </div>
                </PopoverPortal>
              </Popover>
              <span className={styles.showcaseLabel}>Right</span>
            </div>
          </div>
        </FoundationCard>

        {/* With Close Button */}
        <FoundationCard
          title="With Close Button"
          description="Add a close button inside the popover content."
        >
          <div className={styles.showcase}>
            <Popover>
              <PopoverTrigger>
                <Button attention="low">Open with Close</Button>
              </PopoverTrigger>
              <PopoverPortal title="Closeable Popover" description="This popover has a close button.">
                <div style={{ padding: 'var(--Spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
                  <p style={{ margin: 0, color: 'var(--Text-High)', fontSize: 'var(--Typography-Size-S)' }}>
                    Click the close button to dismiss this popover.
                  </p>
                  <PopoverClose>
                    <Button size="small">Close</Button>
                  </PopoverClose>
                </div>
              </PopoverPortal>
            </Popover>
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import and use the Popover component."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { Popover, PopoverTrigger, PopoverPortal, PopoverClose, Button } from '@oneui/ui';

// Basic usage
<Popover>
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverPortal title="Title" description="Description">
    <div>Content here</div>
  </PopoverPortal>
</Popover>

// Controlled
const [isOpen, setIsOpen] = useState(false);

<Popover open={isOpen} onOpenChange={setIsOpen}>
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverPortal side="top" arrow>
    <div>Content here</div>
  </PopoverPortal>
</Popover>

// With close button
<Popover>
  <PopoverTrigger>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverPortal>
    <div>
      <p>Content</p>
      <PopoverClose>
        <Button>Close</Button>
      </PopoverClose>
    </div>
  </PopoverPortal>
</Popover>`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for the Popover components."
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
                <td><code>Popover</code></td>
                <td><code>open</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Controlled open state</td>
              </tr>
              <tr>
                <td><code>Popover</code></td>
                <td><code>defaultOpen</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Initial open state</td>
              </tr>
              <tr>
                <td><code>Popover</code></td>
                <td><code>onOpenChange</code></td>
                <td><code>(open: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called when open state changes</td>
              </tr>
              <tr>
                <td><code>Popover</code></td>
                <td><code>dismissible</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Whether clicking outside closes</td>
              </tr>
              <tr>
                <td><code>PopoverPortal</code></td>
                <td><code>side</code></td>
                <td><code>&apos;top&apos; | &apos;bottom&apos; | &apos;left&apos; | &apos;right&apos;</code></td>
                <td><code>&apos;bottom&apos;</code></td>
                <td>Which side to position on</td>
              </tr>
              <tr>
                <td><code>PopoverPortal</code></td>
                <td><code>align</code></td>
                <td><code>&apos;start&apos; | &apos;center&apos; | &apos;end&apos;</code></td>
                <td><code>&apos;center&apos;</code></td>
                <td>Alignment along the side</td>
              </tr>
              <tr>
                <td><code>PopoverPortal</code></td>
                <td><code>sideOffset</code></td>
                <td><code>number</code></td>
                <td><code>8</code></td>
                <td>Distance from anchor</td>
              </tr>
              <tr>
                <td><code>PopoverPortal</code></td>
                <td><code>title</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Popover title</td>
              </tr>
              <tr>
                <td><code>PopoverPortal</code></td>
                <td><code>description</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Popover description</td>
              </tr>
              <tr>
                <td><code>PopoverPortal</code></td>
                <td><code>arrow</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Show arrow pointing to anchor</td>
              </tr>
              <tr>
                <td><code>PopoverPortal</code></td>
                <td><code>backdrop</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Show backdrop overlay</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
