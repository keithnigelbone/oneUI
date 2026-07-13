/**
 * TouchSlider.showcase.tsx — single size.
 */

'use client';

import React from 'react';
import { TouchSlider } from './TouchSlider';
import type { TouchSliderAppearance } from './TouchSlider.shared';
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

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--Spacing-5)',
};

const APPEARANCES: Exclude<TouchSliderAppearance, 'auto'>[] = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
];

const VolumeIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 7.5v5h3.333L10 16V4L6.333 7.5H3Z" fill="currentColor" />
    <path d="M13 7a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MuteIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M3 7.5v5h3.333L10 16V4L6.333 7.5H3Z" fill="currentColor" />
    <line x1="13" y1="7" x2="17" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="7" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const TouchSliderProgressStyles: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>rounded 0</span>
      <TouchSlider defaultValue={0} progressStyle="rounded" start={<VolumeIcon />} aria-label="Rounded at zero" />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>rounded 50</span>
      <TouchSlider defaultValue={50} progressStyle="rounded" start={<VolumeIcon />} aria-label="Rounded at half" />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>rounded 100</span>
      <TouchSlider defaultValue={100} progressStyle="rounded" start={<VolumeIcon />} aria-label="Rounded at max" />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>sharp 0</span>
      <TouchSlider defaultValue={0} progressStyle="sharp" start={<VolumeIcon />} aria-label="Sharp at zero" />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>sharp 50</span>
      <TouchSlider defaultValue={50} progressStyle="sharp" start={<VolumeIcon />} aria-label="Sharp at half" />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>sharp 100</span>
      <TouchSlider defaultValue={100} progressStyle="sharp" start={<VolumeIcon />} aria-label="Sharp at max" />
    </div>
  </div>
);

const matrixCellStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-2)',
};

const matrixLabelStyle: React.CSSProperties = {
  ...rowLabelStyle,
  minWidth: 0,
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  textAlign: 'center',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
  margin: 0,
  textAlign: 'center',
};

/** Figma slot-position matrix — start icon must stay fixed at the cap centre. */
export const TouchSliderSlotMatrix: React.FC = () => {
  const values = [0, 50, 100] as const;
  const configs = [
    { progressStyle: 'rounded' as const, orientation: 'horizontal' as const },
    { progressStyle: 'rounded' as const, orientation: 'vertical' as const },
    { progressStyle: 'sharp' as const, orientation: 'horizontal' as const },
    { progressStyle: 'sharp' as const, orientation: 'vertical' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-8)' }}>
      {configs.map(({ progressStyle, orientation }) => (
        <div key={`${progressStyle}-${orientation}`}>
          <p style={{ ...sectionTitleStyle, marginBlockEnd: 'var(--Spacing-4)' }}>
            {progressStyle} · {orientation}
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--Spacing-6)',
              alignItems: 'flex-end',
            }}
          >
            {values.map((value) => (
              <div key={value} style={matrixCellStyle}>
                <TouchSlider
                  defaultValue={value}
                  progressStyle={progressStyle}
                  orientation={orientation}
                  start={<VolumeIcon />}
                  aria-label={`${progressStyle} ${orientation} ${value}`}
                />
                <span style={matrixLabelStyle}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const TouchSliderWithSlots: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>start slot</span>
      <TouchSlider
        defaultValue={60}
        start={<VolumeIcon />}
        aria-label="Volume with icon"
      />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>no slots</span>
      <TouchSlider defaultValue={60} aria-label="Volume no icon" />
    </div>
  </div>
);

export const TouchSliderAppearances: React.FC = () => (
  <div style={stackStyle}>
    {APPEARANCES.map((role) => (
      <div key={role} style={rowStyle}>
        <span style={rowLabelStyle}>{role}</span>
        <TouchSlider defaultValue={60} appearance={role} aria-label={`${role} touch`} />
      </div>
    ))}
  </div>
);

export const TouchSliderStates: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>default</span>
      <TouchSlider defaultValue={60} aria-label="Default" />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>disabled</span>
      <TouchSlider defaultValue={60} disabled aria-label="Disabled" />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>readOnly</span>
      <TouchSlider defaultValue={60} readOnly aria-label="Read only" />
    </div>
  </div>
);

const columnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-4-5)',
};

const verticalCellStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-2)',
};

