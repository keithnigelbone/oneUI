'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import { Slider } from '@oneui/ui/components/Slider';
import type {
  SliderAppearance,
  SliderKnobStyle,
  SliderProps,
} from '@oneui/ui/components/Slider';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so Slider tokens remap against the same parent step as Bottom Navigation QA strips.
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

/** Figma track width (328×24 container per spec). */
const TRACK_WIDTH = 328;

const trackWrapStyle: CSSProperties = {
  width: TRACK_WIDTH,
  maxWidth: '100%',
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

/** Figma `appearance` variable modes (+ `auto`). Order matches attached Slider API table. */
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
] as const satisfies readonly SliderAppearance[];

type ComboRow = { caption: string; props: SliderProps; testId: string };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'continuous · outside · secondary · 50',
    testId: 'slider-combo-0',
    props: { defaultValue: 50, knobStyle: 'outside', appearance: 'secondary', 'aria-label': 'Combo continuous outside' },
  },
  {
    caption: 'range · inside · primary · [25, 75]',
    testId: 'slider-combo-1',
    props: {
      defaultValue: [25, 75],
      knobStyle: 'inside',
      appearance: 'primary',
      'aria-label': 'Combo range inside',
      ariaLabels: ['Minimum', 'Maximum'],
    },
  },
  {
    caption: 'continuous · steps · stepCount 5 (step=25)',
    testId: 'slider-combo-2',
    props: {
      defaultValue: 50,
      min: 0,
      max: 100,
      step: 25,
      showSteps: true,
      'aria-label': 'Combo stepped',
    },
  },
  {
    caption: 'range · outside · warning · disabled',
    testId: 'slider-combo-3',
    props: {
      defaultValue: [30, 70],
      appearance: 'warning',
      disabled: true,
      'aria-label': 'Combo range disabled',
    },
  },
  {
    caption: 'continuous · inside · positive · readOnly',
    testId: 'slider-combo-4',
    props: { defaultValue: 40, knobStyle: 'inside', appearance: 'positive', readOnly: true, 'aria-label': 'Combo readOnly' },
  },
  {
    caption: 'continuous · auto · snapToSteps false',
    testId: 'slider-combo-5',
    props: {
      defaultValue: 33,
      appearance: 'auto',
      min: 0,
      max: 100,
      step: 10,
      showSteps: true,
      snapToSteps: false,
      'aria-label': 'Combo free drag',
    },
  },
];

function DemoSlider({
  testId,
  ...props
}: SliderProps & { testId?: string }) {
  return (
    <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
      <div data-testid={testId} style={trackWrapStyle}>
        <Slider {...props} />
      </div>
    </QaNeutralSurfaceFrame>
  );
}

/**
 * Figma component-set default (attached API table): continuous, knobStyle inside,
 * appearance secondary, steps false, start/end IconButton. Slots must wire onPress
 * to controlled value — not automatic on Slider.
 */
function SliderFigmaDefaultDemo() {
  const [value, setValue] = useState(50);
  const step = 5;

  return (
    <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
      <div data-testid="slider-default" style={trackWrapStyle}>
        <Slider
          value={value}
          onValueChange={(v) => setValue(v as number)}
          appearance="secondary"
          knobStyle="inside"
          showSteps={false}
          aria-label="Default slider (Figma defaults)"
          start={
            <IconButton
              icon="remove"
              size="xs"
              attention="low"
              aria-label="Decrease"
              onPress={() => setValue((v) => Math.max(0, v - step))}
            />
          }
          end={
            <IconButton
              icon="add"
              size="xs"
              attention="low"
              aria-label="Increase"
              onPress={() => setValue((v) => Math.min(100, v + step))}
            />
          }
        />
      </div>
    </QaNeutralSurfaceFrame>
  );
}

/** Shipped React default when knobStyle is omitted (`Slider.shared.ts` → outside, ≠ Figma). */
function SliderCodeShippedDefaultDemo() {
  return (
    <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
      <div data-testid="slider-code-default-outside" style={trackWrapStyle}>
        <Slider defaultValue={50} aria-label="Code shipped default (no knobStyle prop)" />
      </div>
    </QaNeutralSurfaceFrame>
  );
}

