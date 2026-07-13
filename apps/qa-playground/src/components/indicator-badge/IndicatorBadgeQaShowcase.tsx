'use client';

import type { CSSProperties } from 'react';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import type { IndicatorBadgeAppearance, IndicatorBadgeProps, IndicatorBadgeSize } from '@oneui/ui/components/IndicatorBadge';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const appearanceRowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

/** Figma XS / S / M / L / XL ↔ code `size` (lowercase). */
const FIGMA_SIZES: { figma: string; size: IndicatorBadgeSize }[] = [
  { figma: 'XS', size: 'xs' },
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
  { figma: 'XL', size: 'xl' },
];

/** Figma appearance variable modes (+ `auto`). Same order as {@link packages/ui/src/components/IndicatorBadge/IndicatorBadge.stories.tsx} Appearances. */
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
] as const satisfies readonly IndicatorBadgeAppearance[];

type ComboRow = { caption: string; props: IndicatorBadgeProps };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'M · negative', props: { size: 'm', appearance: 'negative', 'aria-label': 'M negative' } },
  { caption: 'S · primary', props: { size: 's', appearance: 'primary', 'aria-label': 'S primary' } },
  { caption: 'XL · positive', props: { size: 'xl', appearance: 'positive', 'aria-label': 'XL positive' } },
  { caption: 'XS · warning', props: { size: 'xs', appearance: 'warning', 'aria-label': 'XS warning' } },
  { caption: 'L · informative', props: { size: 'l', appearance: 'informative', 'aria-label': 'L informative' } },
];

/**
 * Indicator Badge QA — Figma API coverage, code-only notes, and combination matrix.
 * The **size × appearance** COMPONENT_SET lives on the **Figma Validation** tab only ({@link IndicatorBadgeFigmaValidationGrid}).
 * `data-testid` is on the root {@link packages/ui/src/components/IndicatorBadge/IndicatorBadge.tsx} `<span>` only.
 */
export function IndicatorBadgeQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="indicator-qa-default" title="Default" centerContent>
        <IndicatorBadge aria-label="Status" data-testid="indicator-badge-default" />
      </QaStoryBand>

      <QaStoryBand id="indicator-qa-size" title="1 Size (XS · S · M · L · XL)" overflow>
        <p className={styles.storySectionLead}>
          Figma labels sizes <strong>XS / S / M / L / XL</strong>; code uses lowercase <code>size</code>. Dots use{' '}
          <code>appearance=&quot;negative&quot;</code> to mirror the red reference art.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <IndicatorBadge
                  size={size}
                  appearance="negative"
                  aria-label={`Size ${figma}`}
                  data-testid={`indicator-badge-size-${figma}`}
                />
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="indicator-qa-appearance" title="2 Appearance (Figma variable mode + auto)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>IndicatorBadge.stories.tsx</code> Appearances — one dot per row at <code>size=&quot;m&quot;</code>.
          Code also supports <code>brand-bg</code> (not in the Figma appearance table screenshot) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <IndicatorBadge
                  appearance={appearance}
                  size="m"
                  aria-label={`${appearance} status`}
                  data-testid={`indicator-badge-appearance-${appearance}`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <IndicatorBadge
              appearance="brand-bg"
              size="m"
              aria-label="brand-bg status"
              data-testid="indicator-badge-appearance-brand-bg"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="indicator-qa-brand-bg" title="3 brand-bg on multiple sizes" overflow>
        <p className={styles.storySectionLead}>
          Extra coverage for <code>brand-bg</code> (code + Storybook; Figma table column omitted) ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['xs', 'm', 'xl'] as const).map((size) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <IndicatorBadge
                  size={size}
                  appearance="brand-bg"
                  aria-label={`brand-bg ${size}`}
                  data-testid={`indicator-badge-brand-bg-${size}`}
                />
                <span className={styles.scenarioCellCaption}>{`brand-bg · size ${size}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="indicator-qa-code-api" title="4 Code-only / Figma N/A" overflow>
        <p className={styles.storySectionLead}>
          The Figma spec lists a <strong>dev / value</strong> row (Lorem placeholder). <strong>IndicatorBadge</strong> is a dot only — there is{' '}
          <strong>no <code>value</code> prop</strong> in the component API. TODO: add a readout variant only if product + design require parity with that row.
        </p>
        <p className={styles.storySectionLead}>
          <code>className</code> and <code>style</code> exist on the React component but are <strong>not</strong> listed as Figma component properties ⚠️.
        </p>
      </QaStoryBand>

      <QaStoryBand id="indicator-qa-combos" title="5 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <IndicatorBadge
                  {...row.props}
                  data-testid={`indicator-badge-combo-${index}`}
                />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
