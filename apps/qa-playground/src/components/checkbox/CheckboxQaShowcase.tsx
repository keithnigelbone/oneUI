'use client';

import type { CSSProperties } from 'react';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import type { CheckboxAccent, CheckboxAppearance, CheckboxProps, CheckboxSize } from '@oneui/ui/components/Checkbox';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const appearanceRowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

/** Figma S/M/L ↔ code `size` (lowercase). Bracket numbers from Figma spec. */
const FIGMA_SIZES: { figma: string; bracket: string; size: CheckboxSize }[] = [
  { figma: 'S', bracket: '4', size: 's' },
  { figma: 'M', bracket: '5', size: 'm' },
  { figma: 'L', bracket: '6', size: 'l' },
];

/** Figma appearance table (+ `auto`). Same order as `Checkbox.stories.tsx` default strip. */
const FIGMA_APPEARANCE = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly CheckboxAppearance[];

const ACCENT_VALUES: CheckboxAccent[] = ['primary', 'secondary', 'sparkle'];

type ComboRow = { caption: string; props: CheckboxProps };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'S · neutral · unchecked', props: { size: 's', appearance: 'neutral', label: 'Label' } },
  { caption: 'M · primary · checked', props: { size: 'm', appearance: 'primary', checked: true, label: 'Label' } },
  { caption: 'L · secondary · indeterminate', props: { size: 'l', appearance: 'secondary', indeterminate: true, label: 'Label' } },
  { caption: 'M · neutral · accent sparkle · checked', props: { appearance: 'neutral', accent: 'sparkle', checked: true, label: 'Label' } },
  { caption: 'M · auto · checked', props: { appearance: 'auto', checked: true, label: 'Label' } },
  { caption: 'M · warning · disabled · checked', props: { appearance: 'warning', disabled: true, checked: true, label: 'Label' } },
  { caption: 'M · informative · readOnly · checked', props: { appearance: 'informative', readOnly: true, checked: true, label: 'Label' } },
  { caption: 'M · positive · indeterminate', props: { size: 'm', appearance: 'positive', indeterminate: true, label: 'Label' } },
];

/**
 * Checkbox QA playground — Figma API sections, code-only notes, combination matrix.
 * `data-testid` is forwarded to the checkbox control only ({@link packages/ui/src/components/Checkbox/Checkbox.tsx}).
 */