/** Interactive start/end slot rows (IconButton stepping). */
function SliderSlotIconButtonDemos() {
  const [continuousValue, setContinuousValue] = useState(50);
  const [insideValue, setInsideValue] = useState(50);
  const [rangeValue, setRangeValue] = useState<number[]>([25, 75]);
  const step = 5;

  return (
    <div className={styles.scenarioFlexRow}>
      <div className={styles.scenarioLabeledCell}>
        <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
          <div data-testid="slider-start-end-iconbutton-continuous" style={trackWrapStyle}>
            <Slider
              value={continuousValue}
              onValueChange={(v) => setContinuousValue(v as number)}
              aria-label="Volume with IconButtons"
              start={
                <IconButton
                  icon="remove"
                  size="xs"
                  attention="low"
                  aria-label="Decrease"
                  onPress={() => setContinuousValue((v) => Math.max(0, v - step))}
                />
              }
              end={
                <IconButton
                  icon="add"
                  size="xs"
                  attention="low"
                  aria-label="Increase"
                  onPress={() => setContinuousValue((v) => Math.min(100, v + step))}
                />
              }
            />
          </div>
        </QaNeutralSurfaceFrame>
        <span className={styles.scenarioCellCaption}>start/end: IconButton · continuous</span>
      </div>
      <div className={styles.scenarioLabeledCell}>
        <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
          <div data-testid="slider-start-end-iconbutton-range" style={trackWrapStyle}>
            <Slider
              value={rangeValue}
              onValueChange={(v) => setRangeValue(v as number[])}
              aria-label="Range with IconButtons"
              ariaLabels={['Minimum', 'Maximum']}
              start={
                <IconButton
                  icon="remove"
                  size="xs"
                  attention="low"
                  aria-label="Decrease minimum"
                  onPress={() => setRangeValue(([a, b]) => [Math.max(0, a - step), b])}
                />
              }
              end={
                <IconButton
                  icon="add"
                  size="xs"
                  attention="low"
                  aria-label="Increase maximum"
                  onPress={() => setRangeValue(([a, b]) => [a, Math.min(100, b + step)])}
                />
              }
            />
          </div>
        </QaNeutralSurfaceFrame>
        <span className={styles.scenarioCellCaption}>start/end: IconButton · range</span>
      </div>
      <div className={styles.scenarioLabeledCell}>
        <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
          <div data-testid="slider-start-end-iconbutton-inside" style={trackWrapStyle}>
            <Slider
              value={insideValue}
              onValueChange={(v) => setInsideValue(v as number)}
              knobStyle="inside"
              aria-label="Volume with IconButtons, inside knob"
              start={
                <IconButton
                  icon="remove"
                  size="xs"
                  attention="low"
                  aria-label="Decrease"
                  onPress={() => setInsideValue((v) => Math.max(0, v - step))}
                />
              }
              end={
                <IconButton
                  icon="add"
                  size="xs"
                  attention="low"
                  aria-label="Increase"
                  onPress={() => setInsideValue((v) => Math.min(100, v + step))}
                />
              }
            />
          </div>
        </QaNeutralSurfaceFrame>
        <span className={styles.scenarioCellCaption}>start/end: IconButton · inside · continuous</span>
      </div>
    </div>
  );
}

/**
 * Slider QA playground — Figma API sections, code-only notes, combination matrix.
 * `data-testid` wraps the 328px track container (Slider root does not forward test ids).
 */
