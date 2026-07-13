'use client';

/**
 * Slider.showcase.tsx
 * Shared variant displays for Storybook + platform showcase pages.
 */

'use client';

import React from 'react';
import { Slider } from './Slider';
import type { SliderAppearance } from './Slider.shared';
import { IconButton } from '../IconButton';
import { Surface } from '../Surface';

const rowLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Low)',
  minWidth: 'var(--Spacing-12)',
  margin: 0,
};

const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
};

const sliderWrapStyle: React.CSSProperties = {
  width: 328,
  paddingTop: 'var(--Spacing-7)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--Spacing-5)',
};

const APPEARANCES: Exclude<SliderAppearance, 'auto'>[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

export const SliderAppearances: React.FC = () => (
  <div style={stackStyle}>
    {APPEARANCES.map((role) => (
      <div key={role} style={rowStyle}>
        <span style={rowLabelStyle}>{role}</span>
        <div style={sliderWrapStyle}>
          <Slider defaultValue={60} appearance={role} aria-label={`${role} slider`} />
        </div>
      </div>
    ))}
  </div>
);

export const SliderStates: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>default</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={40} aria-label="Default" />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>disabled</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={40} disabled aria-label="Disabled" />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>readOnly</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={40} readOnly aria-label="Read only" />
      </div>
    </div>
  </div>
);

export const SliderTypes: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>continuous</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={60} aria-label="Continuous" />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>range</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={[20, 70]} aria-label="Range" ariaLabels={['Min', 'Max']} />
      </div>
    </div>
  </div>
);

export const SliderKnobStyles: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>outside</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={50} knobStyle="outside" aria-label="Outside" />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>inside</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={50} knobStyle="inside" aria-label="Inside" />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>outside · range</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={[25, 75]} knobStyle="outside" aria-label="Outside range" />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>inside · range</span>
      <div style={sliderWrapStyle}>
        <Slider defaultValue={[25, 75]} knobStyle="inside" aria-label="Inside range" />
      </div>
    </div>
  </div>
);

export const SliderWithSteps: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>snap · 5 steps</span>
      <div style={{ ...sliderWrapStyle, paddingBottom: 'var(--Spacing-4-5)' }}>
        <Slider
          defaultValue={50}
          min={0}
          max={100}
          step={25}
          showSteps
          snapToSteps
          stepLabels={['0', '25', '50', '75', '100']}
          aria-label="Snapping stepped slider"
        />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>free · 5 steps</span>
      <div style={{ ...sliderWrapStyle, paddingBottom: 'var(--Spacing-4-5)' }}>
        <Slider
          defaultValue={50}
          min={0}
          max={100}
          step={25}
          showSteps
          snapToSteps={false}
          stepLabels={['0', '25', '50', '75', '100']}
          aria-label="Free-sliding stepped slider"
        />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>snap · 11 steps</span>
      <div style={sliderWrapStyle}>
        <Slider
          defaultValue={50}
          min={0}
          max={100}
          step={10}
          showSteps
          snapToSteps
          aria-label="10-step snapping slider"
        />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>free · 11 steps</span>
      <div style={sliderWrapStyle}>
        <Slider
          defaultValue={50}
          min={0}
          max={100}
          step={10}
          showSteps
          snapToSteps={false}
          aria-label="10-step free-sliding slider"
        />
      </div>
    </div>
  </div>
);