const verticalLabelStyle: React.CSSProperties = {
  ...rowLabelStyle,
  minWidth: 0,
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  textAlign: 'center',
  maxWidth: 'var(--Spacing-14)',
};

type VerticalShowcaseConfig = {
  label: string;
  progressStyle?: 'rounded' | 'sharp';
  defaultValue: number;
  start?: React.ReactNode;
};

const VERTICAL_PROGRESS_ROWS: VerticalShowcaseConfig[] = [
  { label: 'rounded 0', progressStyle: 'rounded', defaultValue: 0, start: <VolumeIcon /> },
  { label: 'rounded 50', progressStyle: 'rounded', defaultValue: 50, start: <VolumeIcon /> },
  { label: 'rounded 100', progressStyle: 'rounded', defaultValue: 100, start: <VolumeIcon /> },
  { label: 'sharp 0', progressStyle: 'sharp', defaultValue: 0, start: <VolumeIcon /> },
  { label: 'sharp 50', progressStyle: 'sharp', defaultValue: 50, start: <VolumeIcon /> },
  { label: 'sharp 100', progressStyle: 'sharp', defaultValue: 100, start: <VolumeIcon /> },
];

const VERTICAL_SLOT_ROWS: VerticalShowcaseConfig[] = [
  { label: 'no slots', defaultValue: 60 },
  { label: 'start', defaultValue: 60, start: <VolumeIcon /> },
  { label: 'start @ 0', defaultValue: 0, start: <MuteIcon /> },
  { label: 'start @ 100', defaultValue: 100, start: <VolumeIcon /> },
];

const VERTICAL_STYLE_SLOT_ROWS: VerticalShowcaseConfig[] = [
  { label: 'rounded + start', progressStyle: 'rounded', defaultValue: 60, start: <VolumeIcon /> },
  { label: 'sharp + start', progressStyle: 'sharp', defaultValue: 60, start: <VolumeIcon /> },
];

function renderVerticalCell({
  label,
  progressStyle = 'rounded',
  defaultValue,
  start,
}: VerticalShowcaseConfig) {
  return (
    <div key={label} style={verticalCellStyle}>
      <TouchSlider
        defaultValue={defaultValue}
        orientation="vertical"
        progressStyle={progressStyle}
        start={start}
        aria-label={`Vertical ${label}`}
      />
      <span style={verticalLabelStyle}>{label}</span>
    </div>
  );
}

export const TouchSliderVertical: React.FC = () => (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--Spacing-10)',
      alignItems: 'flex-start',
      justifyContent: 'center',
    }}
  >
    <div style={columnStyle}>
      <p style={sectionTitleStyle}>Progress × value</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, auto)',
          gap: 'var(--Spacing-6)',
          alignItems: 'end',
        }}
      >
        {VERTICAL_PROGRESS_ROWS.map(renderVerticalCell)}
      </div>
    </div>

    <div style={columnStyle}>
      <p style={sectionTitleStyle}>Slot combinations</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, auto)',
          gap: 'var(--Spacing-6)',
          alignItems: 'end',
        }}
      >
        {VERTICAL_SLOT_ROWS.map(renderVerticalCell)}
      </div>
    </div>

    <div style={columnStyle}>
      <p style={sectionTitleStyle}>Progress × slots</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, auto)',
          gap: 'var(--Spacing-6)',
          alignItems: 'end',
        }}
      >
        {VERTICAL_STYLE_SLOT_ROWS.map(renderVerticalCell)}
      </div>
    </div>
  </div>
);

