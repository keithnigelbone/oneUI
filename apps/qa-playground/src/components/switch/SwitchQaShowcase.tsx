'use client';

import { useState, type CSSProperties } from 'react';
import { Switch } from '@oneui/ui/components/Switch';
import { Surface } from '@oneui/ui/components/Surface';
import { QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Switch QA — **same outer mount as Checkbox** (`QaShowcaseRoot`).
 * Section bands: {@link ../shared/QaShowcaseLayout#QaStoryBand} for Figma API coverage.
 */

/** Figma `appearance` values (variable modes) — order matches attached spec. */
const FIGMA_APPEARANCE_ROLES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

/** Surface roles that exercise unchecked-track inheritance (excludes `auto`/`brand-bg`). */
const SURFACE_INHERITANCE_ROLES = [
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const;

const flowRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-4)',
  alignItems: 'center',
  justifyContent: 'center',
};

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3-5)',
  width: '100%',
};

const cellLabel: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Medium)',
};

const rowLabel: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  /** WCAG AA: `Text-Low` on sandbox bg was ~4.39:1 for this size; use medium emphasis for row headers. */
  color: 'var(--Text-Medium)',
  margin: 0,
  minWidth: 'var(--Spacing-28)',
};

const noteStyle: CSSProperties = {
  ...cellLabel,
  maxWidth: 'var(--Spacing-40)',
  marginBlockEnd: 'var(--Spacing-3)',
};

function ApiSectionBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.apiSectionBody}>{children}</div>;
}

