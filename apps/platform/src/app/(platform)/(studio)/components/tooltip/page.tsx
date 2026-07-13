/**
 * components/tooltip/page.tsx
 *
 * Tooltip component showcase page
 * Displays variants, positions, states, and usage examples
 */

'use client';

import React from 'react';
import { Tooltip, TooltipProvider } from '@oneui/ui/components/Tooltip';
import { Button } from '@oneui/ui/components/Button';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function TooltipPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tooltip</h1>
        <p className={styles.description}>
          A popup that displays additional information when hovering or focusing an element.
          Supports positioning, delay configuration, and arrow display. WCAG AA accessible
          with keyboard support (focus to show, Escape to dismiss).
        </p>
      </div>
      <div className={styles.content}>
        <TooltipProvider>
          <FoundationCard title="Default" description="Basic tooltip with default positioning (top).">
            <div className={styles.showcase}>
              <Tooltip content="This is a tooltip">
                <Button>Hover me</Button>
              </Tooltip>
            </div>
          </FoundationCard>

          <FoundationCard title="Positioning" description="Tooltip can be placed on any side of the trigger.">
            <div className={styles.showcase}>
              <Tooltip content="Top tooltip" side="top">
                <Button attention="low">Top</Button>
              </Tooltip>
              <Tooltip content="Bottom tooltip" side="bottom">
                <Button attention="low">Bottom</Button>
              </Tooltip>
              <Tooltip content="Left tooltip" side="left">
                <Button attention="low">Left</Button>
              </Tooltip>
              <Tooltip content="Right tooltip" side="right">
                <Button attention="low">Right</Button>
              </Tooltip>
            </div>
          </FoundationCard>

          <FoundationCard title="Alignment" description="Control alignment along the side axis.">
            <div className={styles.showcase}>
              <Tooltip content="Aligned to start" side="bottom" align="start">
                <Button attention="low">Start</Button>
              </Tooltip>
              <Tooltip content="Aligned to center" side="bottom" align="center">
                <Button attention="low">Center</Button>
              </Tooltip>
              <Tooltip content="Aligned to end" side="bottom" align="end">
                <Button attention="low">End</Button>
              </Tooltip>
            </div>
          </FoundationCard>

          <FoundationCard title="Without Arrow" description="Tooltip without the arrow indicator.">
            <div className={styles.showcase}>
              <Tooltip content="No arrow tooltip" arrow={false}>
                <Button attention="low">No Arrow</Button>
              </Tooltip>
              <Tooltip content="With arrow tooltip" arrow>
                <Button attention="low">With Arrow</Button>
              </Tooltip>
            </div>
          </FoundationCard>

          <FoundationCard title="States" description="Disabled state prevents the tooltip from showing.">
            <div className={styles.showcase}>
              <Tooltip content="This tooltip is active">
                <Button>Enabled</Button>
              </Tooltip>
              <Tooltip content="This will not show" disabled>
                <Button attention="low">Disabled Tooltip</Button>
              </Tooltip>
            </div>
          </FoundationCard>
        </TooltipProvider>

        <FoundationCard title="Usage" description="Import and use the Tooltip component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Tooltip, TooltipProvider, Button } from '@oneui/ui';

// Wrap your app or section with TooltipProvider
<TooltipProvider>
  {/* Basic tooltip */}
  <Tooltip content="Tooltip text">
    <Button>Hover me</Button>
  </Tooltip>

  {/* Positioned tooltip */}
  <Tooltip content="Bottom tooltip" side="bottom" align="start">
    <Button>Bottom Start</Button>
  </Tooltip>

  {/* Without arrow */}
  <Tooltip content="No arrow" arrow={false}>
    <Button>No Arrow</Button>
  </Tooltip>

  {/* With delay */}
  <Tooltip content="Delayed tooltip" delay={500} closeDelay={200}>
    <Button>Delayed</Button>
  </Tooltip>
</TooltipProvider>

// Controlled
const [open, setOpen] = useState(false);

<Tooltip content="Controlled" open={open} onOpenChange={setOpen}>
  <Button>Controlled</Button>
</Tooltip>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for Tooltip and TooltipProvider." collapsible>
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
                <td rowSpan={11}><code>Tooltip</code></td>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>Required</td>
                <td>Trigger element</td>
              </tr>
              <tr>
                <td><code>content</code></td>
                <td><code>ReactNode</code></td>
                <td>Required</td>
                <td>Tooltip content</td>
              </tr>
              <tr>
                <td><code>side</code></td>
                <td><code>&apos;top&apos; | &apos;bottom&apos; | &apos;left&apos; | &apos;right&apos;</code></td>
                <td><code>&apos;top&apos;</code></td>
                <td>Positioning side</td>
              </tr>
              <tr>
                <td><code>align</code></td>
                <td><code>&apos;start&apos; | &apos;center&apos; | &apos;end&apos;</code></td>
                <td><code>&apos;center&apos;</code></td>
                <td>Alignment along side axis</td>
              </tr>
              <tr>
                <td><code>sideOffset</code></td>
                <td><code>number</code></td>
                <td><code>8</code></td>
                <td>Distance from anchor (px)</td>
              </tr>
              <tr>
                <td><code>open</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Controlled open state</td>
              </tr>
              <tr>
                <td><code>onOpenChange</code></td>
                <td><code>(open: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called on open/close</td>
              </tr>
              <tr>
                <td><code>delay</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Show delay (ms)</td>
              </tr>
              <tr>
                <td><code>closeDelay</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Hide delay (ms)</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Disables the tooltip</td>
              </tr>
              <tr>
                <td><code>arrow</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Show arrow indicator</td>
              </tr>
              <tr>
                <td rowSpan={3}><code>TooltipProvider</code></td>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>Required</td>
                <td>Content wrapped by provider</td>
              </tr>
              <tr>
                <td><code>delay</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Shared show delay for all tooltips</td>
              </tr>
              <tr>
                <td><code>closeDelay</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Shared hide delay for all tooltips</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
