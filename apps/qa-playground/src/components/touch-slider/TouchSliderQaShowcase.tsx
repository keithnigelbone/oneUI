'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { TouchSlider } from '@oneui/ui/components/TouchSlider';
import type {
  TouchSliderAppearance,
  TouchSliderProgressStyle,
  TouchSliderProps,
} from '@oneui/ui/components/TouchSlider';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import { TouchSliderVolumeIcon } from './TouchSliderVolumeIcon';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so TouchSlider tokens remap against the same parent step as Bottom Navigation QA strips.
 */
function QaNeutralSurfaceFrame({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Surface
      mode="minimal"
      appearance="neutral"
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--Spacing-4-5)',
        padding: 'var(--Spacing-4-5)',
        borderRadius: 'var(--Shape-4-5)',
        ...style,
      }}
    >
      {children}
    </Surface>
  );
}

/** Figma horizontal track width (138×32). */
const TRACK_WIDTH = 138;

const trackWrapH: CSSProperties = {
  width: TRACK_WIDTH,
  maxWidth: '100%',
  flexShrink: 0,
  boxSizing: 'border-box',
};

/** Figma 32×138 vertical — QA harness min-height only (component unchanged). */
const trackWrapV: CSSProperties = {
  minHeight: 'var(--Dimension-f14)',
  flexShrink: 0,
  boxSizing: 'border-box',
};

const comboRowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 'var(--Spacing-2)',
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
};

const comboStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-5)',
  width: '100%',
  alignSelf: 'stretch',
  alignItems: 'stretch',
  boxSizing: 'border-box',
};

const appearanceRowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

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
] as const satisfies readonly TouchSliderAppearance[];

type ComboRow = { caption: string; props: TouchSliderProps; testId: string };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'horizontal · rounded · secondary · value 50 · start icon',
    testId: 'touch-slider-combo-0',
    props: {
      defaultValue: 50,
      progressStyle: 'rounded',
      appearance: 'secondary',
      start: <TouchSliderVolumeIcon />,
      'aria-label': 'Combo horizontal rounded',
    },
  },
  {
    caption: 'horizontal · sharp · primary · value 75',
    testId: 'touch-slider-combo-1',
    props: {
      defaultValue: 75,
      progressStyle: 'sharp',
      appearance: 'primary',
      start: <TouchSliderVolumeIcon />,
      'aria-label': 'Combo horizontal sharp',
    },
  },
  {
    caption: 'vertical · rounded · positive · value 40',
    testId: 'touch-slider-combo-2',
    props: {
      defaultValue: 40,
      orientation: 'vertical',
      progressStyle: 'rounded',
      appearance: 'positive',
      start: <TouchSliderVolumeIcon />,
      'aria-label': 'Combo vertical rounded',
    },
  },
  {
    caption: 'value 0 · edge empty track',
    testId: 'touch-slider-combo-3',
    props: {
      defaultValue: 0,
      start: <TouchSliderVolumeIcon />,
      'aria-label': 'Combo value zero',
    },
  },
  {
    caption: 'value 100 · full fill',
    testId: 'touch-slider-combo-4',
    props: {
      defaultValue: 100,
      start: <TouchSliderVolumeIcon />,
      'aria-label': 'Combo value max',
    },
  },
  {
    caption: 'disabled · warning appearance',
    testId: 'touch-slider-combo-5',
    props: {
      defaultValue: 55,
      appearance: 'warning',
      disabled: true,
      start: <TouchSliderVolumeIcon />,
      'aria-label': 'Combo disabled',
    },
  },
];

function DemoTouchSlider({
  testId,
  vertical,
  ...props
}: TouchSliderProps & { testId?: string; vertical?: boolean }) {
  return (
    <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
      <div data-testid={testId} style={vertical ? trackWrapV : trackWrapH}>
        <TouchSlider {...props} />
      </div>
    </QaNeutralSurfaceFrame>
  );
}

