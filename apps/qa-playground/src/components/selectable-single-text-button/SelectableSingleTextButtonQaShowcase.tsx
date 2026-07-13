'use client';

import React, { type CSSProperties } from 'react';
import { SelectableSingleTextButton } from '@oneui/ui/components/SelectableSingleTextButton';
import type {
  SelectableSingleTextButtonAppearance,
  SelectableSingleTextButtonAttention,
  SelectableSingleTextButtonSize,
} from '@oneui/ui/components/SelectableSingleTextButton';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Stable prefix — matches route slug `selectable-single-text-button`. */
const P = 'selectable-single-text-button';

/** Short visible label (component max 2 chars). */
const TXT = 'A';

const SIZES: { figma: string; size: SelectableSingleTextButtonSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
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
] as const satisfies readonly SelectableSingleTextButtonAppearance[];

const ATTENTIONS: SelectableSingleTextButtonAttention[] = ['high', 'medium', 'low'];

const APPEARANCES_DISABLED_DEMO: SelectableSingleTextButtonAppearance[] = ['primary', 'negative', 'neutral'];

const MATRIX_ATTENTION_APPEARANCE_ROWS: SelectableSingleTextButtonAppearance[] = [
  'primary',
  'neutral',
  'negative',
  'positive',
  'sparkle',
];

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
 * SelectableSingleTextButton QA — full API surface (`/c/selectable-single-text-button`).
 * `data-section` / `data-testid` on the root toggle only (stable for Playwright).
 */
