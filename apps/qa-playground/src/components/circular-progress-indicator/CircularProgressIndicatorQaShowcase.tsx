'use client';

import type { CSSProperties } from 'react';
import { useId } from 'react';
import { CircularProgressIndicator } from '@oneui/ui/components/CircularProgressIndicator';
import type {
  CircularProgressIndicatorAppearance,
  CircularProgressIndicatorProps,
  CircularProgressIndicatorSize,
} from '@oneui/ui/components/CircularProgressIndicator';
import { Icon } from '@oneui/ui/components/Icon';
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

/**
 * Figma size labels with bracket dimension steps (Circular Progress Indicator API table).
 * Code `size` uses the same t-shirt tokens as {@link packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.stories.tsx} Sizes.
 */
const FIGMA_SIZES: { figma: string; bracket: string; size: CircularProgressIndicatorSize }[] = [
  { figma: '2XS', bracket: '2', size: '2XS' },
  { figma: 'XS', bracket: '3', size: 'XS' },
  { figma: 'S', bracket: '4', size: 'S' },
  { figma: 'M', bracket: '5', size: 'M' },
  { figma: 'L', bracket: '6', size: 'L' },
  { figma: 'XL', bracket: '8', size: 'XL' },
  { figma: '2XL', bracket: '10', size: '2XL' },
  { figma: '3XL', bracket: '12', size: '3XL' },
  { figma: '4XL', bracket: '14', size: '4XL' },
  { figma: '5XL', bracket: '16', size: '5XL' },
];

/**
 * Figma `appearance` variable modes (+ `auto`). Order matches the attached API table
 * (component / variable mode column). `brand-bg` is supported in code like other multi-accent
 * components but is omitted from that compact Figma list — shown separately with ⚠️.
 */
const FIGMA_APPEARANCE = [
  'auto',
  'primary',
  'secondary',
  'sparkle',
  'neutral',
  'positive',
  'negative',
  'warning',
  'informative',
] as const satisfies readonly CircularProgressIndicatorAppearance[];

type ComboRow = { caption: string; props: CircularProgressIndicatorProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'determinate · M · neutral · value 40 · none',
    props: { value: 40, size: 'M', appearance: 'neutral', content: 'none', 'aria-label': 'QA combo 0' },
  },
  {
    caption: 'indeterminate · M · secondary · none',
    props: { variant: 'indeterminate', size: 'M', appearance: 'secondary', content: 'none', 'aria-label': 'QA combo 1' },
  },
  {
    caption: 'determinate · 3XL · informative · text · value 55',
    props: { value: 55, size: '3XL', appearance: 'informative', content: 'text', 'aria-label': 'QA combo 2' },
  },
  {
    caption: 'determinate · 3XL · secondary · icon · value 50',
    props: {
      value: 50,
      size: '3XL',
      appearance: 'secondary',
      content: 'icon',
      'aria-label': 'QA combo 3',
      children: <Icon icon="download" emphasis="high" size="3" aria-hidden />,
    },
  },
  {
    caption: 'determinate · XS · positive · value 80 · none',
    props: { value: 80, size: 'XS', appearance: 'positive', content: 'none', 'aria-label': 'QA combo 4' },
  },
  {
    caption: 'determinate · L · neutral · min 10 max 60 value 35 (Code only min/max/value) ⚠️',
    props: { value: 35, min: 10, max: 60, size: 'L', appearance: 'neutral', content: 'none', 'aria-label': 'QA combo 5' },
  },
  {
    caption: 'determinate · XL · brand-bg · value 50 (not on compact Figma appearance list) ⚠️',
    props: { value: 50, size: 'XL', appearance: 'brand-bg', content: 'none', 'aria-label': 'QA combo 6' },
  },
  {
    caption: 'determinate · S · warning · value 15 · none',
    props: { value: 15, size: 'S', appearance: 'warning', content: 'none', 'aria-label': 'QA combo 7' },
  },
];

function LabelledByDemo() {
  const labelId = useId();
  return (
    <div className={styles.scenarioFlexRow}>
      <span
        id={labelId}
        className={styles.scenarioCellCaption}
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          color: 'var(--Text-Medium)',
          maxWidth: 'var(--Spacing-40)',
        }}
      >
        Visible label referenced by <code>aria-labelledby</code> — not a Figma component property (Figma API N/A) ⚠️.
      </span>
      <CircularProgressIndicator
        variant="indeterminate"
        size="M"
        appearance="neutral"
        aria-labelledby={labelId}
        data-testid="cpi-aria-labelledby"
      />
    </div>
  );
}

