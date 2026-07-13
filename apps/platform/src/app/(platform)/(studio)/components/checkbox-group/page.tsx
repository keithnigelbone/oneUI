/**
 * components/checkbox-group/page.tsx
 *
 * CheckboxGroup component showcase page
 * Displays group behavior, orientation, and usage examples
 */

'use client';

import React from 'react';
import { CheckboxGroup } from '@oneui/ui/components/CheckboxGroup';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function CheckboxGroupPage() {
  const [selectedFeatures, setSelectedFeatures] = React.useState<string[]>(['notifications']);
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>CheckboxGroup</h1>
        <p className={styles.description}>
          Container component for managing multiple related checkboxes as a group with shared state.
        </p>
      </div>

      <div className={styles.content}>
        {/* Default Group */}
        <FoundationCard title="Default Group" description="Basic checkbox group with vertical layout.">
          <div className={styles.showcase}>
            <CheckboxGroup
              value={selectedFeatures}
              onValueChange={setSelectedFeatures}
            >
              <Checkbox value="notifications" label="Email notifications" />
              <Checkbox value="updates" label="Product updates" />
              <Checkbox value="newsletter" label="Weekly newsletter" />
              <Checkbox value="promotions" label="Promotional offers" />
            </CheckboxGroup>
          </div>
        </FoundationCard>

        {/* Interactive Example */}
        <FoundationCard title="Interactive Group" description="Try selecting multiple options.">
          <div className={styles.showcaseColumn}>
            <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', margin: 0 }}>
              Selected: {selectedInterests.length > 0 ? selectedInterests.join(', ') : 'None'}
            </p>
            <CheckboxGroup
              value={selectedInterests}
              onValueChange={setSelectedInterests}
            >
              <Checkbox value="technology" label="Technology" />
              <Checkbox value="design" label="Design" />
              <Checkbox value="business" label="Business" />
              <Checkbox value="science" label="Science" />
              <Checkbox value="arts" label="Arts & Culture" />
            </CheckboxGroup>
          </div>
        </FoundationCard>

        {/* Disabled Group */}
        <FoundationCard title="Disabled Group" description="Entire group can be disabled.">
          <div className={styles.showcase}>
            <CheckboxGroup disabled defaultValue={['option1', 'option3']}>
              <Checkbox value="option1" label="Option 1 (pre-selected)" />
              <Checkbox value="option2" label="Option 2" />
              <Checkbox value="option3" label="Option 3 (pre-selected)" />
              <Checkbox value="option4" label="Option 4" />
            </CheckboxGroup>
          </div>
        </FoundationCard>

        {/* With Sizes */}
        <FoundationCard title="Different Sizes" description="Checkboxes within group can have different sizes.">
          <div className={styles.showcase}>
            <CheckboxGroup>
              <Checkbox value="small" size="small" label="Small checkbox" />
              <Checkbox value="medium" size="medium" label="Medium checkbox" />
              <Checkbox value="large" size="large" label="Large checkbox" />
            </CheckboxGroup>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard title="Surface Context" description="CheckboxGroup adapts when placed on different surface backgrounds.">
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
                <span style={{ color: 'var(--Text-High)', minWidth: '100px', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                  {label}
                </span>
                <CheckboxGroup defaultValue={['a']}>
                  <Checkbox value="a" label="Option A" />
                  <Checkbox value="b" label="Option B" />
                </CheckboxGroup>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard title="Usage" description="Import and use the CheckboxGroup component." collapsible>
          <pre className={styles.codeBlock}>{`import { CheckboxGroup, Checkbox } from '@oneui/ui';

function PreferencesForm() {
  const [selected, setSelected] = React.useState<string[]>(['notifications']);

  return (
    <CheckboxGroup
      value={selected}
      onValueChange={setSelected}
    >
      <Checkbox value="notifications" label="Email notifications" />
      <Checkbox value="updates" label="Product updates" />
      <Checkbox value="newsletter" label="Weekly newsletter" />
    </CheckboxGroup>
  );
}`}</pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard title="Props" description="Available props for CheckboxGroup component." collapsible>
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
                <td>Checkbox items (required)</td>
              </tr>
              <tr>
                <td><code>value</code></td>
                <td><code>string[]</code></td>
                <td>-</td>
                <td>Selected values (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>string[]</code></td>
                <td>-</td>
                <td>Default values (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: string[]) =&gt; void</code></td>
                <td>-</td>
                <td>Called when values change</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Whether the group is disabled</td>
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
