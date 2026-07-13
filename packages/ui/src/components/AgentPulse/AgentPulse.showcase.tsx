/**
 * AgentPulse.showcase.tsx
 * Reusable showcase cells — shared between Storybook stories and the
 * platform documentation page for zero-duplication.
 */

import React from 'react';
import { AgentPulse } from './AgentPulse';
import { Surface } from '../Surface';
import {
  AGENT_PULSE_APPEARANCES,
  AGENT_PULSE_EMPHASIS_LEVELS,
  AGENT_PULSE_SIZES,
  AGENT_PULSE_STATES,
  type AgentPulseDimensionSize,
  type AgentPulseLegacySize,
  type AgentPulseState,
} from './AgentPulse.shared';

const cellStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--Spacing-3)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Low)',
  textTransform: 'capitalize',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--Spacing-6)',
  flexWrap: 'wrap',
};

const surfaceBoxStyle: React.CSSProperties = {
  padding: 'var(--Spacing-5)',
  borderRadius: 'var(--Shape-4)',
};

const SIZES: Array<{ size: AgentPulseDimensionSize | AgentPulseLegacySize; label: string }> = [
  { size: 'sm', label: 'sm' },
  { size: 'md', label: 'md' },
  { size: 'lg', label: 'lg' },
  { size: 'xl', label: 'xl' },
  { size: '8', label: '8' },
  { size: '16', label: '16' },
];

const ALL_DIMENSION_SIZES: Array<{ size: AgentPulseDimensionSize; label: string }> =
  AGENT_PULSE_SIZES.map((size) => ({ size, label: size }));

const STATES: AgentPulseState[] = [...AGENT_PULSE_STATES];

/** All four states at default props (secondary, tinted, md). */
export const AgentPulseDefault: React.FC = () => (
  <div style={rowStyle}>
    {STATES.map((state) => (
      <div key={state} style={cellStyle}>
        <AgentPulse state={state} />
        <span style={labelStyle}>{state}</span>
      </div>
    ))}
  </div>
);

/** All four states at default size. */
export const AgentPulseStates: React.FC = () => (
  <div style={rowStyle}>
    {STATES.map((state) => (
      <div key={state} style={cellStyle}>
        <AgentPulse state={state} size="lg" />
        <span style={labelStyle}>{state}</span>
      </div>
    ))}
  </div>
);

/** Legacy + subset of Figma dimension sizes. */
export const AgentPulseSizes: React.FC = () => (
  <div style={rowStyle}>
    {SIZES.map(({ size, label }) => (
      <div key={label} style={cellStyle}>
        <AgentPulse state="thinking" size={size} />
        <span style={labelStyle}>{label}</span>
      </div>
    ))}
  </div>
);

/** All 20 Figma dimension-token sizes — two horizontal rows. */
export const AgentPulseSizesFull: React.FC = () => {
  const midpoint = Math.ceil(ALL_DIMENSION_SIZES.length / 2);
  const rows = [
    ALL_DIMENSION_SIZES.slice(0, midpoint),
    ALL_DIMENSION_SIZES.slice(midpoint),
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-8)',
        alignItems: 'center',
      }}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            ...rowStyle,
            flexWrap: 'nowrap',
            justifyContent: 'center',
          }}
        >
          {row.map(({ size, label }) => (
            <div key={label} style={cellStyle}>
              <AgentPulse state="thinking" size={size} />
              <span style={labelStyle}>{label}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

/** Tinted emphasis levels across Figma appearance roles. */
export const AgentPulseEmphasis: React.FC = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${AGENT_PULSE_APPEARANCES.length}, auto)`,
      gap: 'var(--Spacing-8)',
    }}
  >
    {AGENT_PULSE_EMPHASIS_LEVELS.map((emphasis) => (
      <div
        key={emphasis}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}
      >
        <span
          style={{
            ...labelStyle,
            textTransform: 'none',
            fontWeight: 'var(--Label-FontWeight-Medium)',
            color: 'var(--Text-Medium)',
          }}
        >
          {emphasis}
        </span>
        <div style={rowStyle}>
          {AGENT_PULSE_APPEARANCES.map((appearance) => (
            <div key={appearance} style={cellStyle}>
              <AgentPulse
                state="thinking"
                appearance={appearance}
                emphasis={emphasis}
                size="lg"
              />
              <span style={labelStyle}>{appearance}</span>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Surface-context demo — the same AgentPulse on each surface mode.
 * Brand colour is role-scoped so it adapts on coloured backgrounds.
 */
export const AgentPulseSurfaceContext: React.FC = () => (
  <div style={{ ...rowStyle, gap: 'var(--Spacing-7)' }}>
    <div style={cellStyle}>
      <AgentPulse state="thinking" size="lg" />
      <span style={labelStyle}>Default</span>
    </div>

    <Surface mode="subtle" style={surfaceBoxStyle}>
      <div style={cellStyle}>
        <AgentPulse state="thinking" size="lg" />
        <span style={labelStyle}>Subtle</span>
      </div>
    </Surface>

    <Surface mode="bold" style={surfaceBoxStyle}>
      <div style={cellStyle}>
        <AgentPulse state="thinking" size="lg" />
        <span style={{ ...labelStyle, color: 'inherit', opacity: 0.75 }}>Bold</span>
      </div>
    </Surface>
  </div>
);
