'use client';

import type { CSSProperties } from 'react';
import { useId } from 'react';
import { LinearProgressIndicator } from '@oneui/ui/components/LinearProgressIndicator';
import type {
  LinearProgressIndicatorAppearance,
  LinearProgressIndicatorProps,
  LinearProgressIndicatorSize,
} from '@oneui/ui/components/LinearProgressIndicator';
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

const barWrapStyle: CSSProperties = {
  width: 'var(--Spacing-40)',
  maxWidth: '100%',
  flexShrink: 0,
  boxSizing: 'border-box',
};

/** Full-width bar inside Surface — avoids overflow past tinted container. */
const surfaceBarWrapStyle: CSSProperties = {
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
};

const surfaceShellStyle: CSSProperties = {
  paddingBlock: 'var(--Spacing-4)',
  paddingInline: 'var(--Spacing-4-5)',
  borderRadius: 'var(--Shape-L)',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  overflow: 'hidden',
};

const FIGMA_SIZES: LinearProgressIndicatorSize[] = ['S', 'M', 'L'];

const FIGMA_APPEARANCE = [
  'auto',
  'primary',
  'secondary',
  'sparkle',
  'neutral',
  'positive',
  'negative',
  'warning',
  'informative',
] as const satisfies readonly LinearProgressIndicatorAppearance[];

const SURFACE_MODES = [
  { mode: 'default' as const, label: 'default' },
  { mode: 'minimal' as const, label: 'minimal' },
  { mode: 'subtle' as const, label: 'subtle' },
  { mode: 'moderate' as const, label: 'moderate' },
  { mode: 'bold' as const, label: 'bold' },
  { mode: 'elevated' as const, label: 'elevated' },
] as const;

type ComboRow = { caption: string; props: LinearProgressIndicatorProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'determinate · M · primary · roundCaps · value 60',
    props: { type: 'determinate', size: 'M', appearance: 'primary', roundCaps: true, value: 60, 'aria-label': 'QA combo 0' },
  },
  {
    caption: 'indeterminate · M · secondary · roundCaps',
    props: { type: 'indeterminate', size: 'M', appearance: 'secondary', roundCaps: true, 'aria-label': 'QA combo 1' },
  },
  {
    caption: 'determinate · L · positive · flat caps · value 45',
    props: { type: 'determinate', size: 'L', appearance: 'positive', roundCaps: false, value: 45, 'aria-label': 'QA combo 2' },
  },
  {
    caption: 'indeterminate · S · warning · flat caps',
    props: { type: 'indeterminate', size: 'S', appearance: 'warning', roundCaps: false, 'aria-label': 'QA combo 3' },
  },
  {
    caption: 'determinate · M · neutral · value 0 (Code only value) ⚠️',
    props: { type: 'determinate', size: 'M', appearance: 'neutral', value: 0, 'aria-label': 'QA combo 4' },
  },
  {
    caption: 'determinate · M · informative · value 100 (Code only value) ⚠️',
    props: { type: 'determinate', size: 'M', appearance: 'informative', value: 100, 'aria-label': 'QA combo 5' },
  },
  {
    caption: 'indeterminate · M · value 80 ignored (Code only value) ⚠️',
    props: { type: 'indeterminate', size: 'M', appearance: 'primary', value: 80, 'aria-label': 'QA combo 6' },
  },
  {
    caption: 'determinate · M · auto · value 55',
    props: { type: 'determinate', size: 'M', appearance: 'auto', value: 55, 'aria-label': 'QA combo 7' },
  },
];

function DemoBar({
  testId,
  ...props
}: LinearProgressIndicatorProps & { testId?: string }) {
  return (
    <div data-testid={testId} style={barWrapStyle}>
      <LinearProgressIndicator {...props} />
    </div>
  );
}

function SurfaceDemoBar({
  testId,
  ...props
}: LinearProgressIndicatorProps & { testId?: string }) {
  return (
    <div data-testid={testId} style={surfaceBarWrapStyle}>
      <LinearProgressIndicator {...props} />
    </div>
  );
}

