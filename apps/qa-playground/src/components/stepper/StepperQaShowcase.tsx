'use client';

import type { CSSProperties } from 'react';
import { Stepper } from '@oneui/ui/components/Stepper';
import type {
  StepperAccent,
  StepperAppearance,
  StepperAttention,
  StepperProps,
  StepperSize,
} from '@oneui/ui/components/Stepper';
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

/** Figma S/M/L ↔ code `size` (lowercase). Bracket numbers follow the same Figma size scale as Checkbox. */
const FIGMA_SIZES: { figma: string; bracket: string; size: StepperSize }[] = [
  { figma: 'S', bracket: '4', size: 's' },
  { figma: 'M', bracket: '5', size: 'm' },
  { figma: 'L', bracket: '6', size: 'l' },
];

/** Figma appearance variable modes (+ `auto`). Order matches attached Stepper API table. */
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
] as const satisfies readonly StepperAppearance[];

const ACCENT_VALUES: StepperAccent[] = ['primary', 'secondary', 'sparkle'];

type ComboRow = { caption: string; props: StepperProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'S · secondary · attention high · value 3',
    props: { size: 's', appearance: 'secondary', attention: 'high', defaultValue: 3 },
  },
  {
    caption: 'M · primary · attention high · value 5',
    props: { size: 'm', appearance: 'primary', attention: 'high', defaultValue: 5 },
  },
  {
    caption: 'L · secondary · condensed · value 7',
    props: { size: 'l', appearance: 'secondary', condensed: true, defaultValue: 7 },
  },
  {
    caption: 'M · neutral · accent sparkle · attention high',
    props: { appearance: 'neutral', accent: 'sparkle', attention: 'high', defaultValue: 4 },
  },
  {
    caption: 'M · auto · attention medium',
    props: { appearance: 'auto', attention: 'medium', defaultValue: 5 },
  },
  {
    caption: 'M · warning · disabled · value 2',
    props: { appearance: 'warning', disabled: true, defaultValue: 2 },
  },
  {
    caption: 'M · informative · readOnly · value 6',
    props: { appearance: 'informative', readOnly: true, defaultValue: 6 },
  },
  {
    caption: 'M · positive · error · value 1',
    props: { appearance: 'positive', error: true, defaultValue: 1 },
  },
];

/** Merges a default input `aria-label` so axe / Playwright name checks pass on this page (no `InputText` Figma prop). */
function DemoStepper(props: StepperProps) {
  const { partProps, ...rest } = props;
  return (
    <Stepper
      {...rest}
      partProps={{
        ...partProps,
        input: {
          'aria-label': 'Quantity (QA demo)',
          ...partProps?.input,
        },
      }}
    />
  );
}

/**
 * Stepper QA playground — Figma API sections, code-only notes, combination matrix.
 * `data-testid` is forwarded on the root control only ({@link packages/ui/src/components/Stepper/Stepper.tsx}).
 */
