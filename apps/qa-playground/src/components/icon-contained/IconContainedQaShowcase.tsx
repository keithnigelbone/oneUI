'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { IconContainedAppearance, IconContainedAttention, IconContainedSize } from '@oneui/ui/components/IconContained';
import { IconContained } from '@oneui/ui/components/IconContained';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so IconContained tokens remap against the same parent step as Bottom Navigation QA strips.
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

const FIGMA_SIZES: readonly { size: IconContainedSize; label: string }[] = [
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

const FIGMA_ATTENTION: readonly IconContainedAttention[] = ['medium', 'high'];

const FIGMA_APPEARANCE: readonly IconContainedAppearance[] = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
];

export function IconContainedQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="icon-contained-qa-default" title="Default" centerContent>
        <QaNeutralSurfaceFrame>
          <span data-testid="icon-contained-default">
            <IconContained icon="heart" aria-label="Heart" />
          </span>
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="icon-contained-qa-size" title="1 Size (XS – XL)" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="IconContained sizes">
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ size, label }) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`icon-contained-size-${size}`}>
                    <IconContained
                      icon="heart"
                      size={size}
                      attention="high"
                      appearance="secondary"
                      aria-label={label}
                    />
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{label}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-contained-qa-attention" title="2 Attention (medium · high)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_ATTENTION.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`icon-contained-attention-${attention}`}>
                    <IconContained
                      icon="heart"
                      attention={attention}
                      size="m"
                      appearance="secondary"
                      aria-label={attention}
                    />
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{attention}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-contained-qa-appearance" title="3 Appearance" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="IconContained appearances">
          <div className={styles.scenarioFlexRow}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <span data-testid={`icon-contained-appearance-${appearance}`}>
                    <IconContained
                      icon="heart"
                      appearance={appearance}
                      attention="high"
                      size="m"
                      aria-label={appearance}
                    />
                  </span>
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{appearance}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-contained-qa-a11y" title="4 Accessibility — correct usage" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <span data-testid="icon-contained-a11y-labelled">
              <IconContained icon="heart" aria-label="Favourited" />
            </span>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-contained-qa-bug-repro" title="Decorative (no aria-label)" overflow>
        <p className={styles.storySectionLead}>
          Omitting <code>aria-label</code> treats the icon as decorative: the root is{' '}
          <code>aria-hidden=&quot;true&quot;</code> with no <code>role=&quot;img&quot;</code>. Provide a
          non-empty <code>aria-label</code> when the icon conveys meaning.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <span data-testid="icon-contained-bug-decorative">
              <IconContained icon="heart" />
            </span>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-contained-qa-disabled" title="5 Disabled" overflow>
        <QaNeutralSurfaceFrame>
          <span data-testid="icon-contained-disabled">
            <IconContained icon="heart" disabled aria-label="Disabled" />
          </span>
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="icon-contained-qa-surface" title="6 Surface context" overflow>
        <Surface mode="subtle" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-L)' }}>
          <span data-testid="icon-contained-surface-subtle">
            <IconContained
              icon="heart"
              attention="medium"
              appearance="primary"
              aria-label="On subtle surface"
            />
          </span>
        </Surface>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
