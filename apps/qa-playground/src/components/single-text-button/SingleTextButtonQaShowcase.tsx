'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { SingleTextButton } from '@oneui/ui/components/SingleTextButton';
import type { SingleTextButtonAttention, SingleTextButtonSize } from '@oneui/ui/components/SingleTextButton';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so SingleTextButton tokens remap against the same parent step as Bottom Navigation QA strips.
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

const FIGMA_SIZES: readonly { size: SingleTextButtonSize; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

const FIGMA_ATTENTION: readonly SingleTextButtonAttention[] = ['high', 'medium', 'low'];

export function SingleTextButtonQaShowcase() {
  const [presses, setPresses] = useState(0);

  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="single-text-button-qa-default" title="Default" centerContent>
        <QaNeutralSurfaceFrame>
          <span data-testid="single-text-button-default">
            <SingleTextButton>Ag</SingleTextButton>
          </span>
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="single-text-button-qa-size" title="1 Size (S · M · L)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ size, label }) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`single-text-button-size-${size}`}>
                    <SingleTextButton size={size}>Ag</SingleTextButton>
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{label}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="single-text-button-qa-attention" title="2 Attention" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_ATTENTION.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`single-text-button-attention-${attention}`}>
                    <SingleTextButton attention={attention}>Ag</SingleTextButton>
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{attention}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="single-text-button-qa-condensed" title="3 Condensed × size" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ size, label }) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`single-text-button-condensed-${size}`}>
                    <SingleTextButton size={size} condensed>
                      Ag
                    </SingleTextButton>
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{`${label} condensed`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="single-text-button-qa-states" title="4 Disabled · loading" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <span data-testid="single-text-button-disabled">
              <SingleTextButton disabled>Ag</SingleTextButton>
            </span>
            <span data-testid="single-text-button-loading">
              <SingleTextButton loading aria-label="Loading">
                Ag
              </SingleTextButton>
            </span>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="single-text-button-qa-interaction" title="5 Interaction" overflow>
        <QaNeutralSurfaceFrame>
          <span data-testid="single-text-button-interactive">
            <SingleTextButton onClick={() => setPresses((n) => n + 1)} aria-label="Language Ag">
              Ag
            </SingleTextButton>
          </span>
        </QaNeutralSurfaceFrame>
        <p className={styles.storySectionLead} data-testid="single-text-button-press-count">
          presses: {presses}
        </p>
      </QaStoryBand>

      <QaStoryBand id="single-text-button-qa-bug-repro" title="BUG-SINGLETEXT-001 — loading without aria-label" overflow>
        <p className={styles.storySectionLead}>
          Figma loading state hides the visible label; this repro omits <code>aria-label</code> on the button.
          Must fail <code>button-name</code> until fixed in SingleTextButton.
        </p>
        <QaNeutralSurfaceFrame>
          <span data-testid="single-text-button-bug-loading-no-label">
            <SingleTextButton loading>Ag</SingleTextButton>
          </span>
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="single-text-button-qa-edge" title="6 Edge — 2-char limit" overflow>
        <p className={styles.storySectionLead}>
          Labels longer than 2 characters truncate in development (see console warning).
        </p>
        <QaNeutralSurfaceFrame>
          <span data-testid="single-text-button-edge-long">
            <SingleTextButton>ABC</SingleTextButton>
          </span>
        </QaNeutralSurfaceFrame>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