export function SliderQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="slider-qa-default" title="Default (Figma API table)" centerContent overflow>
        <p className={styles.storySectionLead}>
          Figma defaults: <code>type</code> continuous, <code>knobStyle</code> <strong>inside</strong> (explicit in QA —{' '}
          code default is <code>outside</code> when omitted), <code>appearance</code> secondary, <code>steps</code> false,{' '}
          <code>start</code> / <code>end</code> IconButton (slots wired in QA; not automatic on <code>Slider</code>). Second row:{' '}
          shipped code with no <code>knobStyle</code> prop.
        </p>
        <QaApiSectionBody>
          <SliderFigmaDefaultDemo />
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div className={styles.scenarioLabeledCell}>
            <SliderCodeShippedDefaultDemo />
            <span className={styles.scenarioCellCaption}>
              Code shipped default (no knobStyle) → outside ⚠️ · no slots
            </span>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-type" title="1 type (continuous · range)" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>type</code> maps to thumb count: <code>continuous</code> → single <code>number</code> value;{' '}
          <code>range</code> → <code>number[]</code> with two thumbs (<code>SliderTypes</code> in{' '}
          <code>Slider.showcase.tsx</code>). Code uses <code>defaultValue</code> / <code>value</code> shape, not a{' '}
          <code>type</code> prop.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider defaultValue={60} testId="slider-type-continuous" aria-label="Continuous slider" />
              <span className={styles.scenarioCellCaption}>type: continuous</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider
                defaultValue={[20, 70]}
                testId="slider-type-range"
                aria-label="Range slider"
                ariaLabels={['Minimum', 'Maximum']}
              />
              <span className={styles.scenarioCellCaption}>type: range</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-knob-style" title="2 knobStyle (inside · outside)" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>knobStyle</code> ↔ code <code>knobStyle</code> (Figma <code>inside</code>, code default <code>outside</code> ⚠️). See{' '}
          <code>SliderKnobStyles</code> in <code>Slider.showcase.tsx</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['outside', 'inside'] as const satisfies readonly SliderKnobStyle[]).map((knobStyle) => (
              <div key={knobStyle} className={styles.scenarioLabeledCell}>
                <DemoSlider
                  defaultValue={50}
                  knobStyle={knobStyle}
                  testId={`slider-knob-${knobStyle}`}
                  aria-label={`Knob style ${knobStyle}`}
                />
                <span className={styles.scenarioCellCaption}>{`knobStyle: ${knobStyle}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['outside', 'inside'] as const).map((knobStyle) => (
              <div key={`range-${knobStyle}`} className={styles.scenarioLabeledCell}>
                <DemoSlider
                  defaultValue={[25, 75]}
                  knobStyle={knobStyle}
                  testId={`slider-knob-range-${knobStyle}`}
                  aria-label={`Range knob ${knobStyle}`}
                />
                <span className={styles.scenarioCellCaption}>{`knobStyle: ${knobStyle} · range`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-appearance" title="3 appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>Slider.stories.tsx</code> Appearances — one slider per role at value 60. Code also supports{' '}
          <code>brand-bg</code> (not in this Figma table) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <DemoSlider
                  appearance={appearance}
                  defaultValue={60}
                  testId={`slider-appearance-${appearance}`}
                  aria-label={`${appearance} slider`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <DemoSlider
              appearance="brand-bg"
              defaultValue={60}
              testId="slider-appearance-brand-bg"
              aria-label="brand-bg slider"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-steps" title="4 steps · stepCount" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>steps</code> ↔ code <code>showSteps</code>. Figma <code>stepCount</code> is not a prop — derive tick
          count from <code>(max − min) / step + 1</code> via <code>min</code>, <code>max</code>, and <code>step</code> (
          <code>SliderWithSteps</code>). Use <code>step=10</code> for 11 ticks (0–100); <code>step=1</code> exceeds the
          64-tick guard and renders no marks.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider defaultValue={50} showSteps={false} testId="slider-steps-false" aria-label="No step marks" />
              <span className={styles.scenarioCellCaption}>steps: false (showSteps=false)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider
                defaultValue={50}
                min={0}
                max={100}
                step={25}
                showSteps
                snapToSteps
                testId="slider-steps-true-stepcount-5"
                aria-label="Five step marks"
              />
              <span className={styles.scenarioCellCaption}>steps: true · stepCount: 5 (step=25)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider
                defaultValue={50}
                min={0}
                max={100}
                step={10}
                showSteps
                snapToSteps
                testId="slider-steps-true-stepcount-11"
                aria-label="Eleven step marks"
              />
              <span className={styles.scenarioCellCaption}>steps: true · stepCount: 11 (step=10)</span>
            </div>
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Code-only: <code>snapToSteps</code> (default <code>true</code>) — when <code>false</code>, drag is continuous but
          ticks stay at <code>step</code> positions (<code>SliderWithSteps</code> “free” row).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider
                defaultValue={50}
                min={0}
                max={100}
                step={25}
                showSteps
                snapToSteps={false}
                testId="slider-snap-false"
                aria-label="Free drag with ticks"
              />
              <span className={styles.scenarioCellCaption}>snapToSteps: false ⚠️</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-start-end" title="5 start · end (none · Icon · IconButton)" overflow>
        <p className={styles.storySectionLead}>
          Figma slot values <code>none</code>, <code>Icon</code>, <code>IconButton</code> map to optional{' '}
          <code>start</code> / <code>end</code> <code>ReactNode</code> slots (30×30 per spec). Omit both for{' '}
          <code>none</code>. The <code>Slider</code> does not wire slots to value — pair controlled{' '}
          <code>value</code> / <code>onValueChange</code> with <code>IconButton</code> <code>onPress</code> (see{' '}
          <code>SliderWithSlots</code> in <code>Slider.showcase.tsx</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider defaultValue={50} testId="slider-start-end-none" aria-label="No start or end slots" />
              <span className={styles.scenarioCellCaption}>start/end: none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
                <div data-testid="slider-start-end-icon" style={trackWrapStyle}>
                  <Slider
                    defaultValue={50}
                    aria-label="Slider with decorative icons"
                    start={<Icon name="remove" size="5" aria-hidden />}
                    end={<Icon name="add" size="5" aria-hidden />}
                  />
                </div>
              </QaNeutralSurfaceFrame>
              <span className={styles.scenarioCellCaption}>start/end: Icon (decorative)</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <SliderSlotIconButtonDemos />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-value" title="6 value — code only (Figma)" overflow>
        <p className={styles.storySectionLead}>
          Figma <strong>Code only</strong> row: <code>value</code> is <code>number</code> (continuous) or{' '}
          <code>[number, number]</code> (range). Use controlled <code>value</code> + <code>onValueChange</code> for live
          QA; uncontrolled demos use <code>defaultValue</code> elsewhere on this page.
        </p>
        <QaApiSectionBody>
          <SliderControlledValueDemo />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-extra-states" title="7 disabled · readOnly · orientation · tooltip — not in attached Figma table ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Present in <code>SliderProps</code> / <code>Slider.stories.tsx</code> but absent from the attached Figma property
          sheet.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider disabled defaultValue={40} testId="slider-disabled" aria-label="Disabled slider" />
              <span className={styles.scenarioCellCaption}>disabled ⚠️</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider readOnly defaultValue={40} testId="slider-readonly" aria-label="Read-only slider" />
              <span className={styles.scenarioCellCaption}>readOnly ⚠️</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaNeutralSurfaceFrame>
                <div data-testid="slider-orientation-vertical" style={{ height: 'var(--Spacing-40)' }}>
                  <Slider
                    defaultValue={60}
                    orientation="vertical"
                    knobStyle="outside"
                    aria-label="Vertical outside"
                  />
                </div>
              </QaNeutralSurfaceFrame>
              <span className={styles.scenarioCellCaption}>orientation: vertical ⚠️</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DemoSlider
                defaultValue={45}
                showTooltip="always"
                testId="slider-tooltip-always"
                aria-label="Tooltip always visible"
              />
              <span className={styles.scenarioCellCaption}>showTooltip: always ⚠️</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-surface-context" title="8 Surface context — not in attached Figma table ⚠️" overflow>
        <p className={styles.storySectionLead}>
          From <code>SliderSurfaceContext</code> — sliders inside <code>&lt;Surface mode=&quot;…&quot;&gt;</code> so tokens
          remap via <code>[data-surface]</code>.
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
                  <div data-testid={`slider-surface-${mode}`} style={trackWrapStyle}>
                    <Slider defaultValue={50} appearance="secondary" aria-label={`Slider on ${label} surface`} />
                  </div>
                </Surface>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="slider-qa-combos" title="9 Combination matrix" overflow>
        <p className={styles.storySectionLead}>
          Sliders use a 328px Figma track — stacked full-width rows (not <code>scenarioComboGrid</code>) so range
          fills and thumbs do not overlap adjacent cells.
        </p>
        <QaApiSectionBody>
          <div style={comboStackStyle}>
            {COMBO_MATRIX.map((row) => (
              <div key={row.testId} style={comboRowStyle}>
                <DemoSlider {...row.props} testId={row.testId} />
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

/** Controlled `value` band for the Figma code-only row. */
function SliderControlledValueDemo() {
  const [single, setSingle] = useState(35);
  const [range, setRange] = useState<number[]>([20, 80]);

  return (
    <div className={styles.scenarioFlexRow}>
      <div className={styles.scenarioLabeledCell}>
        <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
          <div data-testid="slider-value-controlled-single" style={trackWrapStyle}>
            <Slider
              value={single}
              onValueChange={(v) => setSingle(v as number)}
              aria-label="Controlled continuous value"
            />
          </div>
        </QaNeutralSurfaceFrame>
        <span className={styles.scenarioCellCaption}>{`value: ${single} (number)`}</span>
      </div>
      <div className={styles.scenarioLabeledCell}>
        <QaNeutralSurfaceFrame style={{ width: '100%', alignSelf: 'stretch' }}>
          <div data-testid="slider-value-controlled-range" style={trackWrapStyle}>
            <Slider
              value={range}
              onValueChange={(v) => setRange(v as number[])}
              aria-label="Controlled range value"
              ariaLabels={['Min value', 'Max value']}
            />
          </div>
        </QaNeutralSurfaceFrame>
        <span className={styles.scenarioCellCaption}>{`value: [${range.join(', ')}]`}</span>
      </div>
    </div>
  );
}