/**
 * Surface context — `<Surface mode="…" appearance="…">` rows so QA sees the real
 * cascade (`data-surface`, token fills, rail remapping). Do not use a raw
 * `div` + `data-surface` only.
 */
const surfaceShellStyle: React.CSSProperties = {
  paddingBlock: 'var(--Spacing-4)',
  paddingInline: 'var(--Spacing-4-5)',
  borderRadius: 'var(--Shape-4)',
  width: 'fit-content',
};

const surfaceSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
};

const surfaceSectionLabelStyle: React.CSSProperties = {
  ...sectionTitleStyle,
  textAlign: 'start',
  marginBlockEnd: 'var(--Spacing-1)',
};

type SurfaceMode = 'default' | 'minimal' | 'subtle' | 'bold';
type SurfaceAppearance = Exclude<TouchSliderAppearance, 'auto'>;

type SurfaceContextCase = {
  label: string;
  surfaceMode: SurfaceMode;
  surfaceAppearance: SurfaceAppearance;
  sliderAppearance: SurfaceAppearance;
  progressStyle?: 'rounded' | 'sharp';
  defaultValue?: number;
  orientation?: 'horizontal' | 'vertical';
  withSlots?: boolean;
};

function SurfaceContextRow({
  label,
  surfaceMode,
  surfaceAppearance,
  sliderAppearance,
  progressStyle = 'rounded',
  defaultValue = 60,
  orientation = 'horizontal',
  withSlots = true,
}: SurfaceContextCase) {
  return (
    <div style={rowStyle}>
      <span style={{ ...rowLabelStyle, minWidth: 'var(--Spacing-20)' }}>{label}</span>
      <Surface mode={surfaceMode} appearance={surfaceAppearance} style={surfaceShellStyle}>
        <TouchSlider
          defaultValue={defaultValue}
          appearance={sliderAppearance}
          progressStyle={progressStyle}
          orientation={orientation}
          start={withSlots ? <MuteIcon /> : undefined}
          aria-label={`${label}: surface ${surfaceAppearance}, slider ${sliderAppearance}`}
        />
      </Surface>
    </div>
  );
}

function SurfaceContextSection({
  title,
  cases,
}: {
  title: string;
  cases: SurfaceContextCase[];
}) {
  return (
    <section style={surfaceSectionStyle}>
      <p style={surfaceSectionLabelStyle}>{title}</p>
      {cases.map((config) => (
        <SurfaceContextRow key={config.label} {...config} />
      ))}
    </section>
  );
}

const SURFACE_MODE_CASES: SurfaceContextCase[] = [
  {
    label: 'default · secondary',
    surfaceMode: 'default',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'secondary',
  },
  {
    label: 'minimal · secondary',
    surfaceMode: 'minimal',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'secondary',
  },
  {
    label: 'subtle · secondary',
    surfaceMode: 'subtle',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'secondary',
  },
  {
    label: 'bold · secondary',
    surfaceMode: 'bold',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'secondary',
  },
];

const SURFACE_APPEARANCE_CASES: SurfaceContextCase[] = [
  {
    label: 'bold · primary',
    surfaceMode: 'bold',
    surfaceAppearance: 'primary',
    sliderAppearance: 'primary',
  },
  {
    label: 'bold · sparkle',
    surfaceMode: 'bold',
    surfaceAppearance: 'sparkle',
    sliderAppearance: 'sparkle',
  },
  {
    label: 'subtle · positive',
    surfaceMode: 'subtle',
    surfaceAppearance: 'positive',
    sliderAppearance: 'positive',
  },
  {
    label: 'subtle · negative',
    surfaceMode: 'subtle',
    surfaceAppearance: 'negative',
    sliderAppearance: 'negative',
  },
  {
    label: 'minimal · warning',
    surfaceMode: 'minimal',
    surfaceAppearance: 'warning',
    sliderAppearance: 'warning',
  },
  {
    label: 'minimal · informative',
    surfaceMode: 'minimal',
    surfaceAppearance: 'informative',
    sliderAppearance: 'informative',
  },
];

