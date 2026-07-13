/**
 * components/fieldset/page.tsx
 *
 * Fieldset component showcase page
 * Displays variants, sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Fieldset } from '@oneui/ui/components/Fieldset';
import { Input } from '@oneui/ui/components/Input';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function FieldsetPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Fieldset</h1>
        <p className={styles.description}>
          A fieldset component that groups related form elements with an optional legend.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Basic Fieldset" description="Fieldset with legend and form elements.">
          <div className={styles.showcase}>
            <Fieldset legend="Contact Information" style={{ width: '100%', maxWidth: '400px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--Spacing-4)',
                padding: 'var(--Spacing-4)'
              }}>
                <Input type="text" placeholder="Full Name" />
                <Input type="email" placeholder="Email Address" />
                <Input type="tel" placeholder="Phone Number" />
              </div>
            </Fieldset>
          </div>
        </FoundationCard>

        <FoundationCard title="With Checkboxes" description="Fieldset grouping related checkboxes.">
          <div className={styles.showcase}>
            <Fieldset legend="Notification Preferences" style={{ width: '100%', maxWidth: '400px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--Spacing-3-5)',
                padding: 'var(--Spacing-4)'
              }}>
                <Checkbox defaultChecked label="Email notifications" />
                <Checkbox label="SMS notifications" />
                <Checkbox defaultChecked label="Push notifications" />
              </div>
            </Fieldset>
          </div>
        </FoundationCard>

        <FoundationCard title="With Radio Group" description="Fieldset with radio button group.">
          <div className={styles.showcase}>
            <Fieldset legend="Shipping Method" style={{ width: '100%', maxWidth: '400px' }}>
              <div style={{ padding: 'var(--Spacing-4)' }}>
                <RadioGroup defaultValue="standard">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)', cursor: 'pointer' }}>
                      <Radio value="standard" />
                      <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-High)' }}>
                        Standard (5-7 days)
                      </span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)', cursor: 'pointer' }}>
                      <Radio value="express" />
                      <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-High)' }}>
                        Express (2-3 days)
                      </span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)', cursor: 'pointer' }}>
                      <Radio value="overnight" />
                      <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-High)' }}>
                        Overnight (1 day)
                      </span>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </Fieldset>
          </div>
        </FoundationCard>

        <FoundationCard title="Disabled Fieldset" description="Disabled fieldset affects all child elements.">
          <div className={styles.showcase}>
            <Fieldset legend="Unavailable Options" disabled style={{ width: '100%', maxWidth: '400px' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--Spacing-4)',
                padding: 'var(--Spacing-4)'
              }}>
                <Input type="text" placeholder="Disabled Input" disabled />
                <Checkbox disabled label="Disabled Checkbox" />
              </div>
            </Fieldset>
          </div>
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the Fieldset component." collapsible>
          <pre className={styles.codeBlock}>
{`import { Fieldset, Input, Checkbox, Radio, RadioGroup } from '@oneui/ui';

// Basic fieldset
<Fieldset legend="Contact Information">
  <Input type="text" placeholder="Full Name" />
  <Input type="email" placeholder="Email" />
</Fieldset>

// With checkboxes
<Fieldset legend="Preferences">
  <Checkbox defaultChecked label="Email notifications" />
  <Checkbox label="SMS notifications" />
</Fieldset>

// With radio group
<Fieldset legend="Shipping Method">
  <RadioGroup defaultValue="standard">
    <label>
      <Radio value="standard" />
      Standard
    </label>
    <label>
      <Radio value="express" />
      Express
    </label>
  </RadioGroup>
</Fieldset>

// Disabled fieldset
<Fieldset legend="Unavailable" disabled>
  <Input type="text" disabled />
</Fieldset>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for the Fieldset component." collapsible>
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
                <td>Fieldset content (required)</td>
              </tr>
              <tr>
                <td><code>legend</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Legend text</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable all child elements</td>
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
