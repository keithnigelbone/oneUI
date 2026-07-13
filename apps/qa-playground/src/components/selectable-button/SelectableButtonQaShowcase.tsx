'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import type { SelectableButtonAttention, SelectableButtonSize } from '@oneui/ui/components/SelectableButton';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so SelectableButton tokens remap against the same parent step as Bottom Navigation QA strips.
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

const FIGMA_SIZES: readonly { size: SelectableButtonSize; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

const FIGMA_ELEVATION: readonly SelectableButtonAttention[] = ['high', 'medium', 'low'];

const HeartSlot = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

export function SelectableButtonQaShowcase() {
  const [selected, setSelected] = useState(false);

  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="selectable-button-qa-default" title="Default" centerContent>
        <QaNeutralSurfaceFrame>
          <span data-testid="selectable-button-default">
            <SelectableButton>Button</SelectableButton>
          </span>
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="selectable-button-qa-size" title="1 Size (S · M · L)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ size, label }) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`selectable-button-size-${size}`}>
                    <SelectableButton size={size} selected>
                      {label}
                    </SelectableButton>
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{label}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="selectable-button-qa-elevation" title="2 Elevation / attention (selected)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_ELEVATION.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`selectable-button-attention-${attention}-selected`}>
                    <SelectableButton attention={attention} selected>
                      {attention}
                    </SelectableButton>
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{attention}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="selectable-button-qa-contained" title="3 Contained · condensed · fullWidth" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <span data-testid="selectable-button-contained-true">
              <SelectableButton contained selected>
                Contained
              </SelectableButton>
            </span>
            <span data-testid="selectable-button-contained-false">
              <SelectableButton contained={false} selected>
                Inline
              </SelectableButton>
            </span>
            <span data-testid="selectable-button-condensed">
              <SelectableButton condensed contained selected>
                Condensed
              </SelectableButton>
            </span>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="selectable-button-qa-icons" title="4 Start / end icons" overflow>
        <QaNeutralSurfaceFrame>
          <span data-testid="selectable-button-with-icons">
            <SelectableButton start={<HeartSlot />} end={<HeartSlot />} selected>
              Button
            </SelectableButton>
          </span>
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="selectable-button-qa-toggle" title="5 Selection toggle (real-world)" overflow>
        <QaNeutralSurfaceFrame>
          <span data-testid="selectable-button-toggle">
            <SelectableButton
              selected={selected}
              onSelectedChange={setSelected}
              aria-label="Toggle favourite"
            >
              {selected ? 'Selected' : 'Select'}
            </SelectableButton>
          </span>
        </QaNeutralSurfaceFrame>
        <p className={styles.storySectionLead} data-testid="selectable-button-toggle-state">
          selected: {String(selected)}
        </p>
      </QaStoryBand>

      <QaStoryBand id="selectable-button-qa-states" title="6 Disabled · loading" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <span data-testid="selectable-button-disabled">
              <SelectableButton disabled>
                Button
              </SelectableButton>
            </span>
            <span data-testid="selectable-button-loading">
              <SelectableButton loading>
                Button
              </SelectableButton>
            </span>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