/** Figma default: horizontal, rounded, secondary, value 50, start icon. */
function TouchSliderFigmaDefaultDemo() {
  const [value, setValue] = useState(50);

  return (
    <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
      <div data-testid="touch-slider-default" style={trackWrapH}>
        <TouchSlider
          value={value}
          onValueChange={(v) => setValue(v as number)}
          appearance="secondary"
          progressStyle="rounded"
          start={<TouchSliderVolumeIcon />}
          aria-label="Default touch slider"
        />
      </div>
    </QaNeutralSurfaceFrame>
  );
}

/** Controlled volume UX — real-world pattern from Figma dev note. */
function TouchSliderControlledVolumeDemo() {
  const [value, setValue] = useState(33);

  return (
    <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
      <div data-testid="touch-slider-controlled-volume" style={trackWrapH}>
        <TouchSlider
          value={value}
          onValueChange={(v) => setValue(v as number)}
          min={0}
          max={100}
          step={1}
          start={<TouchSliderVolumeIcon />}
          aria-label="Controlled volume"
        />
        <p
          style={{
            margin: 'var(--Spacing-2) 0 0',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-XS-FontSize)',
            lineHeight: 'var(--Label-XS-LineHeight)',
            color: 'var(--Text-Medium)',
          }}
        >
          {`aria-valuenow equivalent: ${value}`}
        </p>
      </div>
    </QaNeutralSurfaceFrame>
  );
}

/**
 * Touch Slider QA — Figma API bands, edge cases, interaction, combination matrix.
 */