export function CheckboxQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="checkbox-qa-default" title="Default" centerContent>
        <Checkbox
          size="m"
          appearance="neutral"
          accent="secondary"
          data-testid="checkbox-default"
          label="Accept terms and conditions"
        />
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-size" title="1 Size (S · M · L)" overflow>
        <p className={styles.storySectionLead}>
          Figma labels sizes <strong>S/M/L</strong> with bracket steps; code uses lowercase <code>size</code> (<code>s</code>,{' '}
          <code>m</code>, <code>l</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, bracket, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <Checkbox size={size} appearance="neutral" data-testid={`checkbox-size-${figma}`} label="Label" />
                <span className={styles.scenarioCellCaption}>{`size: ${figma} [${bracket}]`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Code also accepts legacy aliases <code>small</code>, <code>medium</code>, <code>large</code> — not in the Figma size table ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(
              [
                { alias: 'small', resolves: 's' },
                { alias: 'medium', resolves: 'm' },
                { alias: 'large', resolves: 'l' },
              ] as const
            ).map(({ alias, resolves }) => (
              <div key={alias} className={styles.scenarioLabeledCell}>
                <Checkbox size={alias} appearance="neutral" data-testid={`checkbox-size-alias-${alias}`} label={alias} />
                <span className={styles.scenarioCellCaption}>{`size: ${alias} → ${resolves} ⚠️`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-appearance" title="2 Appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>Checkbox.stories.tsx</code> Appearances — each row: unchecked, checked, indeterminate. Code also supports{' '}
          <code>brand-bg</code> (not in this Figma table) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={appearanceRowLabelStyle}>
                  {appearance}
                </span>
                <Checkbox
                  appearance={appearance}
                  aria-label={`${appearance} unchecked`}
                  data-testid={`checkbox-appearance-${appearance}-off`}
                />
                <Checkbox
                  appearance={appearance}
                  checked
                  aria-label={`${appearance} checked`}
                  data-testid={`checkbox-appearance-${appearance}-on`}
                />
                <Checkbox
                  appearance={appearance}
                  
                  indeterminate
                  aria-label={`${appearance} indeterminate`}
                  data-testid={`checkbox-appearance-${appearance}-ind`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>
              brand-bg ⚠️
            </span>
            <Checkbox
              appearance="brand-bg"
              aria-label="brand-bg unchecked"
              data-testid="checkbox-appearance-brand-bg-off"
            />
            <Checkbox
              appearance="brand-bg"
              checked
              aria-label="brand-bg checked"
              data-testid="checkbox-appearance-brand-bg-on"
            />
            <Checkbox
              appearance="brand-bg"
              indeterminate
              aria-label="brand-bg indeterminate"
              data-testid="checkbox-appearance-brand-bg-ind"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-accent" title="3 Accent (primary · secondary · sparkle)" overflow>
        <p className={styles.storySectionLead}>
          Figma marks <strong>API → N/A</strong> for variable binding; code still implements <code>accent</code> as a selected-fill override (
          see <code>Checkbox.stories.tsx</code> Accents / AccentOverride). Figma API column: N/A ⚠️ — props are real in code.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {ACCENT_VALUES.map((accent) => (
              <div key={accent} className={styles.scenarioLabeledCell}>
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
                  <Checkbox accent={accent} aria-label={`${accent} accent unchecked`} data-testid={`checkbox-accent-${accent}-off`} />
                  <Checkbox accent={accent} checked aria-label={`${accent} accent checked`} data-testid={`checkbox-accent-${accent}-on`} />
                  <Checkbox
                    accent={accent}
                    indeterminate
                    aria-label={`${accent} accent indeterminate`}
                    data-testid={`checkbox-accent-${accent}-ind`}
                  />
                </div>
                <span className={styles.scenarioCellCaption}>{`accent: ${accent}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Override pattern from stories: <code>appearance=&quot;neutral&quot;</code> + <code>accent</code> changes fill only.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {ACCENT_VALUES.map((accent) => (
              <div key={`neutral-${accent}`} className={styles.scenarioLabeledCell}>
                <Checkbox
                  appearance="neutral"
                  accent={accent}
                  checked
                  data-testid={`checkbox-accent-neutral-${accent}`}
                  label="Label"
                />
                <span className={styles.scenarioCellCaption}>{`neutral + accent=${accent}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-selected" title="4 Selected (Figma) → checked" overflow>
        <p className={styles.storySectionLead}>
          Figma property <code>selected</code> maps to the <code>checked</code> prop (and <code>defaultChecked</code> when uncontrolled).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox checked={false} appearance="neutral" data-testid="checkbox-selected-false" label="Label" />
              <span className={styles.scenarioCellCaption}>selected: false (checked=false)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox checked appearance="neutral" data-testid="checkbox-selected-true" label="Label" />
              <span className={styles.scenarioCellCaption}>selected: true (checked)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-indeterminate" title="5 Indeterminate" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox indeterminate={false} appearance="primary" data-testid="checkbox-indeterminate-false" label="Label" />
              <span className={styles.scenarioCellCaption}>indeterminate: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox indeterminate appearance="primary" data-testid="checkbox-indeterminate-true" label="Label" />
              <span className={styles.scenarioCellCaption}>indeterminate: true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-readonly" title="6 readOnly" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox readOnly={false} appearance="secondary" data-testid="checkbox-readonly-false-off" label="Label" />
              <span className={styles.scenarioCellCaption}>readOnly: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox readOnly checked={false} appearance="secondary" data-testid="checkbox-readonly-true-off" label="Label" />
              <span className={styles.scenarioCellCaption}>readOnly: true · unchecked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox readOnly checked appearance="secondary" data-testid="checkbox-readonly-true-on" label="Label" />
              <span className={styles.scenarioCellCaption}>readOnly: true · checked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox readOnly indeterminate appearance="secondary" data-testid="checkbox-readonly-true-ind" label="Label" />
              <span className={styles.scenarioCellCaption}>readOnly: true · indeterminate</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-disabled" title="7 disabled" overflow>
        <p className={styles.storySectionLead}>
          In Figma, <code>disabled</code> is a variable mode; in code it is the <code>disabled</code> prop (Base UI uses{' '}
          <code>aria-disabled</code> on the control).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox disabled={false} appearance="neutral" data-testid="checkbox-disabled-false-off" label="Label" />
              <span className={styles.scenarioCellCaption}>disabled: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox disabled checked={false} appearance="neutral" data-testid="checkbox-disabled-true-off" label="Label" />
              <span className={styles.scenarioCellCaption}>disabled: true · unchecked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox disabled checked appearance="neutral" data-testid="checkbox-disabled-true-on" label="Label" />
              <span className={styles.scenarioCellCaption}>disabled: true · checked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Checkbox disabled indeterminate appearance="neutral" data-testid="checkbox-disabled-true-ind" label="Label" />
              <span className={styles.scenarioCellCaption}>disabled: true · indeterminate</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="checkbox-qa-combos" title="8 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <Checkbox {...row.props} data-testid={`checkbox-combo-${index}`} />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
