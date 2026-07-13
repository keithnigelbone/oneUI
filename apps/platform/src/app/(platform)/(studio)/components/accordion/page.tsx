/**
 * components/accordion/page.tsx
 *
 * Accordion component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Accordion } from '@oneui/ui/components/Accordion';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function AccordionPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Accordion</h1>
        <p className={styles.description}>
          A vertically stacked set of interactive headings that reveal or hide associated sections of content.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Single Expand" description="Only one item can be expanded at a time.">
          <div className={styles.showcase}>
            <Accordion defaultValue={['item-1']} style={{ width: '100%', maxWidth: '600px' }}>
              <Accordion.Item value="item-1">
                <Accordion.Trigger>What is One UI Studio?</Accordion.Trigger>
                <Accordion.Panel>
                  One UI Studio is a multi-brand design system platform built for Jio, supporting 7+ brands, 2 platforms, and 1.4B users across 22 languages.
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="item-2">
                <Accordion.Trigger>What are design tokens?</Accordion.Trigger>
                <Accordion.Panel>
                  Design tokens are the atomic values that define a design system's visual properties like colors, spacing, typography, and more. They ensure consistency across platforms.
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="item-3">
                <Accordion.Trigger>How do I customize components?</Accordion.Trigger>
                <Accordion.Panel>
                  Components can be customized using design tokens. Every component uses token-only styling with no hard-coded values, allowing full customization per brand.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        </FoundationCard>

        <FoundationCard title="Multiple Expand" description="Multiple items can be expanded simultaneously.">
          <div className={styles.showcase}>
            <Accordion openMultiple defaultValue={['faq-1', 'faq-2']} style={{ width: '100%', maxWidth: '600px' }}>
              <Accordion.Item value="faq-1">
                <Accordion.Trigger>Supported Platforms</Accordion.Trigger>
                <Accordion.Panel>
                  One UI Studio supports both React (web) and React Native (mobile) platforms with consistent APIs and shared design tokens.
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="faq-2">
                <Accordion.Trigger>Accessibility</Accordion.Trigger>
                <Accordion.Panel>
                  All components meet WCAG AA standards with proper keyboard navigation, ARIA attributes, and focus management.
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="faq-3">
                <Accordion.Trigger>Documentation</Accordion.Trigger>
                <Accordion.Panel>
                  Comprehensive documentation is available in Storybook 8, including all component variants, props, and usage examples.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        </FoundationCard>

        <FoundationCard title="Disabled Item" description="Individual items can be disabled.">
          <div className={styles.showcase}>
            <Accordion defaultValue={['opt-1']} style={{ width: '100%', maxWidth: '600px' }}>
              <Accordion.Item value="opt-1">
                <Accordion.Trigger>Available Option</Accordion.Trigger>
                <Accordion.Panel>
                  This item is interactive and can be expanded or collapsed.
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="opt-2" disabled>
                <Accordion.Trigger>Disabled Option</Accordion.Trigger>
                <Accordion.Panel>
                  This content cannot be accessed when the item is disabled.
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="opt-3">
                <Accordion.Trigger>Another Available Option</Accordion.Trigger>
                <Accordion.Panel>
                  This item is also interactive and available for use.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard title="Surface Context" description="Accordion adapts when placed on different surface backgrounds.">
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
                  width: '100%',
                }}
              >
                <span style={{ color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3)', fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                  {label}
                </span>
                <Accordion defaultValue={['item-1']} style={{ width: '100%' }}>
                  <Accordion.Item value="item-1">
                    <Accordion.Trigger>Expanded item</Accordion.Trigger>
                    <Accordion.Panel>Content adapts to the surface background.</Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item value="item-2">
                    <Accordion.Trigger>Collapsed item</Accordion.Trigger>
                    <Accordion.Panel>Hidden content.</Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the Accordion component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Accordion } from '@oneui/ui';

// Single expand (default)
<Accordion defaultValue={['item-1']}>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Question 1</Accordion.Trigger>
    <Accordion.Panel>Answer 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <Accordion.Trigger>Question 2</Accordion.Trigger>
    <Accordion.Panel>Answer 2</Accordion.Panel>
  </Accordion.Item>
</Accordion>

// Multiple expand
<Accordion openMultiple defaultValue={['item-1', 'item-2']}>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Section 1</Accordion.Trigger>
    <Accordion.Panel>Content 1</Accordion.Panel>
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <Accordion.Trigger>Section 2</Accordion.Trigger>
    <Accordion.Panel>Content 2</Accordion.Panel>
  </Accordion.Item>
</Accordion>

// Disabled item
<Accordion>
  <Accordion.Item value="item-1" disabled>
    <Accordion.Trigger>Disabled</Accordion.Trigger>
    <Accordion.Panel>Not accessible</Accordion.Panel>
  </Accordion.Item>
</Accordion>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the Accordion component." collapsible>
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
                <td>Accordion items (required)</td>
              </tr>
              <tr>
                <td><code>value</code></td>
                <td><code>string[]</code></td>
                <td>-</td>
                <td>Controlled open items</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>string[]</code></td>
                <td>-</td>
                <td>Default open items</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: string[]) =&gt; void</code></td>
                <td>-</td>
                <td>Called when open items change</td>
              </tr>
              <tr>
                <td><code>openMultiple</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Allow multiple items open</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable entire accordion</td>
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
