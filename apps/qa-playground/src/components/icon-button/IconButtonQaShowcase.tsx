'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { IconButton } from '@oneui/ui/components/IconButton';
import type { IconButtonAppearance, IconButtonAttention, IconButtonSize } from '@oneui/ui/components/IconButton';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so IconButton tokens remap against the same parent step as Bottom Navigation QA strips.
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

const FIGMA_SIZES: readonly { size: IconButtonSize; label: string }[] = [
  { size: '2xs', label: '2XS' },
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

const FIGMA_ATTENTION: readonly IconButtonAttention[] = ['high', 'medium', 'low'];

const FIGMA_APPEARANCE: readonly IconButtonAppearance[] = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
];

/**
 * IconButton QA — Figma API bands, interaction, edge cases.
 * Figma API: size, attention, shape, appearance, condensed, contained, fullWidth, disabled, loading.
 */
export function IconButtonQaShowcase() {
  const [pressCount, setPressCount] = useState(0);

  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="icon-button-qa-default" title="Default" centerContent>
        <QaNeutralSurfaceFrame>
          <IconButton
            icon="star"
            aria-label="Favourite"
            data-testid="icon-button-default"
          />
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-size" title="1 Size (Figma: 2XS – XL)" overflow>
        <p className={styles.storySectionLead}>
          Figma lists t-shirt sizes; code accepts f-steps or aliases (default <code>M</code> → <code>10</code>).
        </p>
        <QaApiSectionBody scrollable scrollableRegionLabel="IconButton size scenarios">
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ size, label }) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <IconButton
                    icon="star"
                    size={size}
                    attention="high"
                    appearance="primary"
                    aria-label={`Size ${label}`}
                    data-testid={`icon-button-size-${size}`}
                  />
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{label}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-attention" title="2 Attention (high · medium · low)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_ATTENTION.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <IconButton
                    icon="star"
                    attention={attention}
                    size="m"
                    aria-label={attention}
                    data-testid={`icon-button-attention-${attention}`}
                  />
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{attention}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-appearance" title="3 Appearance (Figma variable mode)" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="IconButton appearance scenarios">
          <div className={styles.scenarioFlexRow}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} className={styles.scenarioLabeledCell}>
                <QaNeutralSurfaceFrame>
                  <IconButton
                    icon="star"
                    appearance={appearance}
                    attention="high"
                    size="m"
                    aria-label={appearance}
                    data-testid={`icon-button-appearance-${appearance}`}
                  />
                </QaNeutralSurfaceFrame>
                <span className={styles.scenarioCellCaption}>{appearance}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-layout" title="4 Shape / layout (Figma shape → code layout)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaNeutralSurfaceFrame>
                <IconButton
                  icon="star"
                  layout="1:1"
                  aria-label="Square"
                  data-testid="icon-button-layout-1-1"
                />
              </QaNeutralSurfaceFrame>
              <span className={styles.scenarioCellCaption}>shape 1:1</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaNeutralSurfaceFrame>
                <IconButton
                  icon="star"
                  layout="3:2"
                  aria-label="Wide"
                  data-testid="icon-button-layout-3-2"
                />
              </QaNeutralSurfaceFrame>
              <span className={styles.scenarioCellCaption}>shape 2:3 → layout 3:2</span>
            </div>
            <div className={styles.scenarioLabeledCell} style={{ flex: '1 1 12rem', minWidth: '12rem' }}>
              <QaNeutralSurfaceFrame style={{ width: '100%' }}>
                <IconButton
                  icon="star"
                  fullWidth
                  aria-label="Full width"
                  data-testid="icon-button-full-width"
                />
              </QaNeutralSurfaceFrame>
              <span className={styles.scenarioCellCaption}>fullWidth</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-condensed" title="5 Condensed (Figma condensed × size)" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <IconButton icon="star" aria-label="Normal" data-testid="icon-button-condensed-false" />
            <IconButton
              icon="star"
              condensed
              aria-label="Condensed"
              data-testid="icon-button-condensed-true"
            />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-states" title="6 Disabled · loading" overflow>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <IconButton icon="star" disabled aria-label="Disabled" data-testid="icon-button-disabled" />
            <IconButton icon="star" loading aria-label="Loading" data-testid="icon-button-loading" />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-interaction" title="7 Interaction — click · aria-expanded" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaNeutralSurfaceFrame>
                <IconButton
                  icon="star"
                  aria-label="Press me"
                  onClick={() => setPressCount((c) => c + 1)}
                  data-testid="icon-button-interactive"
                />
              </QaNeutralSurfaceFrame>
              <span className={styles.scenarioCellCaption} data-testid="icon-button-press-count">
                presses: {pressCount}
              </span>
            </div>
            <QaNeutralSurfaceFrame>
              <IconButton
                icon="star"
                aria-label="Expand menu"
                aria-expanded={false}
                data-testid="icon-button-aria-expanded"
              />
            </QaNeutralSurfaceFrame>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-surface" title="8 Surface context" overflow>
        <Surface mode="bold" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-L)' }}>
          <IconButton
            icon="star"
            attention="low"
            appearance="primary"
            aria-label="On bold surface"
            data-testid="icon-button-surface-bold"
          />
        </Surface>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-bug-repro" title="BUG-ICONBUTTON-001 — icon-only without aria-label" overflow>
        <p className={styles.storySectionLead}>
          Intentional misuse for QA. Must fail <code>button-name</code> until IconButton requires or derives an
          accessible name in code.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <IconButton icon="star" data-testid="icon-button-bug-no-label" />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="icon-button-qa-edge" title="9 Edge cases" overflow>
        <p className={styles.storySectionLead}>
          Invalid numeric size falls back to M (<code>10</code>). Loading implies disabled interaction.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <IconButton
              icon="star"
              size={99 as IconButtonSize}
              aria-label="Invalid size fallback"
              data-testid="icon-button-edge-invalid-size"
            />
            <IconButton
              icon="star"
              loading
              disabled={false}
              aria-label="Loading not disabled prop"
              data-testid="icon-button-edge-loading-active"
            />
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