export function TouchSliderQaShowcase() {
  return (
    <QaShowcaseRoot>
      <QaStoryBand id="touch-slider-qa-figma-visual-gaps" title="Figma visual parity (QA tracked — component unchanged)" overflow>
        <p className={styles.storySectionLead}>
          API props match Figma; <strong>visual art</strong> may differ. Playwright parity tests in{' '}
          <code>e2e/touch-slider-figma-parity.spec.ts</code> assert <strong>as-shipped</strong> behaviour and
          document known gaps — they do not require component changes.
        </p>
        <QaApiSectionBody>
          <ul
            style={{
              margin: 0,
              paddingInlineStart: 'var(--Spacing-5)',
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Body-S-FontSize)',
              lineHeight: 'var(--Body-S-LineHeight)',
              color: 'var(--Text-Medium)',
            }}
          >
            <li>
              <strong>rounded:</strong> Figma shows a moving orange knob with icon inside; shipped code uses fill +
              fixed <code>start</code> slot (hidden thumb).
            </li>
            <li>
              <strong>straight / sharp:</strong> Figma shows square outer track + static icon; shipped code keeps
              pill outer container, flat trailing fill edge only.
            </li>
            <li>
              <strong>vertical:</strong> Figma shows full vertical bar; shipped render may show icon only — parity
              tests track <code>aria-valuenow</code> + attributes, not pixels.
            </li>
          </ul>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-default" title="Default (Figma API table)" centerContent overflow>
        <p className={styles.storySectionLead}>
          Figma defaults: <code>orientation</code> horizontal, <code>progressStyle</code> rounded,{' '}
          <code>appearance</code> secondary (via <code>auto</code> → secondary in code when omitted),{' '}
          <code>value</code> 50, <code>start</code> icon. Continuous values supported (not only 0/50/100).
        </p>
        <QaApiSectionBody>
          <TouchSliderFigmaDefaultDemo />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-orientation" title="1 orientation" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>orientation</code> ↔ code <code>orientation</code>. Vertical uses min-height track;
          icon slot moves to bottom (vertical start).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                defaultValue={60}
                orientation="horizontal"
                progressStyle="rounded"
                start={<TouchSliderVolumeIcon />}
                testId="touch-slider-orientation-horizontal"
                aria-label="Horizontal touch slider"
              />
              <span className={styles.scenarioCellCaption}>orientation: horizontal</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                defaultValue={60}
                orientation="vertical"
                progressStyle="rounded"
                start={<TouchSliderVolumeIcon />}
                vertical
                testId="touch-slider-orientation-vertical"
                aria-label="Vertical touch slider"
              />
              <span className={styles.scenarioCellCaption}>orientation: vertical</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-progress-style" title="2 progressStyle (rounded · sharp / straight)" overflow>
        <p className={styles.storySectionLead}>
          Figma API lists <code>sharp</code>; art labels <code>straight</code>. Code:{' '}
          <code>progressStyle: &apos;rounded&apos; | &apos;sharp&apos;</code> — default <code>rounded</code>.
          Outer container stays pill; only trailing fill edge changes.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['rounded', 'sharp'] as const satisfies readonly TouchSliderProgressStyle[]).map((progressStyle) => (
              <div key={progressStyle} className={styles.scenarioLabeledCell}>
                <DemoTouchSlider
                  defaultValue={50}
                  progressStyle={progressStyle}
                  start={<TouchSliderVolumeIcon />}
                  testId={`touch-slider-progress-${progressStyle}`}
                  aria-label={`Progress style ${progressStyle}`}
                />
                <span className={styles.scenarioCellCaption}>
                  {progressStyle === 'sharp' ? 'progressStyle: sharp (Figma “straight”)' : 'progressStyle: rounded'}
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-appearance" title="3 appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Figma variable modes — one row per role at value 60. Code also supports <code>brand-bg</code> ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <DemoTouchSlider
                  appearance={appearance}
                  defaultValue={60}
                  start={<TouchSliderVolumeIcon />}
                  testId={`touch-slider-appearance-${appearance}`}
                  aria-label={`${appearance} touch slider`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <DemoTouchSlider
              appearance="brand-bg"
              defaultValue={60}
              start={<TouchSliderVolumeIcon />}
              testId="touch-slider-appearance-brand-bg"
              aria-label="brand-bg touch slider"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-value" title="4 value — API & edge cases" overflow>
        <p className={styles.storySectionLead}>
          Figma demos <code>0</code>, <code>50</code>, <code>100</code>. Code accepts any in-range step (e.g.{' '}
          <code>37</code>, <code>0.5</code> with fine <code>step</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {([0, 50, 100] as const).map((v) => (
              <div key={v} className={styles.scenarioLabeledCell}>
                <DemoTouchSlider
                  defaultValue={v}
                  start={<TouchSliderVolumeIcon />}
                  testId={`touch-slider-value-${v}`}
                  aria-label={`Touch slider value ${v}`}
                />
                <span className={styles.scenarioCellCaption}>{`value: ${v}`}</span>
              </div>
            ))}
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                defaultValue={37}
                start={<TouchSliderVolumeIcon />}
                testId="touch-slider-value-37"
                aria-label="Touch slider value 37"
              />
              <span className={styles.scenarioCellCaption}>value: 37 (continuous)</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <TouchSliderControlledVolumeDemo />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-slots" title="5 start slot" overflow>
        <p className={styles.storySectionLead}>
          Figma shows a <code>start</code> icon. Code: <code>start</code> ReactNode slot (30×30).
          Slot wrappers are <code>aria-hidden</code> — name the slider via <code>aria-label</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                defaultValue={50}
                progressStyle="sharp"
                testId="touch-slider-slots-none"
                aria-label="No slots"
              />
              <span className={styles.scenarioCellCaption}>no slots</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                defaultValue={50}
                progressStyle="sharp"
                start={<TouchSliderVolumeIcon />}
                testId="touch-slider-slots-start"
                aria-label="Start icon only"
              />
              <span className={styles.scenarioCellCaption}>start: Icon</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-states" title="6 disabled · readOnly — code only ⚠️" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                disabled
                defaultValue={40}
                start={<TouchSliderVolumeIcon />}
                testId="touch-slider-disabled"
                aria-label="Disabled touch slider"
              />
              <span className={styles.scenarioCellCaption}>disabled</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                readOnly
                defaultValue={40}
                start={<TouchSliderVolumeIcon />}
                testId="touch-slider-readonly"
                aria-label="Read-only touch slider"
              />
              <span className={styles.scenarioCellCaption}>readOnly</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-edge" title="7 Edge cases" overflow>
        <p className={styles.storySectionLead}>
          Custom <code>min</code>/<code>max</code>, fractional <code>step</code>, and focus-forced row (Storybook
          pattern).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                defaultValue={5}
                min={0}
                max={10}
                step={1}
                start={<TouchSliderVolumeIcon />}
                testId="touch-slider-edge-min-max-0-10"
                aria-label="Range 0 to 10"
              />
              <span className={styles.scenarioCellCaption}>min=0 max=10</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoTouchSlider
                defaultValue={2.5}
                min={0}
                max={5}
                step={0.5}
                start={<TouchSliderVolumeIcon />}
                testId="touch-slider-edge-step-0-5"
                aria-label="Half step slider"
              />
              <span className={styles.scenarioCellCaption}>step=0.5</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div className={styles.scenarioLabeledCell}>
            <QaNeutralSurfaceFrame>
              <div data-force-state="focus" style={trackWrapH} data-testid="touch-slider-edge-focus-forced">
                <TouchSlider
                  defaultValue={60}
                  start={<TouchSliderVolumeIcon />}
                  aria-label="Forced focus state"
                />
              </div>
            </QaNeutralSurfaceFrame>
            <span className={styles.scenarioCellCaption}>focus (data-force-state) — matches Knob focus spec</span>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-surface" title="8 Surface context — code only ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Sliders on <code>&lt;Surface mode=&quot;…&quot;&gt;</code> for token remapping.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {(
              [
                { mode: 'default' as const, label: 'default' },
                { mode: 'subtle' as const, label: 'subtle' },
                { mode: 'bold' as const, label: 'bold' },
              ] as const
            ).map(({ mode, label }) => (
              <div
                key={mode}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{label}</span>
                <Surface
                  mode={mode}
                  appearance="secondary"
                  style={{
                    paddingBlock: 'var(--Spacing-4)',
                    paddingInline: 'var(--Spacing-4-5)',
                    borderRadius: 'var(--Shape-L)',
                  }}
                >
                  <div data-testid={`touch-slider-surface-${mode}`} style={trackWrapH}>
                    <TouchSlider
                      defaultValue={50}
                      appearance="secondary"
                      start={<TouchSliderVolumeIcon />}
                      aria-label={`Touch slider on ${label} surface`}
                    />
                  </div>
                </Surface>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-interaction" title="9 Interaction validations" overflow>
        <p className={styles.storySectionLead}>
          Keyboard (arrows, Home/End), pointer drag on track, and <code>onValueCommitted</code>. Use focused slider
          in tests — hidden thumb still receives focus.
        </p>
        <QaApiSectionBody>
          <TouchSliderInteractionDemo />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="touch-slider-qa-combos" title="10 Combination matrix" overflow>
        <QaApiSectionBody>
          <div style={comboStackStyle}>
            {COMBO_MATRIX.map((row) => (
              <div key={row.testId} style={comboRowStyle}>
                <DemoTouchSlider {...row.props} testId={row.testId} vertical={row.props.orientation === 'vertical'} />
                <span className={styles.scenarioCellCaption} style={{ textAlign: 'left', maxWidth: '100%' }}>
                  {row.caption}
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}

function TouchSliderInteractionDemo() {
  const [value, setValue] = useState(50);
  const [committed, setCommitted] = useState<number | null>(null);

  return (
    <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
      <div data-testid="touch-slider-interaction-demo" style={trackWrapH}>
        <TouchSlider
          value={value}
          onValueChange={(v) => setValue(v as number)}
          onValueCommitted={(v) => setCommitted(v as number)}
          start={<TouchSliderVolumeIcon />}
          aria-label="Interaction demo touch slider"
        />
        <p
          style={{
            margin: 'var(--Spacing-2) 0 0',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-XS-FontSize)',
            lineHeight: 'var(--Label-XS-LineHeight)',
            color: 'var(--Text-Medium)',
          }}
        >
          {`live: ${value}${committed !== null ? ` · last committed: ${committed}` : ''}`}
        </p>
      </div>
    </QaNeutralSurfaceFrame>
  );
}
