'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Radio, RadioGroup } from '@oneui/ui/components/Radio';
import type { RadioAccent, RadioAppearance, RadioProps, RadioSize } from '@oneui/ui/components/Radio';
import { Surface } from '@oneui/ui/components/Surface';
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

/** Same neutral minimal surface as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`. */
function QaSurfaceFrame({ children }: { children: ReactNode }) {
  return (
    <Surface
      mode="minimal"
      appearance="neutral"
      style={{
        borderRadius: 'var(--Shape-4-5)',
        overflow: 'hidden',
        padding: 'var(--Spacing-2XL)',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </Surface>
  );
}

/** Figma S/M/L ↔ code `size` (lowercase). Bracket numbers from Figma spec. */
const FIGMA_SIZES: { figma: string; bracket: string; size: RadioSize }[] = [
  { figma: 'S', bracket: '4', size: 's' },
  { figma: 'M', bracket: '5', size: 'm' },
  { figma: 'L', bracket: '6', size: 'l' },
];

/** Figma appearance table (+ `auto`). Same order as `Radio.stories.tsx` argTypes / Checkbox QA. */
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
] as const satisfies readonly RadioAppearance[];

const ACCENT_VALUES: RadioAccent[] = ['primary', 'secondary', 'sparkle'];

type ComboRow = {
  caption: string;
  /** Which `value` is selected in the pair (`a` | `b`). */
  defaultValue: 'a' | 'b' | '';
  a: RadioProps;
  b: RadioProps;
};

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'S · neutral · unselected (empty group value)',
    defaultValue: '',
    a: { value: 'a', size: 's', appearance: 'neutral', children: 'Label' },
    b: { value: 'b', size: 's', appearance: 'neutral', children: 'Alt' },
  },
  {
    caption: 'M · primary · selected (first)',
    defaultValue: 'a',
    a: { value: 'a', size: 'm', appearance: 'primary', children: 'Label' },
    b: { value: 'b', size: 'm', appearance: 'primary', children: 'Alt' },
  },
  {
    caption: 'L · secondary · selected (second)',
    defaultValue: 'b',
    a: { value: 'a', size: 'l', appearance: 'secondary', children: 'Label' },
    b: { value: 'b', size: 'l', appearance: 'secondary', children: 'Alt' },
  },
  {
    caption: 'M · neutral · accent sparkle · selected (first)',
    defaultValue: 'a',
    a: { value: 'a', appearance: 'neutral', accent: 'sparkle', children: 'Label' },
    b: { value: 'b', appearance: 'neutral', accent: 'sparkle', children: 'Alt' },
  },
  {
    caption: 'M · auto · selected (second)',
    defaultValue: 'b',
    a: { value: 'a', appearance: 'auto', children: 'Label' },
    b: { value: 'b', appearance: 'auto', children: 'Alt' },
  },
  {
    caption: 'M · warning · disabled · selected (first)',
    defaultValue: 'a',
    a: { value: 'a', appearance: 'warning', disabled: true, children: 'Label' },
    b: { value: 'b', appearance: 'warning', disabled: true, children: 'Alt' },
  },
  {
    caption: 'M · informative · readOnly · selected (second)',
    defaultValue: 'b',
    a: { value: 'a', appearance: 'informative', readOnly: true, children: 'Label' },
    b: { value: 'b', appearance: 'informative', readOnly: true, children: 'Alt' },
  },
];

/**
 * Radio QA playground — Figma API sections, code-only notes, combination matrix.
 * The **Radio - Figma Validation** tab (`RadioFigmaValidationShowcase`) hosts the Figma property grid:
 * selected × readOnly × size (M/S/L), same matrix shell as {@link ../divider/DividerFigmaValidationShowcase.tsx}.
 * Figma `selected` is not a prop on `Radio`: selection is owned by `RadioGroup` (`value` / `defaultValue`) vs each item's `value` ⚠️.
 * `RadioGroup` `orientation` (`horizontal` | `vertical`) and `name` exist in code but are not on the attached Figma Radio API table ⚠️.
 * `data-testid` is forwarded to the radio control only ({@link packages/ui/src/components/Radio/Radio.tsx} `BaseRadio.Root`).
 */