/**
 * Circular Progress Indicator QA playground — Figma API table (`variant`, `size`, `appearance`, `content`)
 * plus **Code only** rows from the spec (`min`, `max`, `value`): real props, Figma API column N/A ⚠️.
 *
 * Band <code>circular-progress-indicator-qa-icon-text-sizes</code>: <code>content=text|icon</code> × all sizes with the same bracket captions as section 2.
 *
 * The **Figma Validation** tab (`CircularProgressIndicatorFigmaValidationGrid`) hosts the COMPONENT_SET matrix:
 * columns `variant` (determinate · indeterminate), rows `size` with **M** first then 2XS…5XL, matching the Figma sheet.
 *
 * Note: some spec sheets duplicate a stray `min` row with appearance values; the numeric `min` / `max` /
 * `value` rows are the authoritative Code-only bindings.
 *
 * `data-testid` is forwarded on the root ring wrapper only (
 * {@link packages/ui/src/components/CircularProgressIndicator/CircularProgressIndicator.tsx}).
 */
export function CircularProgressIndicatorQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="circular-progress-indicator-qa-default" title="Default" centerContent>
        <CircularProgressIndicator
          value={25}
          size="M"
          appearance="auto"
          aria-label="QA default progress"
          data-testid="cpi-default"
        />
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-variant" title="1 variant" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>variant</code>: <code>determinate</code> vs <code>indeterminate</code>. Same layout as{' '}
          <code>CircularProgressIndicator.stories.tsx</code> Variants.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                variant="determinate"
                value={65}
                size="3XL"
                aria-label="QA determinate"
                data-testid="cpi-variant-determinate"
              />
              <span className={styles.scenarioCellCaption}>variant: determinate</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                variant="indeterminate"
                size="3XL"
                aria-label="QA indeterminate"
                data-testid="cpi-variant-indeterminate"
              />
              <span className={styles.scenarioCellCaption}>variant: indeterminate</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-size" title="2 size (Figma bracket steps)" overflow>
        <p className={styles.storySectionLead}>
          Figma lists sizes with bracket dimension indices; code uses the same tokens (<code>2XS</code> … <code>5XL</code>). Same strip as{' '}
          <code>CircularProgressIndicator.stories.tsx</code> Sizes.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {FIGMA_SIZES.map(({ figma, bracket, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <CircularProgressIndicator value={65} size={size} aria-label={`QA size ${figma}`} data-testid={`cpi-size-${figma}`} />
                <span className={styles.scenarioCellCaption}>{`size: ${figma} [${bracket}]`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-icon-text-sizes" title="2b Icon & text × all sizes (Figma bracket steps)" overflow>
        <p className={styles.storySectionLead}>
          Extends section <strong>2 size</strong>: same tokens and <code>[bracket]</code> labels; <code>content=&quot;text&quot;</code> (value 25) and{' '}
          <code>content=&quot;icon&quot;</code> (value 50, download) across every size — mirrors{' '}
          <code>CircularProgressIndicator.stories.tsx</code> With Content sizing strips.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
              <span style={appearanceRowLabelStyle}>text</span>
              <div className={styles.scenarioFlexRow} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {FIGMA_SIZES.map(({ figma, bracket, size }) => (
                  <div key={`sizes-text-${figma}`} className={styles.scenarioLabeledCell}>
                    <CircularProgressIndicator
                      value={25}
                      size={size}
                      content="text"
                      aria-label={`QA text all sizes ${figma}`}
                      data-testid={`cpi-sizes-text-${figma}`}
                    />
                    <span className={styles.scenarioCellCaption}>{`${figma} [${bracket}]`}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
              <span style={appearanceRowLabelStyle}>icon</span>
              <div className={styles.scenarioFlexRow} style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {FIGMA_SIZES.map(({ figma, bracket, size }) => (
                  <div key={`sizes-icon-${figma}`} className={styles.scenarioLabeledCell}>
                    <CircularProgressIndicator
                      value={50}
                      size={size}
                      content="icon"
                      aria-label={`QA icon all sizes ${figma}`}
                      data-testid={`cpi-sizes-icon-${figma}`}
                    >
                      <Icon icon="download" emphasis="high" aria-hidden />
                    </CircularProgressIndicator>
                    <span className={styles.scenarioCellCaption}>{`${figma} [${bracket}]`}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-appearance" title="3 appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>appearance</code> as variable mode; <code>auto</code> resolves to <code>primary</code> in code. Order matches the attached spec table;{' '}
          <code>CircularProgressIndicator.stories.tsx</code> Appearances uses a slightly different order for the canvas strip only.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <CircularProgressIndicator
                  value={65}
                  size="3XL"
                  appearance={appearance}
                  aria-label={`QA appearance ${appearance}`}
                  data-testid={`cpi-appearance-${appearance}`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Code also supports <code>brand-bg</code>; it is not on the compact Figma <code>appearance</code> list in the attached table ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <CircularProgressIndicator
              value={65}
              size="3XL"
              appearance="brand-bg"
              aria-label="QA appearance brand-bg"
              data-testid="cpi-appearance-brand-bg"
            />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-content" title="4 content" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>content</code>: <code>none</code>, <code>text</code>, <code>icon</code> (children). Icon row matches{' '}
          <code>CircularProgressIndicator.stories.tsx</code> With Content.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator value={40} size="3XL" content="none" aria-label="QA content none determinate" data-testid="cpi-content-none-det" />
              <span className={styles.scenarioCellCaption}>content: none · determinate</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                value={72}
                size="3XL"
                content="text"
                aria-label="QA content text determinate"
                data-testid="cpi-content-text-det"
              />
              <span className={styles.scenarioCellCaption}>content: text · determinate</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                value={50}
                size="3XL"
                content="icon"
                aria-label="QA content icon determinate"
                data-testid="cpi-content-icon-det"
              >
                <Icon icon="download" emphasis="high" size="3" aria-hidden />
              </CircularProgressIndicator>
              <span className={styles.scenarioCellCaption}>content: icon · determinate</span>
            </div>
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Same <code>content</code> values with <code>variant=&quot;indeterminate&quot;</code> (code accepts the combination; Figma API for centre label when indeterminate is unspecified here).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                variant="indeterminate"
                size="3XL"
                content="none"
                aria-label="QA content none indeterminate"
                data-testid="cpi-content-none-ind"
              />
              <span className={styles.scenarioCellCaption}>content: none · indeterminate</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                variant="indeterminate"
                size="3XL"
                content="text"
                aria-label="QA content text indeterminate"
                data-testid="cpi-content-text-ind"
              />
              <span className={styles.scenarioCellCaption}>content: text · indeterminate (centre reads 0% today)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                variant="indeterminate"
                size="3XL"
                content="icon"
                aria-label="QA content icon indeterminate"
                data-testid="cpi-content-icon-ind"
              >
                <Icon icon="download" emphasis="high" size="3" aria-hidden />
              </CircularProgressIndicator>
              <span className={styles.scenarioCellCaption}>content: icon · indeterminate</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-value-min-max" title="5 value · min · max (Figma Code only — not component properties) ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Spec <strong>Code only</strong> rows: <code>value</code>, <code>min</code>, <code>max</code> drive determinate progress. They are real React props with Figma API <strong>N/A</strong> on the component property sheet ⚠️. Sample percentages align with{' '}
          <code>CircularProgressIndicator.stories.tsx</code> States.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {([0, 25, 50, 75, 100] as const).map((v) => (
              <div key={v} className={styles.scenarioLabeledCell}>
                <CircularProgressIndicator
                  value={v}
                  size="3XL"
                  content="text"
                  aria-label={`QA value ${v}%`}
                  data-testid={`cpi-value-${v}`}
                />
                <span className={styles.scenarioCellCaption}>{`value: ${v} ⚠️`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          <code>min</code> / <code>max</code> bound the normalised arc (defaults <code>0</code> / <code>100</code>). Figma API N/A ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                value={75}
                min={0}
                max={200}
                size="3XL"
                content="text"
                aria-label="QA min max 0-200 value 75"
                data-testid="cpi-range-0-200"
              />
              <span className={styles.scenarioCellCaption}>min: 0 · max: 200 · value: 75 ⚠️</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                value={35}
                min={10}
                max={60}
                size="3XL"
                content="text"
                aria-label="QA min max 10-60 value 35"
                data-testid="cpi-range-10-60"
              />
              <span className={styles.scenarioCellCaption}>min: 10 · max: 60 · value: 35 ⚠️</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-code-extras" title="6 Other code-only props (not on Figma API table) ⚠️" overflow>
        <p className={styles.storySectionLead}>
          <code>animate</code>, <code>show</code>, <code>className</code>, <code>style</code>, and entry/exit behaviour are in{' '}
          <code>CircularProgressIndicator.stories.tsx</code> Motion — not on the attached Figma property table ⚠️. This band keeps{' '}
          <code>animate=&#123;false&#125;</code> (default) so indicators stay mounted.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CircularProgressIndicator
                value={40}
                size="3XL"
                content="text"
                aria-label="QA tracking style override"
                data-testid="cpi-style-transition-zero"
                style={{ '--CircularProgressIndicator-valueTransitionDuration': '0s' } as CSSProperties}
              />
              <span className={styles.scenarioCellCaption}>
                <code>style</code> — <code>--CircularProgressIndicator-valueTransitionDuration</code> tracking override (see Motion story) ⚠️
              </span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-aria-labelledby" title="7 aria-labelledby" overflow>
        <p className={styles.storySectionLead}>
          Prefer <code>aria-label</code> for a concise progress name; <code>aria-labelledby</code> is supported for visible labels — not listed on the Figma API table ⚠️.
        </p>
        <QaApiSectionBody>
          <LabelledByDemo />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="circular-progress-indicator-qa-combos" title="8 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <CircularProgressIndicator {...row.props} data-testid={`cpi-combo-${index}`} />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
