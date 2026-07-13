/**
 * components/select/page.tsx
 *
 * Select component showcase page
 * Displays sizes, states, and usage examples
 */

'use client';

import React from 'react';
import { Select } from '@oneui/ui/components/Select';
import type { SelectOption } from '@oneui/ui/components/Select';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function SelectPage() {
  const [country, setCountry] = React.useState('us');
  const [language, setLanguage] = React.useState('en');
  const [theme, setTheme] = React.useState('light');

  const countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
  ];

  const languageOptions: SelectOption[] = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
  ];

  const themeOptions: SelectOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];

  const sizeOptions: SelectOption[] = [
    { value: 'xs', label: 'Extra Small' },
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Select</h1>
        <p className={styles.description}>
          Dropdown select component for choosing from a list of options with search and keyboard navigation support.
        </p>
      </div>

      <div className={styles.content}>
        {/* Default */}
        <FoundationCard title="Default" description="Basic select with options.">
          <div className={styles.showcase}>
            <Select
              value={country}
              onChange={setCountry}
              options={countryOptions}
              placeholder="Select a country"
              aria-label="Country"
            />
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard title="Sizes" description="Three size presets for different UI contexts.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Small</span>
              <Select
                value="m"
                onChange={() => {}}
                options={sizeOptions}
                size="sm"
                aria-label="Small select"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Medium</span>
              <Select
                value="m"
                onChange={() => {}}
                options={sizeOptions}
                size="md"
                aria-label="Medium select"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Large</span>
              <Select
                value="m"
                onChange={() => {}}
                options={sizeOptions}
                size="lg"
                aria-label="Large select"
              />
            </div>
          </div>
        </FoundationCard>

        {/* States */}
        <FoundationCard title="States" description="Different select states.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Default</span>
              <Select
                value="en"
                onChange={() => {}}
                options={languageOptions}
                aria-label="Default select"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>With Placeholder</span>
              <Select
                value=""
                onChange={() => {}}
                options={languageOptions}
                placeholder="Choose a language"
                aria-label="Select with placeholder"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Disabled</span>
              <Select
                value="en"
                onChange={() => {}}
                options={languageOptions}
                disabled
                aria-label="Disabled select"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Multiple Options */}
        <FoundationCard title="Multiple Options" description="Select with various option counts.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Countries</span>
              <Select
                value={country}
                onChange={setCountry}
                options={countryOptions}
                aria-label="Select country"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Languages</span>
              <Select
                value={language}
                onChange={setLanguage}
                options={languageOptions}
                aria-label="Select language"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Theme</span>
              <Select
                value={theme}
                onChange={setTheme}
                options={themeOptions}
                aria-label="Select theme"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Interactive Example */}
        <FoundationCard title="Interactive" description="Try selecting different options.">
          <div className={styles.showcaseColumn}>
            <div>
              <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', marginBottom: 'var(--Spacing-3-5)' }}>
                Country: {countryOptions.find(o => o.value === country)?.label}
              </p>
              <Select
                value={country}
                onChange={setCountry}
                options={countryOptions}
                aria-label="Interactive country select"
              />
            </div>
            <div>
              <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', marginBottom: 'var(--Spacing-3-5)' }}>
                Language: {languageOptions.find(o => o.value === language)?.label}
              </p>
              <Select
                value={language}
                onChange={setLanguage}
                options={languageOptions}
                aria-label="Interactive language select"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="Select adapts when placed on different surface backgrounds."
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
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                  <Select
                    value="us"
                    onChange={() => {}}
                    options={countryOptions}
                    placeholder="Select a country"
                    aria-label={`Country on ${label}`}
                  />
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard title="Usage" description="Import and use the Select component." collapsible>
          <pre className={styles.codeBlock}>{`import { Select } from '@oneui/ui';
import type { SelectOption } from '@oneui/ui';

function MyForm() {
  const [value, setValue] = React.useState('us');

  const options: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
  ];

  return (
    <Select
      value={value}
      onChange={setValue}
      options={options}
      placeholder="Select a country"
      size="md"
      aria-label="Country"
    />
  );
}`}</pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard title="Props" description="Available props for Select component." collapsible>
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
                <td><code>value</code></td>
                <td><code>string | number</code></td>
                <td>-</td>
                <td>Currently selected value</td>
              </tr>
              <tr>
                <td><code>onChange</code></td>
                <td><code>(value: T) =&gt; void</code></td>
                <td>-</td>
                <td>Callback when value changes</td>
              </tr>
              <tr>
                <td><code>options</code></td>
                <td><code>SelectOption[]</code></td>
                <td>-</td>
                <td>Options to display</td>
              </tr>
              <tr>
                <td><code>placeholder</code></td>
                <td><code>string</code></td>
                <td><code>'Select...'</code></td>
                <td>Placeholder text when no value selected</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Whether the select is disabled</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>'sm' | 'md' | 'lg'</code></td>
                <td><code>'md'</code></td>
                <td>Size variant</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Additional class name for the trigger</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Accessible label</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>

        {/* SelectOption Type */}
        <FoundationCard title="SelectOption Type" description="Structure of option objects." collapsible>
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>value</code></td>
                <td><code>string | number</code></td>
                <td>Yes</td>
                <td>Unique value for this option</td>
              </tr>
              <tr>
                <td><code>label</code></td>
                <td><code>string</code></td>
                <td>Yes</td>
                <td>Display text for this option</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td>No</td>
                <td>Whether this option is disabled</td>
              </tr>
              <tr>
                <td><code>color</code></td>
                <td><code>string</code></td>
                <td>No</td>
                <td>Optional color for color swatch display</td>
              </tr>
              <tr>
                <td><code>icon</code></td>
                <td><code>ReactNode</code></td>
                <td>No</td>
                <td>Optional icon to display before the label</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