export const SliderVertical: React.FC = () => (
  <div style={{ ...rowStyle, alignItems: 'flex-start', gap: 'var(--Spacing-7)' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
      <span style={rowLabelStyle}>outside</span>
      <div style={{ height: 200 }}>
        <Slider defaultValue={60} orientation="vertical" knobStyle="outside" aria-label="Vertical outside" />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
      <span style={rowLabelStyle}>inside</span>
      <div style={{ height: 200 }}>
        <Slider defaultValue={60} orientation="vertical" knobStyle="inside" aria-label="Vertical inside" />
      </div>
    </div>
  </div>
);

/** Start / End slots — decrement & increment IconButtons that step the value. */
export const SliderWithSlots: React.FC = () => {
  const [continuousValue, setContinuousValue] = React.useState<number>(50);
  const [rangeValue, setRangeValue] = React.useState<number[]>([25, 75]);
  const step = 5;

  const decrementContinuous = () => setContinuousValue((v) => Math.max(0, v - step));
  const incrementContinuous = () => setContinuousValue((v) => Math.min(100, v + step));
  const decrementRange = () =>
    setRangeValue(([a, b]) => [Math.max(0, a - step), b]);
  const incrementRange = () =>
    setRangeValue(([a, b]) => [a, Math.min(100, b + step)]);

  // IconButton at size="xs" renders a 30px container — fits the Slider's
  // ~36px slot cleanly. `variant="ghost"` keeps the control visually
  // subordinate to the slider itself.
  return (
    <div style={stackStyle}>
      <div style={rowStyle}>
        <span style={rowLabelStyle}>continuous</span>
        <div style={sliderWrapStyle}>
          <Slider
            value={continuousValue}
            onValueChange={(v) => setContinuousValue(v as number)}
            aria-label="Volume"
            start={
              <IconButton
                icon="remove"
                size="xs"
                attention="low"
                aria-label="Decrease"
                onPress={decrementContinuous}
              />
            }
            end={
              <IconButton
                icon="add"
                size="xs"
                attention="low"
                aria-label="Increase"
                onPress={incrementContinuous}
              />
            }
          />
        </div>
      </div>
      <div style={rowStyle}>
        <span style={rowLabelStyle}>range</span>
        <div style={sliderWrapStyle}>
          <Slider
            value={rangeValue}
            onValueChange={(v) => setRangeValue(v as number[])}
            ariaLabels={['Minimum', 'Maximum']}
            start={
              <IconButton
                icon="remove"
                size="xs"
                attention="low"
                aria-label="Decrease minimum"
                onPress={decrementRange}
              />
            }
            end={
              <IconButton
                icon="add"
                size="xs"
                attention="low"
                aria-label="Increase maximum"
                onPress={incrementRange}
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

/** Visual preview of all four interactive knob states (idle/hover/focus/pressed).
 *  Uses [data-force-state] on a wrapper to trigger the styling without needing
 *  real user interaction. Showcase-only. */
export const SliderKnobStates: React.FC = () => {
  const states: Array<{ state?: 'hover' | 'focus' | 'pressed'; label: string }> = [
    { state: undefined, label: 'idle' },
    { state: 'hover', label: 'hover' },
    { state: 'focus', label: 'focus' },
    { state: 'pressed', label: 'pressed' },
  ];

  return (
    <div style={stackStyle}>
      {(['outside', 'inside'] as const).map((knobStyle) => (
        <div key={knobStyle} style={{ ...stackStyle, gap: 'var(--Spacing-4)' }}>
          <span style={{ ...rowLabelStyle, color: 'var(--Text-High)' }}>{`knobStyle: ${knobStyle}`}</span>
          {states.map(({ state, label }) => (
            <div key={label} style={rowStyle}>
              <span style={rowLabelStyle}>{label}</span>
              <div
                data-force-state={state}
                style={sliderWrapStyle}
              >
                <Slider
                  defaultValue={50}
                  knobStyle={knobStyle}
                  aria-label={`${knobStyle} ${label}`}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * Surface context — each row is `<Surface mode="…" appearance="secondary">` so
 * QA sees the real cascade (`data-surface`, `data-surface-step`, token fills).
 * Do not use a raw `div` + `data-surface` only.
 */
export const SliderSurfaceContext: React.FC = () => {
  const rows = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'bold' as const, label: 'bold' },
  ];

  return (
    <div style={stackStyle}>
      {rows.map(({ mode, label }) => (
        <div key={mode} style={rowStyle}>
          <span style={{ ...rowLabelStyle, minWidth: 100 }}>{label}</span>
          <Surface
            mode={mode}
            appearance="secondary"
            style={{
              paddingTop: 'var(--Spacing-7)',
              paddingBottom: 'var(--Spacing-4)',
              paddingInline: 'var(--Spacing-4-5)',
              borderRadius: 'var(--Shape-4)',
              width: 360, // 328px slider + 32px horizontal padding
            }}
          >
            <Slider
              defaultValue={50}
              appearance="secondary"
              aria-label={`Slider on ${label}`}
            />
          </Surface>
        </div>
      ))}
    </div>
  );
};