const SHARP_ON_SURFACE_CASES: SurfaceContextCase[] = [
  {
    label: 'sharp · subtle secondary',
    surfaceMode: 'subtle',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'secondary',
    progressStyle: 'sharp',
  },
  {
    label: 'sharp · bold primary',
    surfaceMode: 'bold',
    surfaceAppearance: 'primary',
    sliderAppearance: 'primary',
    progressStyle: 'sharp',
  },
  {
    label: 'sharp @ 0 · bold',
    surfaceMode: 'bold',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'secondary',
    progressStyle: 'sharp',
    defaultValue: 0,
  },
  {
    label: 'sharp · vertical subtle',
    surfaceMode: 'subtle',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'secondary',
    progressStyle: 'sharp',
    orientation: 'vertical',
  },
];

/** Surface appearance ≠ slider appearance — rail follows surface, fill follows slider. */
const APPEARANCE_MISMATCH_CASES: SurfaceContextCase[] = [
  {
    label: 'surface primary · slider secondary',
    surfaceMode: 'bold',
    surfaceAppearance: 'primary',
    sliderAppearance: 'secondary',
  },
  {
    label: 'surface secondary · slider primary',
    surfaceMode: 'bold',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'primary',
  },
  {
    label: 'surface positive · slider negative',
    surfaceMode: 'subtle',
    surfaceAppearance: 'positive',
    sliderAppearance: 'negative',
  },
  {
    label: 'surface sparkle · slider informative',
    surfaceMode: 'subtle',
    surfaceAppearance: 'sparkle',
    sliderAppearance: 'informative',
  },
  {
    label: 'sharp mismatch · bold neutral / primary',
    surfaceMode: 'bold',
    surfaceAppearance: 'neutral',
    sliderAppearance: 'primary',
    progressStyle: 'sharp',
  },
  {
    label: 'vertical mismatch · subtle secondary / sparkle',
    surfaceMode: 'subtle',
    surfaceAppearance: 'secondary',
    sliderAppearance: 'sparkle',
    orientation: 'vertical',
  },
];

export const TouchSliderSurfaceContext: React.FC = () => (
  <div style={{ ...stackStyle, gap: 'var(--Spacing-8)' }}>
    <SurfaceContextSection title="Surface modes (matched secondary)" cases={SURFACE_MODE_CASES} />
    <SurfaceContextSection title="Surface appearances (matched)" cases={SURFACE_APPEARANCE_CASES} />
    <SurfaceContextSection title="Sharp edge on tinted surfaces" cases={SHARP_ON_SURFACE_CASES} />
    <SurfaceContextSection
      title="Surface vs slider appearance mismatch"
      cases={APPEARANCE_MISMATCH_CASES}
    />
  </div>
);

/** Comprehensive state matrix — idle, focus (forced), disabled, readOnly.
 *  Mirrors the SliderKnobStates pattern: `[data-force-state="focus"]` wrapper
 *  triggers the focus halo without real keyboard/pointer input, matching
 *  Figma's focus spec. */
export const TouchSliderFocusState: React.FC = () => (
  <div style={stackStyle}>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>idle</span>
      <TouchSlider
        defaultValue={60}
        start={<MuteIcon />}
        aria-label="Idle"
      />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>focus</span>
      <div data-force-state="focus" style={{ display: 'inline-flex' }}>
        <TouchSlider
          defaultValue={60}
          start={<MuteIcon />}
          aria-label="Focused"
        />
      </div>
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>disabled</span>
      <TouchSlider
        defaultValue={60}
        disabled
        start={<MuteIcon />}
        aria-label="Disabled"
      />
    </div>
    <div style={rowStyle}>
      <span style={rowLabelStyle}>readOnly</span>
      <TouchSlider
        defaultValue={60}
        readOnly
        start={<MuteIcon />}
        aria-label="Read only"
      />
    </div>
  </div>
);
