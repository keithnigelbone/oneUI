'use client';

import React, { type CSSProperties } from 'react';
import { SelectableIconButton } from '@oneui/ui/components/SelectableIconButton';
import type {
  SelectableIconButtonAppearance,
  SelectableIconButtonAttention,
  SelectableIconButtonSize,
} from '@oneui/ui/components/SelectableIconButton';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Stable prefix — matches route slug `selectable-icon-button`. */
const P = 'selectable-icon-button';

/** Inline icon (token-sized via component CSS). Same pattern as Storybook. */
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

const FIGMA_SIZES: { figma: string; size: SelectableIconButtonSize }[] = [
  { figma: '2XS', size: '2xs' },
  { figma: 'XS', size: 'xs' },
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
  { figma: 'XL', size: 'xl' },
];

const FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly SelectableIconButtonAppearance[];

const ATTENTIONS: SelectableIconButtonAttention[] = ['high', 'medium', 'low'];

const APPEARANCES_FOR_DISABLED_DEMO: SelectableIconButtonAppearance[] = ['primary', 'neutral', 'negative'];

const MATRIX_APPEARANCE_ROWS: SelectableIconButtonAppearance[] = ['primary', 'neutral', 'negative', 'positive'];

const matrixHeaderStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Medium)',
  textAlign: 'center',
};

const matrixLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-20)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

/**
 * SelectableIconButton QA — full Figma + code-only API surface (`/c/selectable-icon-button`).
 * `data-section` / `data-testid` values are stable for Playwright (see spec when added).
 */