export function SwitchQaShowcase() {
  const [selected, setSelected] = useState(false);

  return (
    <QaShowcaseRoot>
      <QaStoryBand id="switch-figma-default" title="Default (Switch.stories Default)">
        <ApiSectionBody>
          {/* Figma table has no separate “children” row — label is content in designs. */}
          <Switch data-testid="sw-figma-default">
            Enable notifications
          </Switch>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="switch-figma-size-selected" title="size × selected (Figma S/M/L ↔ s/m/l, selected)">
        <ApiSectionBody>
          <p style={noteStyle}>
            ⚠️ Figma size tokens S[4]/M[5]/L[6] map to code <code>size=&quot;s|m|l&quot;</code> — not numeric steps in JSX.
          </p>
          <div style={stack}>
            {(['s', 'm', 'l'] as const).map((size) => (
              <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', flexWrap: 'wrap' }}>
                <span style={rowLabel}>{size.toUpperCase()}</span>
                <div style={flowRow}>
                  <Switch size={size} checked={false} data-testid={`sw-figma-size-${size}-selected-false`}>
                    selected false
                  </Switch>
                  <Switch size={size} checked data-testid={`sw-figma-size-${size}-selected-true`}>
                    selected true
                  </Switch>
                </div>
              </div>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="switch-figma-appearance" title="appearance (Figma variable modes)">
        <ApiSectionBody>
          <p style={noteStyle}>
            ⚠️ <code>brand-bg</code> is implemented in code / Storybook but is <strong>not</strong> on the attached
            Figma API list — shown once below for parity with Switch.stories.tsx in packages/ui.
          </p>
          <div style={stack}>
            {FIGMA_APPEARANCE_ROLES.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={{ ...rowLabel, minWidth: 'var(--Spacing-24)' }}>{appearance}</span>
                <Switch
                  appearance={appearance}
                  data-testid={`sw-figma-appearance-${appearance}-off`}
                  aria-label={`Appearance ${appearance}, not selected`}
                />
                <Switch
                  appearance={appearance}
                  checked
                  data-testid={`sw-figma-appearance-${appearance}-on`}
                  aria-label={`Appearance ${appearance}, selected`}
                />
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
              <span style={{ ...rowLabel, minWidth: 'var(--Spacing-24)' }}>brand-bg ⚠️</span>
              <Switch
                appearance="brand-bg"
                data-testid="sw-figma-appearance-brand-bg-off"
                aria-label="Appearance brand-bg, not selected"
              />
              <Switch
                appearance="brand-bg"
                checked
                data-testid="sw-figma-appearance-brand-bg-on"
                aria-label="Appearance brand-bg, selected"
              />
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand
        id="switch-surface-inheritance"
        title="unchecked track inherits parent Surface appearance"
      >
        <ApiSectionBody>
          <p style={noteStyle}>
            The unchecked track ignores the Switch&apos;s own <code>appearance</code> prop and
            resolves from the nearest ancestor <code>&lt;Surface&gt;</code> (then{' '}
            <code>neutral</code>). Each row below wraps the switches in{' '}
            <code>&lt;Surface appearance=&quot;…&quot;&gt;</code> so the off-state track tints to the
            surface role instead of falling back to neutral.
          </p>
          <div style={stack}>
            {SURFACE_INHERITANCE_ROLES.map((appearance) => (
              <Surface
                key={appearance}
                appearance={appearance}
                mode="subtle"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--Spacing-5)',
                  flexWrap: 'wrap',
                  padding: 'var(--Spacing-4)',
                  borderRadius: 'var(--Shape-3)',
                }}
              >
                <span style={{ ...rowLabel, minWidth: 'var(--Spacing-24)' }}>{appearance}</span>
                <Switch
                  checked={false}
                  data-testid={`sw-surface-${appearance}-off`}
                  aria-label={`Inside ${appearance} surface, not selected`}
                />
                <Switch
                  checked
                  data-testid={`sw-surface-${appearance}-on`}
                  aria-label={`Inside ${appearance} surface, selected`}
                />
                <Switch
                  readOnly
                  checked={false}
                  data-testid={`sw-surface-${appearance}-readonly-off`}
                  aria-label={`Inside ${appearance} surface, read-only not selected`}
                />
              </Surface>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="switch-figma-accent" title="accent (Figma values)">
        <ApiSectionBody>
          <p style={noteStyle}>
            ⚠️ Attached Figma table lists <code>accent</code> values but marks the <strong>Figma API column as N/A</strong>
            — QA still exercises all three roles in code (same as Switch.stories Accents).
          </p>
          <div style={{ display: 'flex', gap: 'var(--Spacing-6)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {(['primary', 'secondary', 'sparkle'] as const).map((accent) => (
              <div
                key={accent}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--Spacing-3-5)',
                }}
              >
                <span style={cellLabel}>{accent}</span>
                <div style={flowRow}>
                  <Switch
                    accent={accent}
                    data-testid={`sw-figma-accent-${accent}-off`}
                    aria-label={`Accent ${accent}, not selected`}
                  />
                  <Switch
                    accent={accent}
                    checked
                    data-testid={`sw-figma-accent-${accent}-on`}
                    aria-label={`Accent ${accent}, selected`}
                  />
                </div>
              </div>
            ))}
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="switch-figma-disabled" title="disabled (Figma variable mode)">
        <ApiSectionBody>
          <div style={stack}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', flexWrap: 'wrap' }}>
              <span style={rowLabel}>disabled false</span>
              <Switch
                disabled={false}
                data-testid="sw-figma-disabled-false"
                aria-label="Disabled false, not selected"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', flexWrap: 'wrap' }}>
              <span style={rowLabel}>disabled true</span>
              <Switch
                disabled
                checked={false}
                data-testid="sw-figma-disabled-true-off"
                aria-label="Disabled, not selected"
              />
              <Switch disabled checked data-testid="sw-figma-disabled-true-on" aria-label="Disabled, selected" />
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="switch-figma-readonly" title="readOnly (Figma component property)">
        <ApiSectionBody>
          <div style={stack}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', flexWrap: 'wrap' }}>
              <span style={rowLabel}>readOnly false</span>
              <Switch
                readOnly={false}
                data-testid="sw-figma-readonly-false"
                aria-label="Read-only false, not selected"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', flexWrap: 'wrap' }}>
              <span style={rowLabel}>readOnly true</span>
              <Switch
                readOnly
                checked={false}
                data-testid="sw-figma-readonly-true-off"
                aria-label="Read-only, not selected"
              />
              <Switch readOnly checked data-testid="sw-figma-readonly-true-on" aria-label="Read-only, selected" />
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="switch-figma-selected-interactive" title="selected (controlled, React)">
        <ApiSectionBody>
          <p style={noteStyle}>
            ⚠️ Figma <code>selected</code> maps to <code>checked</code>; <code>onCheckedChange</code> is React-only wiring
            (not a Figma property row).
          </p>
          <Switch checked={selected} onCheckedChange={setSelected} data-testid="sw-figma-selected-controlled">
            Controlled selected
          </Switch>
        </ApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