export function StepperQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="stepper-qa-default" title="Default" centerContent>
        <DemoStepper data-testid="stepper-default" />
      </QaStoryBand>

      <QaStoryBand id="stepper-qa-size" title="1 Size (S · M · L)" overflow>
        <p className={styles.storySectionLead}>
          Figma labels sizes <strong>S/M/L</strong> with bracket steps; code uses lowercase{' '}
          <code>size</code> (<code>s</code>, <code>m</code>, <code>l</code>) — same mapping as{' '}
          <code>Stepper.stories.tsx</code> / <code>StepperSizes</code>.
        </p>
        <p className={styles.storySectionLead}>
          This row uses <code>attention=&quot;high&quot;</code> for all three sizes so automated
          WCAG contrast clears 4.5:1 at the smallest scale (<code>secondary</code> + <code>s</code>{' '}
          + <code>medium</code> lands ~4.42:1 in the default brand — QA playground only).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, bracket, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <DemoStepper
                  size={size}
                  appearance="secondary"
                  attention="high"
                  defaultValue={5}
                  data-testid={`stepper-size-${figma}`}
                />
                <span className={styles.scenarioCellCaption}>{`size: ${figma} [${bracket}]`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Code-only sizing: legacy aliases are not documented on Stepper today — if added later,
          flag here with ⚠️ like Checkbox.
        </p>
      </QaStoryBand>

      <QaStoryBand
        id="stepper-qa-attention"
        title="2 Attention (high · medium · low) — not in attached Figma API table ⚠️"
        overflow
      >
        <p className={styles.storySectionLead}>
          The attached Figma property table does <strong>not</strong> list <code>attention</code>;
          the web component implements <code>high</code> / <code>medium</code> / <code>low</code>{' '}
          for visual weight (see <code>Stepper.stories.tsx</code> Attention Levels,{' '}
          <code>StepperAttentionLevels</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['high', 'medium', 'low'] as const satisfies readonly StepperAttention[]).map(
              (attention) => (
                <div key={attention} className={styles.scenarioLabeledCell}>
                  <DemoStepper
                    attention={attention}
                    appearance="secondary"
                    defaultValue={5}
                    data-testid={`stepper-attention-${attention}`}
                  />
                  <span className={styles.scenarioCellCaption}>{`attention: ${attention} ⚠️`}</span>
                </div>
              )
            )}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="stepper-qa-appearance" title="3 Appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>Stepper.stories.tsx</code> Appearances — one stepper per role at
          fixed value. Code also supports <code>brand-bg</code> (not in this Figma table) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div
                key={appearance}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--Spacing-5)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <DemoStepper
                  appearance={appearance}
                  attention="medium"
                  defaultValue={5}
                  data-testid={`stepper-appearance-${appearance}`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--Spacing-5)',
              flexWrap: 'wrap',
            }}
          >
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <DemoStepper
              appearance="brand-bg"
              attention="medium"
              defaultValue={5}
              data-testid="stepper-appearance-brand-bg"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="stepper-qa-accent" title="4 Accent (primary · secondary · sparkle)" overflow>
        <p className={styles.storySectionLead}>
          Figma marks <strong>Figma API → N/A</strong> for <code>accent</code>; code implements fill
          override at high attention (<code>Stepper.stories.tsx</code> Accents). Figma API column:
          N/A ⚠️ — props are real in code.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {ACCENT_VALUES.map((accent) => (
              <div key={accent} className={styles.scenarioLabeledCell}>
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--Spacing-3-5)',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <DemoStepper
                    appearance="neutral"
                    accent={accent}
                    attention="high"
                    defaultValue={3}
                    data-testid={`stepper-accent-${accent}-h`}
                  />
                  <DemoStepper
                    appearance="neutral"
                    accent={accent}
                    attention="medium"
                    defaultValue={5}
                    data-testid={`stepper-accent-${accent}-m`}
                  />
                  <DemoStepper
                    appearance="neutral"
                    accent={accent}
                    attention="low"
                    defaultValue={7}
                    data-testid={`stepper-accent-${accent}-l`}
                  />
                </div>
                <span
                  className={styles.scenarioCellCaption}
                >{`accent: ${accent} (high · medium · low attention)`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Override pattern from stories: <code>appearance=&quot;neutral&quot;</code> +{' '}
          <code>accent</code> changes fill emphasis at <code>attention=&quot;high&quot;</code>.
        </p>
      </QaStoryBand>

      <QaStoryBand id="stepper-qa-condensed" title="5 condensed" overflow>
        <p className={styles.storySectionLead}>
          Figma lists <code>condensed</code> as a component property; code uses boolean{' '}
          <code>condensed</code> (see <code>StepperCondensed</code> in{' '}
          <code>Stepper.showcase.tsx</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper
                condensed={false}
                appearance="secondary"
                defaultValue={5}
                data-testid="stepper-condensed-false"
              />
              <span className={styles.scenarioCellCaption}>condensed: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper
                condensed
                appearance="secondary"
                defaultValue={5}
                data-testid="stepper-condensed-true"
              />
              <span className={styles.scenarioCellCaption}>condensed: true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="stepper-qa-disabled" title="6 disabled" overflow>
        <p className={styles.storySectionLead}>
          In Figma, <code>disabled</code> is a variable mode; in code it is the{' '}
          <code>disabled</code> prop (Base UI applies disabled state to the field).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper
                disabled={false}
                appearance="neutral"
                defaultValue={5}
                data-testid="stepper-disabled-false"
              />
              <span className={styles.scenarioCellCaption}>disabled: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper
                disabled
                appearance="neutral"
                defaultValue={5}
                data-testid="stepper-disabled-true"
              />
              <span className={styles.scenarioCellCaption}>disabled: true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="stepper-qa-input-text" title="7 InputText (Figma row)" overflow>
        <p className={styles.storySectionLead}>
          The attached Figma table lists <code>InputText</code> with no value column and Figma API{' '}
          <strong>N/A</strong>. There is no <code>inputText</code> (or similar) prop on{' '}
          <code>StepperProps</code> — the numeric field is the internal{' '}
          <code>NumberField.Input</code> from Base UI. Use <code>partProps.input</code> only for
          low-level attributes (e.g. <code>aria-label</code>), not a separate Figma prop surface.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper
                defaultValue={42}
                partProps={{
                  input: {
                    'aria-label': 'Quantity',
                  },
                }}
                data-testid="stepper-input-aria-label"
              />
              <span className={styles.scenarioCellCaption}>
                Internal input + partProps.input.aria-label (no InputText prop)
              </span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand
        id="stepper-qa-figma-code-slots"
        title="8 Code only (Figma): start / end → Button"
        overflow
      >
        <p className={styles.storySectionLead}>
          Figma documents <code>start</code> and <code>end</code> slots that accept{' '}
          <code>Button</code>. The shipped <code>Stepper</code> API does not expose{' '}
          <code>start</code> / <code>end</code> — decrement/increment controls are fixed icon
          buttons inside <code>packages/ui/src/components/Stepper/Stepper.tsx</code>.
        </p>
        <p className={styles.storySectionLead}>
          TODO: Add optional <code>start</code>/<code>end</code> slot props (or slot render props)
          when the design system aligns this component with the Figma &quot;Code only&quot; rows.
        </p>
      </QaStoryBand>

      <QaStoryBand
        id="stepper-qa-extra-states"
        title="9 readOnly · error · required — not in attached Figma table ⚠️"
        overflow
      >
        <p className={styles.storySectionLead}>
          These props exist in code (
          <code>packages/ui/src/components/Stepper/Stepper.shared.ts</code>) but are absent from the
          attached Figma property table — shown for parity with <code>Stepper.stories.tsx</code>{' '}
          States.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper readOnly defaultValue={5} data-testid="stepper-readonly" />
              <span className={styles.scenarioCellCaption}>readOnly ⚠️</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper error defaultValue={3} data-testid="stepper-error" />
              <span className={styles.scenarioCellCaption}>error ⚠️</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoStepper required defaultValue={2} data-testid="stepper-required" />
              <span className={styles.scenarioCellCaption}>required ⚠️</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="stepper-qa-combos" title="10 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <DemoStepper {...row.props} data-testid={`stepper-combo-${index}`} />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