function LabelledByDemo() {
  const labelId = useId();
  return (
    <div className={styles.scenarioFlexRow}>
      <span
        id={labelId}
        className={styles.scenarioCellCaption}
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          color: 'var(--Text-Medium)',
          maxWidth: 'var(--Spacing-40)',
        }}
      >
        Visible label referenced by <code>aria-labelledby</code> — not a Figma component property (Figma API N/A) ⚠️.
      </span>
      <LinearProgressIndicator
        type="indeterminate"
        size="M"
        appearance="neutral"
        aria-labelledby={labelId}
        data-testid="lpi-aria-labelledby"
      />
    </div>
  );
}

/**
 * Linear Progress Indicator QA playground — Figma API (`type`, `size`, `roundCaps`, `appearance`)
 * plus **Code only** `value`, surface-context track tinting, and aria patterns.
 */
export function LinearProgressIndicatorQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="linear-progress-indicator-qa-default" title="Default" centerContent>
        <DemoBar
          type="determinate"
          size="M"
          appearance="primary"
          roundCaps
          value={60}
          aria-label="QA default progress"
          testId="lpi-default"
        />
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-type" title="1 type" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>type</code>: <code>determinate</code> (value-driven fill) vs <code>indeterminate</code>{' '}
          (continuous loading animation; ignores <code>value</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoBar
                type="determinate"
                value={65}
                size="M"
                aria-label="QA determinate"
                testId="lpi-type-determinate"
              />
              <span className={styles.scenarioCellCaption}>type: determinate</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoBar
                type="indeterminate"
                size="M"
                aria-label="QA indeterminate"
                testId="lpi-type-indeterminate"
              />
              <span className={styles.scenarioCellCaption}>type: indeterminate</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-size" title="2 size" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>size</code>: <code>S</code>, <code>M</code>, <code>L</code> track heights.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {FIGMA_SIZES.map((size) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <DemoBar
                  type="determinate"
                  value={55}
                  size={size}
                  aria-label={`QA size ${size}`}
                  testId={`lpi-size-${size}`}
                />
                <span className={styles.scenarioCellCaption}>{`size: ${size}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-round-caps" title="3 roundCaps" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>roundCaps</code>: pill ends vs square ends on track and indicator.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoBar
                roundCaps
                value={50}
                aria-label="QA round caps"
                testId="lpi-round-caps-true"
              />
              <span className={styles.scenarioCellCaption}>roundCaps: true</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoBar
                roundCaps={false}
                value={50}
                aria-label="QA flat caps"
                testId="lpi-round-caps-false"
              />
              <span className={styles.scenarioCellCaption}>roundCaps: false</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-appearance" title="4 appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>appearance</code> variable modes; <code>auto</code> resolves to <code>primary</code> in code.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <DemoBar
                  appearance={appearance}
                  value={65}
                  size="M"
                  aria-label={`QA appearance ${appearance}`}
                  testId={`lpi-appearance-${appearance}`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand
        id="linear-progress-indicator-qa-value"
        title="5 value (Figma Code only — not a component property) ⚠️"
        overflow
      >
        <p className={styles.storySectionLead}>
          Spec <strong>Code only</strong> row: <code>value</code> drives determinate fill (0–100, clamped). Ignored when{' '}
          <code>type=&quot;indeterminate&quot;</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ flexWrap: 'wrap' }}>
            {([0, 25, 50, 75, 100] as const).map((v) => (
              <div key={v} className={styles.scenarioLabeledCell}>
                <DemoBar
                  type="determinate"
                  value={v}
                  size="M"
                  aria-label={`QA value ${v}%`}
                  testId={`lpi-value-${v}`}
                />
                <span className={styles.scenarioCellCaption}>{`value: ${v} ⚠️`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-all-variants" title="6 All variants matrix" overflow>
        <p className={styles.storySectionLead}>
          Full Figma matrix: determinate / indeterminate × round / flat caps × S / M / L — mirrors{' '}
          <code>LinearProgressIndicator.stories.tsx</code> All Variants.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)', width: 'var(--Spacing-48)' }}>
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
              <span style={appearanceRowLabelStyle}>Determinate · round caps · sizes</span>
              {FIGMA_SIZES.map((size) => (
                <DemoBar
                  key={`det-round-${size}`}
                  type="determinate"
                  size={size}
                  value={60}
                  aria-label={`Det round ${size}`}
                  testId={`lpi-matrix-det-round-${size}`}
                />
              ))}
            </section>
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
              <span style={appearanceRowLabelStyle}>Determinate · flat caps · sizes</span>
              {FIGMA_SIZES.map((size) => (
                <DemoBar
                  key={`det-flat-${size}`}
                  type="determinate"
                  size={size}
                  roundCaps={false}
                  value={60}
                  aria-label={`Det flat ${size}`}
                  testId={`lpi-matrix-det-flat-${size}`}
                />
              ))}
            </section>
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
              <span style={appearanceRowLabelStyle}>Indeterminate · round caps · sizes</span>
              {FIGMA_SIZES.map((size) => (
                <DemoBar
                  key={`ind-round-${size}`}
                  type="indeterminate"
                  size={size}
                  aria-label={`Ind round ${size}`}
                  testId={`lpi-matrix-ind-round-${size}`}
                />
              ))}
            </section>
            <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
              <span style={appearanceRowLabelStyle}>Indeterminate · flat caps · sizes</span>
              {FIGMA_SIZES.map((size) => (
                <DemoBar
                  key={`ind-flat-${size}`}
                  type="indeterminate"
                  size={size}
                  roundCaps={false}
                  aria-label={`Ind flat ${size}`}
                  testId={`lpi-matrix-ind-flat-${size}`}
                />
              ))}
            </section>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-surface" title="7 Surface context — code only ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Track rail tints inside <code>&lt;Surface mode=&quot;…&quot;&gt;</code> via <code>[data-surface]</code> token
          remapping (same pattern as CircularProgressIndicator / Slider). Match <code>appearance</code> to the surface
          role for readable contrast.
        </p>
        <QaApiSectionBody>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-5)',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            {SURFACE_MODES.map(({ mode, label }) => (
              <div
                key={mode}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--Spacing-3)',
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <span style={appearanceRowLabelStyle}>{`Surface mode: ${label}`}</span>
                <Surface
                  mode={mode}
                  appearance="secondary"
                  style={surfaceShellStyle}
                  data-testid={`lpi-surface-${mode}`}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--Spacing-3)',
                      width: '100%',
                      minWidth: 0,
                    }}
                  >
                    <SurfaceDemoBar
                      type="determinate"
                      appearance="secondary"
                      value={60}
                      aria-label={`Determinate on ${label} surface`}
                      testId={`lpi-surface-${mode}-determinate`}
                    />
                    <SurfaceDemoBar
                      type="indeterminate"
                      appearance="secondary"
                      aria-label={`Indeterminate on ${label} surface`}
                      testId={`lpi-surface-${mode}-indeterminate`}
                    />
                  </div>
                </Surface>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Primary appearance on a primary-tinted <code>subtle</code> surface (role-aligned fill override).
        </p>
        <QaApiSectionBody>
          <Surface
            mode="subtle"
            style={surfaceShellStyle}
            data-testid="lpi-surface-subtle-primary"
          >
            <SurfaceDemoBar
              type="determinate"
              appearance="primary"
              value={70}
              aria-label="Primary on subtle surface"
              testId="lpi-surface-subtle-primary-bar"
            />
          </Surface>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-aria-labelledby" title="8 aria-labelledby" overflow>
        <p className={styles.storySectionLead}>
          Prefer <code>aria-label</code> for a concise progress name; <code>aria-labelledby</code> is supported for
          visible labels — not listed on the Figma API table ⚠️.
        </p>
        <QaApiSectionBody>
          <LabelledByDemo />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="linear-progress-indicator-qa-combos" title="9 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <LinearProgressIndicator {...row.props} data-testid={`lpi-combo-${index}`} />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
