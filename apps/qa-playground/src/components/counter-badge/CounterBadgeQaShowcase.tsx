'use client';

import type { CSSProperties } from 'react';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import type {
  CounterBadgeAppearance,
  CounterBadgeProps,
  CounterBadgeSize,
  CounterBadgeVariant,
} from '@oneui/ui/components/CounterBadge';
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

/** Figma M / XS / S / L ↔ code `size` (lowercase). */
const FIGMA_SIZES: { figma: string; size: CounterBadgeSize }[] = [
  { figma: 'M', size: 'm' },
  { figma: 'XS', size: 'xs' },
  { figma: 'S', size: 's' },
  { figma: 'L', size: 'l' },
];

/** Figma appearance table (+ `auto`). Same order as {@link packages/ui/src/components/CounterBadge/CounterBadge.stories.tsx} Appearances. */
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
] as const satisfies readonly CounterBadgeAppearance[];

const ATTENTION_VALUES = ['high', 'medium', 'low'] as const;

type ComboRow = { caption: string; props: CounterBadgeProps };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'M · auto · high · 5', props: { value: 5, size: 'm', appearance: 'auto', attention: 'high' } },
  { caption: 'S · primary · high · 12', props: { value: 12, size: 's', appearance: 'primary', attention: 'high' } },
  { caption: 'L · warning · low · 3', props: { value: 3, size: 'l', appearance: 'warning', attention: 'low' } },
  { caption: 'M · sparkle · high · 99 (at max)', props: { value: 99, max: 99, size: 'm', appearance: 'sparkle', attention: 'high' } },
  { caption: 'M · primary · high · 150 → 99+', props: { value: 150, max: 99, size: 'm', appearance: 'primary', attention: 'high' } },
  { caption: 'XS · negative · high · 8', props: { value: 8, size: 'xs', appearance: 'negative', attention: 'high' } },
];

/**
 * Counter Badge QA — Figma API coverage, code-only props, and combination matrix.
 * The **size × attention** COMPONENT_SET lives on the **Figma Validation** tab only ({@link CounterBadgeFigmaValidationGrid}).
 * `data-testid` is on the root {@link packages/ui/src/components/CounterBadge/CounterBadge.tsx} `<span>` only.
 */
export function CounterBadgeQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="counter-qa-default" title="Default" centerContent>
        <CounterBadge
          value={5}
          size="m"
          attention="high"
          appearance="auto"
          aria-label="5 unread items"
          data-testid="counter-badge-default"
        />
      </QaStoryBand>

      <QaStoryBand id="counter-qa-size" title="1 Size (M · XS · S · L)" overflow>
        <p className={styles.storySectionLead}>
          Figma labels sizes <strong>M / XS / S / L</strong>; code uses lowercase <code>size</code> (<code>m</code>, <code>xs</code>,{' '}
          <code>s</code>, <code>l</code>). Sample value <strong>8</strong> to align with the Figma matrix reference.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <CounterBadge
                  value={8}
                  size={size}
                  attention="high"
                  appearance="auto"
                  aria-label={`${8} items, size ${figma}`}
                  data-testid={`counter-badge-size-${figma}`}
                />
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Figma art for <strong>XS + high</strong> shows a solid dot <strong>without numerals</strong>; this implementation still prints{' '}
          <code>displayValue</code> — TODO: add an explicit dot-only / hide-value mode on <code>CounterBadge</code> when design parity is required.
        </p>
      </QaStoryBand>

      <QaStoryBand id="counter-qa-attention" title="2 Attention (high · medium · low)" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>attention</code> maps to internal <code>variant</code> (<code>high</code>→<code>bold</code>, <code>medium</code>→
          <code>subtle</code>, <code>low</code>→<code>ghost</code>). Fixed <code>size=&quot;m&quot;</code> here so this band complements the
          Figma Validation matrix without duplicating it.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {ATTENTION_VALUES.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <CounterBadge
                  value={8}
                  size="m"
                  attention={attention}
                  appearance="auto"
                  aria-label={`${8} items, ${attention} attention`}
                  data-testid={`counter-badge-attention-${attention}`}
                />
                <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="counter-qa-appearance" title="3 Appearance (Figma variable mode + auto)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>CounterBadge.stories.tsx</code> Appearances — each row: high, medium, low at <code>value=&#123;5&#125;</code>.
          Code also supports <code>brand-bg</code> (not listed in the Figma appearance table screenshot) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <CounterBadge
                  appearance={appearance}
                  value={5}
                  attention="high"
                  aria-label={`${appearance} high, 5 items`}
                  data-testid={`counter-badge-appearance-${appearance}-high`}
                />
                <CounterBadge
                  appearance={appearance}
                  value={5}
                  attention="medium"
                  aria-label={`${appearance} medium, 5 items`}
                  data-testid={`counter-badge-appearance-${appearance}-medium`}
                />
                <CounterBadge
                  appearance={appearance}
                  value={5}
                  attention="low"
                  aria-label={`${appearance} low, 5 items`}
                  data-testid={`counter-badge-appearance-${appearance}-low`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <CounterBadge
              appearance="brand-bg"
              value={5}
              attention="high"
              aria-label="brand-bg high, 5 items"
              data-testid="counter-badge-appearance-brand-bg-high"
            />
            <CounterBadge
              appearance="brand-bg"
              value={5}
              attention="medium"
              aria-label="brand-bg medium, 5 items"
              data-testid="counter-badge-appearance-brand-bg-medium"
            />
            <CounterBadge
              appearance="brand-bg"
              value={5}
              attention="low"
              aria-label="brand-bg low, 5 items"
              data-testid="counter-badge-appearance-brand-bg-low"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="counter-qa-variant" title="4 variant (explicit) — Figma API N/A ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Figma documents <code>attention</code> only; <code>variant</code> (<code>bold</code> / <code>subtle</code> / <code>ghost</code>) is
          an alternate API in code. When both are set, <code>variant</code> wins over <code>attention</code> (see{' '}
          <code>CounterBadge.shared.ts</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['bold', 'subtle', 'ghost'] as CounterBadgeVariant[]).map((variant) => (
              <div key={variant} className={styles.scenarioLabeledCell}>
                <CounterBadge
                  variant={variant}
                  attention="low"
                  value={4}
                  appearance="primary"
                  aria-label={`variant ${variant} overrides attention low`}
                  data-testid={`counter-badge-variant-${variant}`}
                />
                <span className={styles.scenarioCellCaption}>{`variant: ${variant} (attention=low ignored)`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="counter-qa-value-max-showzero" title="5 value · max · showZero (code / dev — not in Figma property table) ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Figma lists <strong>value</strong> under a code-only / dev row in the spec; <code>max</code> and <code>showZero</code> are behaviour props in code only ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CounterBadge value={0} showZero aria-label="Zero with showZero" data-testid="counter-badge-value-zero-showzero" />
              <span className={styles.scenarioCellCaption}>value: 0 · showZero</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CounterBadge value={15} max={9} aria-label="15 capped at 9 plus" data-testid="counter-badge-max-overflow" />
              <span className={styles.scenarioCellCaption}>max: 9 · value 15 → 9+</span>
            </div>
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          With <code>value=&#123;0&#125;</code> and default <code>showZero=&#123;false&#125;</code>, the component renders nothing (<code>null</code>) — no root node, so no <code>data-testid</code> ⚠️.
        </p>
      </QaStoryBand>

      <QaStoryBand id="counter-qa-combos" title="6 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <CounterBadge
                  {...row.props}
                  aria-label={row.caption}
                  data-testid={`counter-badge-combo-${index}`}
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