export function SelectableSingleTextButtonQaShowcase() {
  return (
    <QaShowcaseRoot>
      {/* SECTION 1 — Default */}
      <QaStoryBand id="default" title="1 Default (no optional props)" overflow>
        <p className={styles.storySectionLead}>
          Only <code>children</code> is required. All optional props use component defaults (size M, attention high, appearance
          auto→primary, condensed off, disabled off, loading off).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton aria-label="Default demo" data-testid={`${P}-default`}>
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>default (no props)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 2 — Size */}
      <QaStoryBand id="size" title="2 Size (S · M · L)" overflow>
        <p className={styles.storySectionLead}>
          Figma uses <code>S</code>/<code>M</code>/<code>L</code>; code uses <code>s</code>/<code>m</code>/<code>l</code>. Bounding
          boxes should grow progressively S &lt; M &lt; L.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <SelectableSingleTextButton
                  aria-label={`Size ${figma}`}
                  size={size}
                  defaultSelected
                  data-testid={`${P}-size-${figma}`}
                >
                  {TXT}
                </SelectableSingleTextButton>
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 3 — Attention */}
      <QaStoryBand id="attention" title="3 Attention (high · medium · low)" overflow>
        <p className={styles.storySectionLead}>
          Default attention is <strong>high</strong>. Attention affects the <strong>selected</strong> look only; unselected stays
          muted ghost.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {ATTENTIONS.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <SelectableSingleTextButton
                  aria-label={`Attention ${attention}`}
                  attention={attention}
                  defaultSelected
                  data-testid={`${P}-attention-${attention}`}
                >
                  {TXT}
                </SelectableSingleTextButton>
                <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 4 — Appearance */}
      <QaStoryBand id="appearance" title="4 Appearance (auto + 8 roles)" overflow>
        <p className={styles.storySectionLead}>
          On default page surface for colour contrast, then the same set inside <code>&lt;Surface mode=&quot;bold&quot;&gt;</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {FIGMA_APPEARANCES.map((appearance) => (
              <div key={`light-${appearance}`} className={styles.scenarioLabeledCell}>
                <SelectableSingleTextButton
                  aria-label={`${appearance} on default surface`}
                  appearance={appearance}
                  defaultSelected
                  data-testid={`${P}-appearance-${appearance}`}
                >
                  {TXT}
                </SelectableSingleTextButton>
                <span className={styles.scenarioCellCaption}>{`appearance: ${appearance}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <Surface mode="bold">
            <div className={styles.scenarioComboGrid}>
              {FIGMA_APPEARANCES.map((appearance) => (
                <div key={`bold-${appearance}`} className={styles.scenarioLabeledCell}>
                  <SelectableSingleTextButton
                    aria-label={`${appearance} on bold surface`}
                    appearance={appearance}
                    defaultSelected
                    data-testid={`${P}-appearance-${appearance}-on-bold`}
                  >
                    {TXT}
                  </SelectableSingleTextButton>
                  <span className={styles.scenarioCellCaption}>{`${appearance} · on bold`}</span>
                </div>
              ))}
            </div>
          </Surface>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 5 — Condensed */}
      <QaStoryBand id="condensed" title="5 Condensed (false · true)" overflow>
        <p className={styles.storySectionLead}>Condensed reduces internal padding while keeping typography.</p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Condensed false"
                condensed={false}
                defaultSelected
                data-testid={`${P}-condensed-false`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>condensed: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Condensed true"
                condensed
                defaultSelected
                data-testid={`${P}-condensed-true`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>condensed: true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 6 — Disabled */}
      <QaStoryBand id="disabled" title="6 Disabled (false · true)" overflow>
        <p className={styles.storySectionLead}>Canonical pair, then primary / negative / neutral × disabled.</p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Disabled false"
                disabled={false}
                defaultSelected
                data-testid={`${P}-disabled-false`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>disabled: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Disabled true"
                disabled
                defaultSelected
                data-testid={`${P}-disabled-true`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>disabled: true</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGridDense}>
            {APPEARANCES_DISABLED_DEMO.map((appearance) => (
              <React.Fragment key={appearance}>
                <div className={styles.scenarioLabeledCell}>
                  <SelectableSingleTextButton
                    aria-label={`${appearance} disabled false`}
                    appearance={appearance}
                    disabled={false}
                    defaultSelected
                    data-testid={`${P}-${appearance}-disabled-false`}
                  >
                    {TXT}
                  </SelectableSingleTextButton>
                  <span className={styles.scenarioCellCaption}>{`${appearance} · disabled: false`}</span>
                </div>
                <div className={styles.scenarioLabeledCell}>
                  <SelectableSingleTextButton
                    aria-label={`${appearance} disabled true`}
                    appearance={appearance}
                    disabled
                    defaultSelected
                    data-testid={`${P}-${appearance}-disabled-true`}
                  >
                    {TXT}
                  </SelectableSingleTextButton>
                  <span className={styles.scenarioCellCaption}>{`${appearance} · disabled: true`}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 7 — Loading */}
      <QaStoryBand id="loading" title="7 Loading (false · true)" overflow>
        <p className={styles.storySectionLead}>
          <code>loading=true</code> disables interaction, sets <code>aria-busy</code>, shows{' '}
          <code>CircularProgressIndicator</code>, and hides text content.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Loading false"
                loading={false}
                defaultSelected
                data-testid={`${P}-loading-false`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>loading: false (text visible)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Loading true"
                loading
                defaultSelected
                data-testid={`${P}-loading-true`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>loading: true (spinner, text hidden)</span>
            </div>
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <SelectableSingleTextButton
                  aria-label={`Loading size ${figma}`}
                  size={size}
                  loading
                  defaultSelected
                  data-testid={`${P}-loading-true-size-${figma}`}
                >
                  {TXT}
                </SelectableSingleTextButton>
                <span className={styles.scenarioCellCaption}>{`loading: true · size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 8 — Accent (code only) — not implemented on component */}
      <QaStoryBand id="accent" title="8 Accent (code only — N/A in Figma)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: accent prop not implemented yet on SelectableSingleTextButton — API table lists primary | secondary | sparkle; no `accent` prop in `@oneui/ui` source. */}
          The design API lists <code>accent</code> as code-only. This component does not expose an <code>accent</code> prop yet —
          appearance is controlled via <code>appearance</code> only. Matrix skipped until the prop ships.
        </p>
        <QaApiSectionBody>
          <p
            className={styles.storySectionLead}
            style={{ fontFamily: 'var(--Typography-Font-Primary)', color: 'var(--Text-Medium)' }}
          >
            Planned test ids when implemented: <code>{`${P}-accent-primary`}</code>, <code>{`${P}-accent-secondary`}</code>,{' '}
            <code>{`${P}-accent-sparkle`}</code>.
          </p>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 9 — Content (code only) — no separate content prop */}
      <QaStoryBand id="content" title="9 Content (code only — N/A in Figma)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: content prop not implemented yet — spinner is shown only via loading=true, not a content enum. */}
          Visible label uses <code>children</code> (text). A circular progress indicator appears when <code>loading=true</code>{' '}
          (there is no separate <code>content=&quot;circularProgressIndicator&quot;</code> prop).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton aria-label="Text content" defaultSelected data-testid={`${P}-content-text`}>
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>content: text (children)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Spinner via loading"
                loading
                defaultSelected
                data-testid={`${P}-content-spinner`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>circularProgressIndicator (via loading=true)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 10 — Size × appearance matrix */}
      <QaStoryBand id="size-appearance-matrix" title="10 Size × appearance matrix" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="Size by appearance matrix">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `minmax(var(--Spacing-18), auto) repeat(${SIZES.length}, minmax(var(--Spacing-14), 1fr))`,
                gap: 'var(--Spacing-2)',
                alignItems: 'center',
              }}
            >
              <span />
              {SIZES.map(({ figma }) => (
                <span key={figma} style={matrixHeaderStyle}>
                  {figma}
                </span>
              ))}
              {FIGMA_APPEARANCES.map((appearance) => (
                <React.Fragment key={appearance}>
                  <span style={matrixLabelStyle}>{appearance}</span>
                  {SIZES.map(({ figma, size }) => (
                    <div key={`${appearance}-${figma}`} style={{ display: 'flex', justifyContent: 'center' }}>
                      <SelectableSingleTextButton
                        aria-label={`${appearance} ${figma}`}
                        appearance={appearance}
                        size={size}
                        defaultSelected
                        data-testid={`${P}-${figma}-${appearance}`}
                      >
                        {TXT}
                      </SelectableSingleTextButton>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 11 — Size × attention matrix */}
      <QaStoryBand id="size-attention-matrix" title="11 Size × attention matrix" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="Size by attention matrix">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `minmax(var(--Spacing-18), auto) repeat(${SIZES.length}, minmax(var(--Spacing-14), 1fr))`,
              gap: 'var(--Spacing-2)',
              alignItems: 'center',
            }}
          >
            <span />
            {SIZES.map(({ figma }) => (
              <span key={figma} style={matrixHeaderStyle}>
                {figma}
              </span>
            ))}
            {ATTENTIONS.map((attention) => (
              <React.Fragment key={attention}>
                <span style={matrixLabelStyle}>{attention}</span>
                {SIZES.map(({ figma, size }) => (
                  <div key={`${attention}-${figma}`} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SelectableSingleTextButton
                      aria-label={`size ${figma} attention ${attention}`}
                      size={size}
                      attention={attention}
                      defaultSelected
                      data-testid={`${P}-${figma}-${attention}`}
                    >
                      {TXT}
                    </SelectableSingleTextButton>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 12 — Attention × appearance matrix */}
      <QaStoryBand id="attention-appearance-matrix" title="12 Attention × appearance matrix" overflow>
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
            {MATRIX_ATTENTION_APPEARANCE_ROWS.map((appearance) => (
              <React.Fragment key={appearance}>
                <span style={matrixLabelStyle}>{appearance}</span>
                {ATTENTIONS.map((attention) => (
                  <div key={`${appearance}-${attention}`} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SelectableSingleTextButton
                      aria-label={`${attention} ${appearance}`}
                      attention={attention}
                      appearance={appearance}
                      defaultSelected
                      data-testid={`${P}-${attention}-${appearance}`}
                    >
                      {TXT}
                    </SelectableSingleTextButton>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 13 — Condensed × size */}
      <QaStoryBand id="condensed-size" title="13 Condensed × size" overflow>
        <QaApiSectionBody>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `minmax(var(--Spacing-22), auto) repeat(${SIZES.length}, minmax(var(--Spacing-14), 1fr))`,
              gap: 'var(--Spacing-2)',
              alignItems: 'center',
            }}
          >
            <span />
            {SIZES.map(({ figma }) => (
              <span key={figma} style={matrixHeaderStyle}>
                {figma}
              </span>
            ))}
            {([false, true] as const).map((condensed) => (
              <React.Fragment key={`c-${condensed}`}>
                <span style={matrixLabelStyle}>{`condensed=${condensed}`}</span>
                {SIZES.map(({ figma, size }) => (
                  <div key={`${condensed}-${figma}`} style={{ display: 'flex', justifyContent: 'center' }}>
                    <SelectableSingleTextButton
                      aria-label={`condensed ${condensed} size ${figma}`}
                      condensed={condensed}
                      size={size}
                      defaultSelected
                      data-testid={`${P}-condensed-${condensed}-size-${figma}`}
                    >
                      {TXT}
                    </SelectableSingleTextButton>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 14 — Key combinations */}
      <QaStoryBand id="combinations" title="14 Key combinations" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Disabled primary"
                appearance="primary"
                disabled
                defaultSelected
                data-testid={`${P}-disabled-primary`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>disabled=true · appearance=primary</span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Disabled negative"
                appearance="negative"
                disabled
                defaultSelected
                data-testid={`${P}-disabled-negative`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>disabled=true · appearance=negative</span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Disabled neutral"
                appearance="neutral"
                disabled
                defaultSelected
                data-testid={`${P}-disabled-neutral`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>disabled=true · appearance=neutral</span>
            </div>
            {SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCellWideFit}>
                <SelectableSingleTextButton
                  aria-label={`Loading size ${figma}`}
                  size={size}
                  loading
                  defaultSelected
                  data-testid={`${P}-loading-size-${figma}`}
                >
                  {TXT}
                </SelectableSingleTextButton>
                <span className={styles.scenarioCellCaption}>{`loading=true · size=${figma}`}</span>
              </div>
            ))}
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Loading primary"
                appearance="primary"
                loading
                defaultSelected
                data-testid={`${P}-loading-primary`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>loading=true · appearance=primary</span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Loading negative"
                appearance="negative"
                loading
                defaultSelected
                data-testid={`${P}-loading-negative`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>loading=true · appearance=negative</span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Condensed disabled false"
                condensed
                disabled={false}
                defaultSelected
                data-testid={`${P}-condensed-disabled-false`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>condensed=true · disabled=false</span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Condensed disabled true"
                condensed
                disabled
                defaultSelected
                data-testid={`${P}-condensed-disabled-true`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>condensed=true · disabled=true</span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Condensed loading"
                condensed
                loading
                defaultSelected
                data-testid={`${P}-condensed-loading`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>condensed=true · loading=true</span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="All defaults explicit"
                size="m"
                attention="high"
                appearance="primary"
                condensed={false}
                disabled={false}
                loading={false}
                defaultSelected={false}
                data-testid={`${P}-all-defaults-explicit`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>
                size=M, attention=high, appearance=primary, condensed=false, disabled=false, loading=false, selected=false
              </span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Minimised"
                size="s"
                attention="low"
                appearance="neutral"
                condensed
                disabled={false}
                loading={false}
                defaultSelected={false}
                data-testid={`${P}-minimised`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>
                size=S, attention=low, appearance=neutral, condensed=true, disabled=false, loading=false
              </span>
            </div>
            <div className={styles.scenarioLabeledCellWideFit}>
              <SelectableSingleTextButton
                aria-label="Stress test"
                size="l"
                attention="high"
                appearance="primary"
                condensed
                disabled={false}
                loading={false}
                defaultSelected
                data-testid={`${P}-stress-test`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>
                size=L, attention=high, appearance=primary, condensed=true, disabled=false, loading=false, selected=true
              </span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* SECTION 15 — Accent × appearance (blocked on accent prop) */}
      <QaStoryBand id="accent-appearance-matrix" title="15 Accent × appearance matrix (code only)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: accent × appearance matrix requires `accent` prop — not implemented on SelectableSingleTextButton yet. */}
          When <code>accent</code> exists, planned cells use{' '}
          <code>{`${P}-accent-primary-appearance-primary`}</code>-style ids. Until then, use <code>appearance</code> alone (see
          section 10).
        </p>
      </QaStoryBand>

      {/* SECTION 16 — Content × loading */}
      <QaStoryBand id="content-loading" title="16 Content × loading behaviour" overflow>
        <p className={styles.storySectionLead}>
          <code>loading=true</code> always shows the circular progress indicator and hides <code>children</code> text — there is
          no separate <code>content</code> prop to force spinner while idle.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGridDense}>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Text loading false"
                loading={false}
                defaultSelected
                data-testid={`${P}-content-text-loading-false`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>text · loading=false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Text loading true"
                loading
                defaultSelected
                data-testid={`${P}-content-text-loading-true`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>text · loading=true (text hidden)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Spinner idle not supported"
                loading={false}
                defaultSelected
                data-testid={`${P}-content-spinner-loading-false`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>
                circularProgressIndicator + loading=false — same as text (no standalone idle spinner prop)
              </span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <SelectableSingleTextButton
                aria-label="Spinner loading true"
                loading
                defaultSelected
                data-testid={`${P}-content-spinner-loading-true`}
              >
                {TXT}
              </SelectableSingleTextButton>
              <span className={styles.scenarioCellCaption}>circularProgressIndicator · loading=true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
