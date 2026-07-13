/**
 * Scrim.showcase.tsx
 * Shared variant displays — imported by Storybook and platform docs (Button pattern).
 * Preview cells are transparent Figma ComponentBGCell positioning boxes — no fill.
 */

import React from 'react';
import { Scrim } from './Scrim';
import type { ScrimAttention, ScrimPosition, ScrimSize, ScrimVariant } from './Scrim.shared';
import styles from './Scrim.module.css';

function ScrimPreview({
  label,
  ...props
}: {
  label: string;
  position?: ScrimPosition;
  size?: ScrimSize;
  attention?: ScrimAttention;
  variant?: ScrimVariant;
}) {
  return (
    <div className={styles.previewRow}>
      <span className={styles.previewLabel}>{label}</span>
      <div className={styles.previewFrame} data-testid={`scrim-preview-${label}`}>
        {props.variant === 'overlay' ? (
          <Scrim variant="overlay" attention={props.attention} />
        ) : (
          <Scrim
            variant="gradient"
            position={props.position}
            size={props.size}
            attention={props.attention}
          />
        )}
      </div>
    </div>
  );
}

/** Shared frame for Storybook / platform docs — fixed square, centered. */
export function ScrimPreviewFrame({ children }: { children: React.ReactNode }) {
  return <div className={styles.previewFrame}>{children}</div>;
}

/** Figma default symbol 4301:4757 — bottom · S · medium · gradient. */
export function ScrimDefault() {
  return (
    <ScrimPreviewFrame>
      <Scrim position="bottom" size="s" attention="medium" variant="gradient" />
    </ScrimPreviewFrame>
  );
}

/** Bottom-anchored gradient scrims at each Figma size (XS–XL). */
export function ScrimSizes() {
  return (
    <div className={styles.previewColumn}>
      {(['xs', 's', 'm', 'l', 'xl'] as const).map((size) => (
        <ScrimPreview
          key={size}
          label={`Size ${size.toUpperCase()}`}
          position="bottom"
          size={size}
          attention="medium"
          variant="gradient"
        />
      ))}
    </div>
  );
}

/** High / medium / low attention on a bottom gradient (size M). */
export function ScrimAttentionLevels() {
  return (
    <div className={styles.previewColumn}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <ScrimPreview
          key={attention}
          label={attention}
          position="bottom"
          size="m"
          attention={attention}
          variant="gradient"
        />
      ))}
    </div>
  );
}

/** Gradient scrims on each edge (size M). */
export function ScrimPositions() {
  return (
    <div className={styles.previewColumn}>
      {(['bottom', 'top', 'left', 'right'] as const).map((position) => (
        <ScrimPreview
          key={position}
          label={position}
          position={position}
          size="m"
          attention="medium"
          variant="gradient"
        />
      ))}
    </div>
  );
}

/** Overlay variant — uniform full-container tint. No position or size. */
export function ScrimOverlay() {
  return (
    <div className={styles.previewColumn}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <ScrimPreview
          key={attention}
          label={`overlay · ${attention}`}
          attention={attention}
          variant="overlay"
        />
      ))}
    </div>
  );
}

/** Gradient vs overlay variant comparison. */
export function ScrimVariants() {
  return (
    <div className={styles.previewColumn}>
      <ScrimPreview label="gradient" position="bottom" size="m" attention="medium" variant="gradient" />
      <ScrimPreview label="overlay" attention="medium" variant="overlay" />
    </div>
  );
}

/** Size × Attention matrix — shows how band extent and opacity interact.
 *  Columns: XS → XL (mask-size / band spread).
 *  Rows: high (0.95) → medium (0.5) → low (0.25) (element opacity).
 *  Fixed: position=bottom, variant=gradient. */
export function ScrimSizeAttentionMatrix() {
  const attentions: ScrimAttention[] = ['high', 'medium', 'low'];
  const sizes: ScrimSize[] = ['xs', 's', 'm', 'l', 'xl'];

  return (
    <table style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
      <thead>
        <tr>
          <th style={{ padding: 'var(--Spacing-2) var(--Spacing-4)' }} />
          {sizes.map((size) => (
            <th key={size} style={{ padding: 'var(--Spacing-2) var(--Spacing-4)', textAlign: 'center' }}>
              <span className={styles.previewLabel} style={{ textTransform: 'uppercase' }}>
                {size}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {attentions.map((attention) => (
          <tr key={attention}>
            <td
              style={{
                padding: 'var(--Spacing-2) var(--Spacing-4)',
                textAlign: 'right',
                verticalAlign: 'middle',
              }}
            >
              <span className={styles.previewLabel}>{attention}</span>
            </td>
            {sizes.map((size) => (
              <td key={size} style={{ padding: 'var(--Spacing-2) var(--Spacing-4)' }}>
                <div className={styles.previewFrameLandscape}>
                  <Scrim position="bottom" size={size} attention={attention} variant="gradient" />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Full Figma property matrix — position × size (gradient, medium).
 *  Order: bottom → left → top → right (Figma component set order).
 *  All cells are uniform square — gradient direction varies per position.
 *  Left/right gradients show as vertical bands inside the same square frame. */
export function ScrimPositionSizeMatrix() {
  const positions: ScrimPosition[] = ['bottom', 'left', 'top', 'right'];
  const sizes: ScrimSize[] = ['xs', 's', 'm', 'l', 'xl'];

  return (
    <table style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
      <thead>
        <tr>
          <th style={{ padding: 'var(--Spacing-2) var(--Spacing-4)' }} />
          {sizes.map((size) => (
            <th key={size} style={{ padding: 'var(--Spacing-2) var(--Spacing-4)', textAlign: 'center' }}>
              <span className={styles.previewLabel} style={{ textTransform: 'uppercase' }}>
                {size}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {positions.map((position) => (
          <tr key={position}>
            <td
              style={{
                padding: 'var(--Spacing-2) var(--Spacing-4)',
                textAlign: 'right',
                verticalAlign: 'middle',
              }}
            >
              <span className={styles.previewLabel}>{position}</span>
            </td>
            {sizes.map((size) => (
              <td key={size} style={{ padding: 'var(--Spacing-2) var(--Spacing-4)' }}>
                <div className={styles.previewFrameLandscape}>
                  <Scrim position={position} size={size} attention="medium" variant="gradient" />
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