export function RadioQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="radio-qa-default" title="Default" centerContent>
        <QaSurfaceFrame>
          <RadioGroup defaultValue="a" aria-label="Default example" name="radio-qa-default-group">
            <Radio value="a" size="m" appearance="neutral" accent="secondary" data-testid="radio-default">
              Option A
            </Radio>
            <Radio value="b" size="m" appearance="neutral" accent="secondary">
              Option B
            </Radio>
            <Radio value="c" size="m" appearance="neutral" accent="secondary">
              Option C
            </Radio>
          </RadioGroup>
        </QaSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="radio-qa-size" title="1 Size (S · M · L)" overflow>
        <p className={styles.storySectionLead}>
          Figma labels sizes <strong>S/M/L</strong> with bracket steps; code uses lowercase <code>size</code> (<code>s</code>,{' '}
          <code>m</code>, <code>l</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, bracket, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <RadioGroup defaultValue="x" aria-label={`Size ${figma}`} name={`radio-qa-size-${figma}`}>
                  <Radio value="x" size={size} appearance="neutral" accent="secondary" data-testid={`radio-size-${figma}`}>
                    Label
                  </Radio>
                </RadioGroup>
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
                <RadioGroup defaultValue="x" aria-label={`Size alias ${alias}`} name={`radio-qa-size-alias-${alias}`}>
                  <Radio value="x" size={alias} appearance="neutral" accent="secondary" data-testid={`radio-size-alias-${alias}`}>
                    {alias}
                  </Radio>
                </RadioGroup>
                <span className={styles.scenarioCellCaption}>{`size: ${alias} → ${resolves} ⚠️`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="radio-qa-appearance" title="2 Appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Figma marks <strong>appearance</strong> as <strong>variable mode</strong>. Each row: unselected vs selected (single-option groups, see{' '}
          <code>Radio.stories.tsx</code> Appearances). Code also supports <code>brand-bg</code> (not in this Figma table) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <RadioGroup value="" readOnly aria-label={`${appearance} unselected`} name={`radio-qa-appearance-${appearance}-off`}>
                  <Radio value="only" appearance={appearance} aria-label={`${appearance} unselected`} data-testid={`radio-appearance-${appearance}-off`} />
                </RadioGroup>
                <RadioGroup defaultValue="only" aria-label={`${appearance} selected`} name={`radio-qa-appearance-${appearance}-on`}>
                  <Radio value="only" appearance={appearance} aria-label={`${appearance} selected`} data-testid={`radio-appearance-${appearance}-on`} />
                </RadioGroup>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <RadioGroup value="" readOnly aria-label="brand-bg unselected" name="radio-qa-appearance-brand-bg-off">
              <Radio value="only" appearance="brand-bg" aria-label="brand-bg unselected" data-testid="radio-appearance-brand-bg-off" />
            </RadioGroup>
            <RadioGroup defaultValue="only" aria-label="brand-bg selected" name="radio-qa-appearance-brand-bg-on">
              <Radio value="only" appearance="brand-bg" aria-label="brand-bg selected" data-testid="radio-appearance-brand-bg-on" />
            </RadioGroup>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="radio-qa-accent" title="3 Accent (primary · secondary · sparkle)" overflow>
        <p className={styles.storySectionLead}>
          Figma marks <strong>API → N/A</strong> for <code>accent</code>; code implements it as a selected-fill override (see <code>Radio.stories.tsx</code> Accents). Figma API column: N/A ⚠️ — props are real in code.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {ACCENT_VALUES.map((accent) => (
              <div key={accent} className={styles.scenarioLabeledCell}>
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
                  <RadioGroup value="" readOnly aria-label={`${accent} accent unselected`} name={`radio-qa-accent-${accent}-off`}>
                    <Radio value="a" accent={accent} appearance="neutral" aria-label={`${accent} accent unselected`} data-testid={`radio-accent-${accent}-off`} />
                    <Radio value="b" accent={accent} appearance="neutral" aria-label={`${accent} accent unselected b`} />
                  </RadioGroup>
                  <RadioGroup defaultValue="b" aria-label={`${accent} accent selected`} name={`radio-qa-accent-${accent}-on`}>
                    <Radio value="a" accent={accent} appearance="neutral" aria-label={`${accent} accent unselected a`} />
                    <Radio value="b" accent={accent} appearance="neutral" aria-label={`${accent} accent selected`} data-testid={`radio-accent-${accent}-on`} />
                  </RadioGroup>
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
                <RadioGroup defaultValue="x" aria-label={`neutral + ${accent}`} name={`radio-qa-accent-neutral-${accent}`}>
                  <Radio value="x" appearance="neutral" accent={accent} data-testid={`radio-accent-neutral-${accent}`}>
                    Label
                  </Radio>
                </RadioGroup>
                <span className={styles.scenarioCellCaption}>{`neutral + accent=${accent}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="radio-qa-selected" title="4 Selected (Figma) → RadioGroup value" overflow>
        <p className={styles.storySectionLead}>
          Figma property <code>selected</code> is a component property; there is <strong>no</strong> <code>selected</code> prop on <code>Radio</code> — use{' '}
          <code>RadioGroup</code> <code>value</code> / <code>defaultValue</code> matching this item&apos;s <code>value</code> ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup value="" readOnly aria-label="selected false" name="radio-qa-selected-false">
                <Radio value="a" appearance="neutral" accent="secondary" data-testid="radio-selected-false">
                  Label
                </Radio>
                <Radio value="b" appearance="neutral" accent="secondary">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>selected: false (no group selection)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup defaultValue="a" aria-label="selected true" name="radio-qa-selected-true">
                <Radio value="a" appearance="neutral" accent="secondary" data-testid="radio-selected-true">
                  Label
                </Radio>
                <Radio value="b" appearance="neutral" accent="secondary">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>selected: true (first item selected)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="radio-qa-readonly" title="5 readOnly" overflow>
        <p className={styles.storySectionLead}>
          Figma lists <code>readOnly</code> as a component property; code mirrors Base UI (<code>readOnly</code> on <code>Radio</code> or <code>RadioGroup</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup defaultValue="a" aria-label="readOnly false" name="radio-qa-readonly-false-off">
                <Radio value="a" readOnly={false} appearance="secondary" accent="secondary" data-testid="radio-readonly-false-off">
                  Label
                </Radio>
                <Radio value="b" readOnly={false} appearance="secondary" accent="secondary">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>readOnly: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup defaultValue="a" readOnly aria-label="readOnly true first selected" name="radio-qa-readonly-true-off">
                <Radio value="a" appearance="secondary" accent="secondary" data-testid="radio-readonly-true-off">
                  Label
                </Radio>
                <Radio value="b" appearance="secondary" accent="secondary">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>readOnly: true · first selected</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup defaultValue="b" readOnly aria-label="readOnly true second selected" name="radio-qa-readonly-true-on">
                <Radio value="a" appearance="secondary" accent="secondary">
                  Label
                </Radio>
                <Radio value="b" appearance="secondary" accent="secondary" data-testid="radio-readonly-true-on">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>readOnly: true · second selected</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="radio-qa-disabled" title="6 disabled" overflow>
        <p className={styles.storySectionLead}>
          In Figma, <code>disabled</code> is a variable mode; in code it is the <code>disabled</code> prop (Base UI uses <code>aria-disabled</code> on the control).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup defaultValue="a" aria-label="disabled false" name="radio-qa-disabled-false-off">
                <Radio value="a" disabled={false} appearance="neutral" accent="secondary" data-testid="radio-disabled-false-off">
                  Label
                </Radio>
                <Radio value="b" disabled={false} appearance="neutral" accent="secondary">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>disabled: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup defaultValue="a" disabled aria-label="disabled true first selected" name="radio-qa-disabled-true-off">
                <Radio value="a" appearance="neutral" accent="secondary" data-testid="radio-disabled-true-off">
                  Label
                </Radio>
                <Radio value="b" appearance="neutral" accent="secondary">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>disabled: true · first selected</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <RadioGroup defaultValue="b" disabled aria-label="disabled true second selected" name="radio-qa-disabled-true-on">
                <Radio value="a" appearance="neutral" accent="secondary">
                  Label
                </Radio>
                <Radio value="b" appearance="neutral" accent="secondary" data-testid="radio-disabled-true-on">
                  Alt
                </Radio>
              </RadioGroup>
              <span className={styles.scenarioCellCaption}>disabled: true · second selected</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="radio-qa-combos" title="7 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                {row.defaultValue === '' ? (
                  <RadioGroup value="" readOnly aria-label={row.caption} name={`radio-qa-combo-${index}`}>
                    <Radio {...row.a} data-testid={`radio-combo-${index}`} />
                    <Radio {...row.b} />
                  </RadioGroup>
                ) : (
                  <RadioGroup defaultValue={row.defaultValue} aria-label={row.caption} name={`radio-qa-combo-${index}`}>
                    <Radio {...row.a} data-testid={`radio-combo-${index}`} />
                    <Radio {...row.b} />
                  </RadioGroup>
                )}
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
