/**
 * components/collapsible/page.tsx
 *
 * Collapsible component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Collapsible } from '@oneui/ui/components/Collapsible';
import { Button } from '@oneui/ui/components/Button';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function CollapsiblePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Collapsible</h1>
        <p className={styles.description}>
          An interactive component that expands and collapses a panel of content.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Default" description="Basic collapsible with default closed state.">
          <div className={styles.showcase}>
            <Collapsible style={{ width: '100%', maxWidth: '600px' }}>
              <Collapsible.Trigger>
                <Button attention="medium" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  Show Details
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Panel>
                <div style={{
                  padding: 'var(--Spacing-4)',
                  backgroundColor: 'var(--Surface-Subtle)',
                  borderRadius: 'var(--Shape-4)',
                  marginTop: 'var(--Spacing-3-5)',
                  color: 'var(--Text-High)'
                }}>
                  This content is hidden by default and revealed when the trigger is clicked.
                  Collapsible components are perfect for showing additional information on demand.
                </div>
              </Collapsible.Panel>
            </Collapsible>
          </div>
        </FoundationCard>

        <FoundationCard title="Initially Open" description="Collapsible starting in expanded state.">
          <div className={styles.showcase}>
            <Collapsible defaultOpen style={{ width: '100%', maxWidth: '600px' }}>
              <Collapsible.Trigger>
                <Button attention="medium" style={{ width: '100%', justifyContent: 'flex-start' }}>
                  Hide Details
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Panel>
                <div style={{
                  padding: 'var(--Spacing-4)',
                  backgroundColor: 'var(--Surface-Subtle)',
                  borderRadius: 'var(--Shape-4)',
                  marginTop: 'var(--Spacing-3-5)',
                  color: 'var(--Text-High)'
                }}>
                  This collapsible starts in an expanded state by using the defaultOpen prop.
                  Users can still collapse it by clicking the trigger button.
                </div>
              </Collapsible.Panel>
            </Collapsible>
          </div>
        </FoundationCard>

        <FoundationCard title="Disabled" description="Collapsible in disabled state.">
          <div className={styles.showcase}>
            <Collapsible disabled style={{ width: '100%', maxWidth: '600px' }}>
              <Collapsible.Trigger>
                <Button attention="medium" disabled style={{ width: '100%', justifyContent: 'flex-start' }}>
                  Disabled Trigger
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Panel>
                <div style={{
                  padding: 'var(--Spacing-4)',
                  backgroundColor: 'var(--Surface-Subtle)',
                  borderRadius: 'var(--Shape-4)',
                  marginTop: 'var(--Spacing-3-5)',
                  color: 'var(--Text-High)'
                }}>
                  This content cannot be accessed when the collapsible is disabled.
                </div>
              </Collapsible.Panel>
            </Collapsible>
          </div>
        </FoundationCard>

        <FoundationCard title="Custom Trigger" description="Collapsible with custom styled trigger.">
          <div className={styles.showcase}>
            <Collapsible style={{ width: '100%', maxWidth: '600px' }}>
              <Collapsible.Trigger>
                <div style={{
                  padding: 'var(--Spacing-4)',
                  backgroundColor: 'var(--Surface-Bold)',
                  color: 'var(--Text-OnBold-High)',
                  borderRadius: 'var(--Shape-4)',
                  cursor: 'pointer',
                  fontWeight: 'var(--Typography-Weight-Medium)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--Spacing-3-5)'
                }}>
                  <span>Advanced Options</span>
                </div>
              </Collapsible.Trigger>
              <Collapsible.Panel>
                <div style={{
                  padding: 'var(--Spacing-4)',
                  backgroundColor: 'var(--Surface-Subtle)',
                  borderRadius: 'var(--Shape-4)',
                  marginTop: 'var(--Spacing-3-5)',
                  color: 'var(--Text-High)'
                }}>
                  The trigger can be any clickable element, not just a button. This example uses a custom styled div.
                </div>
              </Collapsible.Panel>
            </Collapsible>
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the Collapsible component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Collapsible, Button } from '@oneui/ui';

// Basic usage
<Collapsible>
  <Collapsible.Trigger>
    <Button attention="medium">Show Details</Button>
  </Collapsible.Trigger>
  <Collapsible.Panel>
    <div>Your collapsible content here</div>
  </Collapsible.Panel>
</Collapsible>

// Initially open
<Collapsible defaultOpen>
  <Collapsible.Trigger>
    <Button attention="medium">Hide Details</Button>
  </Collapsible.Trigger>
  <Collapsible.Panel>
    <div>Content visible by default</div>
  </Collapsible.Panel>
</Collapsible>

// Disabled
<Collapsible disabled>
  <Collapsible.Trigger>
    <Button disabled>Disabled</Button>
  </Collapsible.Trigger>
  <Collapsible.Panel>
    <div>Not accessible</div>
  </Collapsible.Panel>
</Collapsible>

// Controlled
const [open, setOpen] = React.useState(false);
<Collapsible open={open} onOpenChange={setOpen}>
  <Collapsible.Trigger>
    <Button>{open ? 'Hide' : 'Show'}</Button>
  </Collapsible.Trigger>
  <Collapsible.Panel>
    <div>Controlled content</div>
  </Collapsible.Panel>
</Collapsible>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the Collapsible component." collapsible>
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
                <td>Trigger and Panel (required)</td>
              </tr>
              <tr>
                <td><code>open</code></td>
                <td><code>boolean</code></td>
                <td>-</td>
                <td>Controlled open state</td>
              </tr>
              <tr>
                <td><code>defaultOpen</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Default open state</td>
              </tr>
              <tr>
                <td><code>onOpenChange</code></td>
                <td><code>(open: boolean) =&gt; void</code></td>
                <td>-</td>
                <td>Called when open state changes</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable interaction</td>
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