export function SelectableIconButtonQaShowcase() {
  return (
    <QaShowcaseRoot>
      {/* SECTION 1 — Size */}
      <QaStoryBand id="size" title="1 Size (2XS · XS · S · M · L · XL)" overflow>
        <p className={styles.storySectionLead}>
          Figma uses uppercase size names; code accepts t-shirt aliases (<code>2xs</code> … <code>xl</code>) or numeric f-steps (
          <code>4</code> … <code>14</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`Size ${figma}`}
                  size={size}
                  defaultSelected
                  data-testid={`${P}-size-${figma}`}
                />
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 2 — Attention */}
      <QaStoryBand id="attention" title="2 Attention (high · medium · low)" overflow>
        <p className={styles.storySectionLead}>
          Default attention in Figma/code is <strong>high</strong>. Attention drives the <strong>selected</strong> visual only;
          unselected is always muted ghost.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {ATTENTIONS.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`Attention ${attention}`}
                  attention={attention}
                  defaultSelected
                  data-testid={`${P}-attention-${attention}`}
                />
                <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 3 — Shape */}
      <QaStoryBand id="shape" title="3 Shape (1:1 · 2:3)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(
              [
                { shape: '1:1' as const, label: '1:1 (square)' },
                { shape: '2:3' as const, label: '2:3 (portrait rectangle)' },
              ] as const
            ).map(({ shape, label }) => (
              <div key={shape} className={styles.scenarioLabeledCell}>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={label}
                  shape={shape}
                  defaultSelected
                  data-testid={shape === '1:1' ? `${P}-shape-1-1` : `${P}-shape-2-3`}
                />
                <span className={styles.scenarioCellCaption}>{label}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 4 — Appearance (light row + bold Surface row) */}
      <QaStoryBand id="appearance" title="4 Appearance (auto + 8 roles)" overflow>
        <p className={styles.storySectionLead}>
          Same controls on default page surface (light row) and inside <code>&lt;Surface mode=&quot;bold&quot;&gt;</code> (dark row) for
          contrast.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {FIGMA_APPEARANCES.map((appearance) => (
              <div key={`light-${appearance}`} className={styles.scenarioLabeledCell}>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`${appearance} on default surface`}
                  appearance={appearance}
                  defaultSelected
                  data-testid={`${P}-appearance-${appearance}`}
                />
                <span className={styles.scenarioCellCaption}>{appearance}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <Surface mode="bold">
            <div className={styles.scenarioComboGrid}>
              {FIGMA_APPEARANCES.map((appearance) => (
                <div key={`bold-${appearance}`} className={styles.scenarioLabeledCell}>
                  <SelectableIconButton
                    icon={<HeartIcon />}
                    aria-label={`${appearance} on bold surface`}
                    appearance={appearance}
                    defaultSelected
                    data-testid={`${P}-appearance-${appearance}-on-bold`}
                  />
                  <span className={styles.scenarioCellCaption}>{`${appearance} · on bold`}</span>
                </div>
              ))}
            </div>
          </Surface>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 5 — Selected (canonical pair + per-appearance) */}
      <QaStoryBand id="selected" title="5 Selected (false · true)" overflow>
        <p className={styles.storySectionLead}>Reference pair on <code>primary</code>; then each appearance × selected.</p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Unselected"
                appearance="primary"
                defaultSelected={false}
                data-testid={`${P}-selected-false`}
              />
              <span className={styles.scenarioCellCaption}>selected: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Selected"
                appearance="primary"
                defaultSelected
                data-testid={`${P}-selected-true`}
              />
              <span className={styles.scenarioCellCaption}>selected: true</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            {FIGMA_APPEARANCES.map((appearance) => (
              <div
                key={`sel-row-${appearance}`}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={matrixLabelStyle}>{appearance}</span>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`${appearance} unselected`}
                  appearance={appearance}
                  defaultSelected={false}
                  data-testid={`${P}-appearance-${appearance}-selected-false`}
                />
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`${appearance} selected`}
                  appearance={appearance}
                  defaultSelected
                  data-testid={`${P}-appearance-${appearance}-selected-true`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 6 — condensed × contained */}
      <QaStoryBand id="condensed-contained" title="6 Condensed × contained dependency" overflow>
        <p className={styles.storySectionLead}>
          <code>condensed</code> only applies when <code>contained=&#123;true&#125;</code> (see hook + docs).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(
              [
                { contained: false, condensed: false },
                { contained: false, condensed: true },
                { contained: true, condensed: false },
                { contained: true, condensed: true },
              ] as const
            ).map(({ contained, condensed }) => (
              <div key={`${contained}-${condensed}`} className={styles.scenarioLabeledCell}>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`contained ${contained} condensed ${condensed}`}
                  contained={contained}
                  condensed={condensed}
                  defaultSelected
                  data-testid={`${P}-contained-${contained}-condensed-${condensed}`}
                />
                <span className={styles.scenarioCellCaption}>
                  {`contained=${String(contained)}, condensed=${String(condensed)}`}
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 7 — fullWidth × contained */}
      <QaStoryBand id="fullwidth-contained" title="7 fullWidth × contained dependency" overflow>
        <p className={styles.storySectionLead}>
          <code>fullWidth</code> only applies when <code>contained=&#123;true&#125;</code>. Parent width capped so stretch is visible.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-L)', maxWidth: 'var(--Spacing-40)' }}>
            {(
              [
                { contained: false, fullWidth: false },
                { contained: false, fullWidth: true },
                { contained: true, fullWidth: false },
                { contained: true, fullWidth: true },
              ] as const
            ).map(({ contained, fullWidth }) => (
              <div key={`fw-${contained}-${fullWidth}`} className={styles.scenarioLabeledCellWide}>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`contained ${contained} fullWidth ${fullWidth}`}
                  contained={contained}
                  fullWidth={fullWidth}
                  defaultSelected
                  data-testid={`${P}-contained-${contained}-fullwidth-${fullWidth}`}
                />
                <span className={styles.scenarioCellCaption}>
                  {`contained=${String(contained)}, fullWidth=${String(fullWidth)}`}
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 8 — disabled */}
      <QaStoryBand id="disabled" title="8 Disabled (false · true) × appearances" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Interactive"
                appearance="primary"
                disabled={false}
                defaultSelected
                data-testid={`${P}-disabled-false`}
              />
              <span className={styles.scenarioCellCaption}>disabled: false (canonical)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Disabled"
                appearance="primary"
                disabled
                defaultSelected
                data-testid={`${P}-disabled-true`}
              />
              <span className={styles.scenarioCellCaption}>disabled: true (canonical)</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {APPEARANCES_FOR_DISABLED_DEMO.map((appearance) => (
              <div
                key={`dis-${appearance}`}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={matrixLabelStyle}>{appearance}</span>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`${appearance} enabled`}
                  appearance={appearance}
                  disabled={false}
                  defaultSelected
                  data-testid={`${P}-disabled-false-${appearance}`}
                />
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`${appearance} disabled`}
                  appearance={appearance}
                  disabled
                  defaultSelected
                  data-testid={`${P}-disabled-true-${appearance}`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 9 — loading */}
      <QaStoryBand id="loading" title="9 Loading (false · true)" overflow>
        <p className={styles.storySectionLead}>
          When <code>loading=&#123;true&#125;</code>, the icon slot is replaced by <code>CircularProgressIndicator</code> and the control is
          disabled (<code>aria-busy</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Not loading"
                loading={false}
                defaultSelected
                data-testid={`${P}-loading-false`}
              />
              <span className={styles.scenarioCellCaption}>loading: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Loading"
                loading
                defaultSelected
                data-testid={`${P}-loading-true`}
              />
              <span className={styles.scenarioCellCaption}>loading: true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 10 — accent (code-only naming; maps to appearance — no separate accent prop on this component) */}
      <QaStoryBand id="accent" title="10 Accent (code-only — Figma N/A)" overflow>
        <p className={styles.storySectionLead}>
          Figma marks accent N/A; this component has no <code>accent</code> prop. Rows below use <code>appearance</code> for{' '}
          <code>primary</code> / <code>secondary</code> / <code>sparkle</code> so QA has stable <code>data-testid</code> anchors.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['primary', 'secondary', 'sparkle'] as const).map((role) => (
              <div key={role} className={styles.scenarioLabeledCell}>
                <SelectableIconButton
                  icon={<HeartIcon />}
                  aria-label={`Accent demo ${role}`}
                  appearance={role}
                  defaultSelected
                  data-testid={`${P}-accent-${role}`}
                />
                <span className={styles.scenarioCellCaption}>{`accent table → appearance: ${role}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 11 — content (code-only: icon vs loading = CPI) */}
      <QaStoryBand id="content" title="11 Content (code-only — Figma N/A)" overflow>
        <p className={styles.storySectionLead}>
          There is no <code>content</code> prop; icon comes from <code>icon</code>. Loading state renders{' '}
          <code>CircularProgressIndicator</code> instead of the icon.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Icon content"
                loading={false}
                defaultSelected
                data-testid={`${P}-content-icon`}
              />
              <span className={styles.scenarioCellCaption}>Icon (default)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Spinner via loading"
                loading
                defaultSelected
                data-testid={`${P}-content-spinner`}
              />
              <span className={styles.scenarioCellCaption}>circularProgressIndicator (loading)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 12 — size × appearance matrix */}
      <QaStoryBand id="size-appearance-matrix" title="12 Size × appearance matrix" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="Size by appearance matrix">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `minmax(var(--Spacing-18), auto) repeat(${FIGMA_SIZES.length}, minmax(var(--Spacing-14), 1fr))`,
                gap: 'var(--Spacing-2)',
                alignItems: 'center',
              }}
            >
              <span />
              {FIGMA_SIZES.map(({ figma }) => (
                <span key={figma} style={matrixHeaderStyle}>
                  {figma}
                </span>
              ))}
              {FIGMA_APPEARANCES.map((appearance) => (
                <React.Fragment key={appearance}>
                  <span style={matrixLabelStyle}>{appearance}</span>
                  {FIGMA_SIZES.map(({ figma, size }) => (
                    <div key={`${appearance}-${figma}`} style={{ display: 'flex', justifyContent: 'center' }}>
                      <SelectableIconButton
                        icon={<HeartIcon />}
                        aria-label={`${appearance} ${figma}`}
                        appearance={appearance}
                        size={size}
                        defaultSelected
                        data-testid={`${P}-${figma}-${appearance}`}
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 13 — size × selected matrix */}
      <QaStoryBand id="size-selected-matrix" title="13 Size × selected matrix" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="Size by selected matrix">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `minmax(var(--Spacing-18), auto) repeat(${FIGMA_SIZES.length}, minmax(var(--Spacing-14), 1fr))`,
              gap: 'var(--Spacing-2)',
              alignItems: 'center',
            }}
          >
            <span />
            {FIGMA_SIZES.map(({ figma }) => (
              <span key={figma} style={matrixHeaderStyle}>
                {figma}
              </span>
            ))}
            {([false, true] as const).map((sel) => (
              <React.Fragment key={`sel-${sel}`}>
                <span style={matrixLabelStyle}>{`selected=${sel}`}</span>
                {FIGMA_SIZES.map(({ figma, size }) => (
                  <div key={`${sel}-${figma}`} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SelectableIconButton
                      icon={<HeartIcon />}
                      aria-label={`size ${figma} selected ${sel}`}
                      size={size}
                      defaultSelected={sel}
                      data-testid={`${P}-${figma}-selected-${sel}`}
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 14 — attention × appearance matrix */}
      <QaStoryBand id="attention-appearance-matrix" title="14 Attention × appearance matrix" overflow>
        <QaApiSectionBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `minmax(var(--Spacing-18), auto) repeat(${ATTENTIONS.length}, minmax(var(--Spacing-16), 1fr))`,
              gap: 'var(--Spacing-2)',
              alignItems: 'center',
            }}
          >
            <span />
            {ATTENTIONS.map((a) => (
              <span key={a} style={matrixHeaderStyle}>
                {a}
              </span>
            ))}
            {MATRIX_APPEARANCE_ROWS.map((appearance) => (
              <React.Fragment key={appearance}>
                <span style={matrixLabelStyle}>{appearance}</span>
                {ATTENTIONS.map((attention) => (
                  <div key={`${appearance}-${attention}`} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SelectableIconButton
                      icon={<HeartIcon />}
                      aria-label={`${attention} ${appearance}`}
                      attention={attention}
                      appearance={appearance}
                      defaultSelected
                      data-testid={`${P}-${attention}-${appearance}`}
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 15 — key combinations */}
      <QaStoryBand id="combinations" title="15 Key combinations" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Selected and disabled"
                defaultSelected
                disabled
                data-testid={`${P}-selected-true-disabled-true`}
              />
              <span className={styles.scenarioCellCaption}>selected=true + disabled=true</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Selected and loading"
                defaultSelected
                loading
                data-testid={`${P}-selected-true-loading-true`}
              />
              <span className={styles.scenarioCellCaption}>selected=true + loading=true</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Loading hides icon"
                loading
                defaultSelected={false}
                data-testid={`${P}-loading-true-content-icon`}
              />
              <span className={styles.scenarioCellCaption}>loading=true + icon prop (icon hidden; CPI shown)</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="Loading shows CPI"
                loading
                defaultSelected
                data-testid={`${P}-loading-true-content-spinner`}
              />
              <span className={styles.scenarioCellCaption}>loading=true (CPI is the visible content)</span>
            </div>
            <div className={styles.scenarioLabeledCellWide} style={{ maxWidth: 'var(--Spacing-40)' }}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="XL full width contained"
                size="xl"
                contained
                fullWidth
                defaultSelected
                data-testid={`${P}-XL-fullwidth`}
              />
              <span className={styles.scenarioCellCaption}>size=XL · contained · fullWidth</span>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <SelectableIconButton
                icon={<HeartIcon />}
                aria-label="All defaults row"
                size="m"
                attention="high"
                appearance="primary"
                defaultSelected={false}
                condensed={false}
                contained
                fullWidth={false}
                disabled={false}
                loading={false}
                shape="1:1"
                data-testid={`${P}-all-defaults`}
              />
              <span className={styles.scenarioCellCaption}>
                size=M, attention=high, appearance=primary, selected=false, condensed=false, contained=true, fullWidth=false,
                disabled=false, loading=false
              </span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
