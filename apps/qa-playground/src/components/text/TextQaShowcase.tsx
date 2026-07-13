'use client';

import React, { type CSSProperties } from 'react';
import { Text } from '@oneui/ui/components/Text';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/* ─── Local style helpers ─────────────────────────────────── */

const rowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-20)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

const colLabelStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Low)',
  textAlign: 'center',
};

const SAMPLE = 'The quick brown fox jumps over the lazy dog';
const SAMPLE_SHORT = 'Sample text';
const LONG_SAMPLE =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

/* ─── Figma-aligned data tables ──────────────────────────── */

const FIGMA_VARIANTS = [
  { variant: 'display' as const, label: 'Display', size: 'L' as const, sample: 'Display' },
  { variant: 'headline' as const, label: 'Headline', size: 'L' as const, sample: 'Headline' },
  { variant: 'title' as const, label: 'Title', size: 'M' as const, sample: 'Title' },
  { variant: 'body' as const, label: 'Body', size: 'M' as const, sample: 'Body text' },
  { variant: 'label' as const, label: 'Label', size: 'M' as const, sample: 'Label' },
  { variant: 'code' as const, label: 'Code', size: 'M' as const, sample: 'const x = 42;' },
] as const;

const FIGMA_DISPLAY_SIZES = ['L', 'M', 'S'] as const;
const FIGMA_BODY_SIZES = ['2XL', 'XL', 'L', 'M', 'S', 'XS', '2XS'] as const;
const FIGMA_LABEL_SIZES = ['2XL', 'XL', 'L', 'M', 'S', 'XS', '2XS', '3XS'] as const;
const FIGMA_CODE_SIZES = ['M', 'S', 'XS'] as const;
const FIGMA_APPEARANCES = [
  'neutral', 'primary', 'secondary', 'sparkle',
  'positive', 'negative', 'warning', 'informative', 'brand-bg',
] as const;
const FIGMA_ATTENTIONS = ['high', 'medium', 'low', 'tintedA11y'] as const;
const FIGMA_WEIGHTS = ['high', 'medium', 'low'] as const;

type ComboRow = {
  caption: string;
  variant: 'body' | 'label' | 'title' | 'headline' | 'display' | 'code';
  size?: string;
  appearance?: string;
  attention?: 'high' | 'medium' | 'low' | 'tintedA11y';
  weight?: 'high' | 'medium' | 'low';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  sample: string;
};

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'Display L · primary · high',
    variant: 'display', size: 'L', appearance: 'primary', attention: 'high',
    sample: 'Hero headline',
  },
  {
    caption: 'Headline M · neutral · italic',
    variant: 'headline', size: 'M', italic: true,
    sample: 'Section header',
  },
  {
    caption: 'Body M · positive · underline',
    variant: 'body', size: 'M', appearance: 'positive', underline: true,
    sample: 'Success message',
  },
  {
    caption: 'Label S · negative · weight: high',
    variant: 'label', size: 'S', appearance: 'negative', weight: 'high',
    sample: 'Error label',
  },
  {
    caption: 'Code M · neutral · strikethrough',
    variant: 'code', size: 'M', strikethrough: true,
    sample: 'deprecated_fn()',
  },
  {
    caption: 'Body S · informative · tintedA11y attention · medium weight',
    variant: 'body', size: 'S', appearance: 'informative', attention: 'tintedA11y', weight: 'medium',
    sample: 'Contextual hint',
  },
  {
    caption: 'Title M · sparkle · low attention',
    variant: 'title', size: 'M', appearance: 'sparkle', attention: 'low',
    sample: 'Premium feature',
  },
  {
    caption: 'Label 3XS · neutral · low weight',
    variant: 'label', size: '3XS', weight: 'low',
    sample: 'Micro caption',
  },
];

/**
 * Text QA showcase — API-based scenarios, real-world usage, edge cases,
 * interaction validations, Figma-aligned variant/size/appearance grids,
 * surface context, and accessibility checks.
 *
 * **DOM contract:** `<Text>` does NOT spread `...rest`, so `data-testid` on
 * `<Text>` is silently dropped. Tests scope via `[data-section]` bands and
 * inspect `data-variant` / `data-size` / `data-appearance` attributes on the
 * rendered element. Wrapping `<span>` elements carry `data-testid` where
 * needed.
 */
export function TextQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">

      {/* ── Default ───────────────────────────────────────── */}
      <QaStoryBand id="text-qa-default" title="Default" centerContent>
        <span data-testid="text-default">
          <Text variant="body" size="M">
            {SAMPLE}
          </Text>
        </span>
      </QaStoryBand>

      {/* ── 1 API — Variants ──────────────────────────────── */}
      <QaStoryBand id="text-qa-variants" title="1 Variants (Figma — all 6 roles)" overflow>
        <p className={styles.storySectionLead}>
          All 6 typography roles: <strong>display</strong>, <strong>headline</strong>,{' '}
          <strong>title</strong>, <strong>body</strong>, <strong>label</strong>, and{' '}
          <strong>code</strong>. Resolves role-specific CSS tokens.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_VARIANTS.map(({ variant, label, size, sample }) => (
              <div key={variant} className={styles.scenarioLabeledCell}>
                <span style={rowLabelStyle}>{label}</span>
                <span data-testid={`text-variant-${variant}`}>
                  <Text variant={variant} size={size as never}>
                    {sample}
                  </Text>
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 2 Body Sizes ──────────────────────────────────── */}
      <QaStoryBand id="text-qa-body-sizes" title="2 Body Sizes (2XS → 2XL)" overflow>
        <p className={styles.storySectionLead}>
          Body variant supports 7 sizes: <code>2XS</code> through <code>2XL</code>. Resolves to
          corresponding <code>--Body-{'{size}'}-FontSize</code> tokens.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            {FIGMA_BODY_SIZES.map((size) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <span style={rowLabelStyle}>{size}</span>
                <span data-testid={`text-body-${size}`}>
                  <Text variant="body" size={size}>
                    {SAMPLE_SHORT}
                  </Text>
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 3 Label Sizes ─────────────────────────────────── */}
      <QaStoryBand id="text-qa-label-sizes" title="3 Label Sizes (3XS → 2XL)" overflow>
        <p className={styles.storySectionLead}>
          Label variant supports 8 sizes including <code>3XS</code> (unique to label; body does not
          support it). Resolves to <code>--Label-{'{size}'}-FontSize</code> tokens.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            {FIGMA_LABEL_SIZES.map((size) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <span style={rowLabelStyle}>{size}</span>
                <span data-testid={`text-label-${size}`}>
                  <Text variant="label" size={size}>
                    {SAMPLE_SHORT}
                  </Text>
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 4 Display / Headline / Title Sizes ────────────── */}
      <QaStoryBand id="text-qa-display-sizes" title="4 Display · Headline · Title Sizes (S / M / L)" overflow>
        <p className={styles.storySectionLead}>
          Display, Headline, and Title variants share the same 3 sizes: <code>S</code>,{' '}
          <code>M</code>, <code>L</code>. Resolves role-specific size tokens.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
            {(['display', 'headline', 'title'] as const).map((variant) => (
              <div key={variant} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
                <span style={{ ...rowLabelStyle, minWidth: 'auto', textTransform: 'capitalize' }}>
                  {variant}
                </span>
                <div className={styles.scenarioFlexRow}>
                  {FIGMA_DISPLAY_SIZES.map((size) => (
                    <div key={size} className={styles.scenarioLabeledCell}>
                      <span data-testid={`text-${variant}-${size.toLowerCase()}`}>
                        <Text variant={variant} size={size}>
                          {size}
                        </Text>
                      </span>
                      <span style={colLabelStyle}>{size}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 5 Code Sizes ──────────────────────────────────── */}
      <QaStoryBand id="text-qa-code-sizes" title="5 Code Sizes (XS / S / M)" overflow>
        <p className={styles.storySectionLead}>
          Code variant: <code>XS</code>, <code>S</code>, <code>M</code>. Uses monospace font slot{' '}
          <code>--Typography-Font-Code</code>.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            {FIGMA_CODE_SIZES.map((size) => (
              <div key={size} className={styles.scenarioLabeledCell}>
                <span style={rowLabelStyle}>{size}</span>
                <span data-testid={`text-code-${size.toLowerCase()}`}>
                  <Text variant="code" size={size}>
                    {'const answer = 42;'}
                  </Text>
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 6 Attention × Weight ──────────────────────────── */}
      <QaStoryBand id="text-qa-attention-weight" title="6 Attention · Weight" overflow>
        <p className={styles.storySectionLead}>
          <code>attention</code> controls colour prominence (<code>high</code> / <code>medium</code>{' '}
          / <code>low</code> / <code>tintedA11y</code>). <code>weight</code> controls font emphasis
          (<code>high</code> / <code>medium</code> / <code>low</code>). Attention{' '}
          <code>none</code> resolves to <code>high</code>.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
            {FIGMA_ATTENTIONS.map((attention) => (
              <div key={attention} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={rowLabelStyle}>{attention}</span>
                {FIGMA_WEIGHTS.map((weight) => (
                  <div key={weight} className={styles.scenarioLabeledCell}>
                    <span data-testid={`text-attention-${attention}-weight-${weight}`}>
                      <Text variant="body" size="M" attention={attention} weight={weight}>
                        {SAMPLE_SHORT}
                      </Text>
                    </span>
                    <span style={colLabelStyle}>{weight}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 7 Appearances ─────────────────────────────────── */}
      <QaStoryBand id="text-qa-appearances" title="7 Appearances (Figma — all 9 roles + auto)" overflow>
        <p className={styles.storySectionLead}>
          All 9 multi-accent roles plus <code>auto</code> (resolves to neutral). Each row shows{' '}
          <code>high</code> and <code>tintedA11y</code> attention so colour fidelity is visible.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {(['auto', ...FIGMA_APPEARANCES] as const).map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={rowLabelStyle}>{appearance}</span>
                <span data-testid={`text-appearance-${appearance}-high`}>
                  <Text variant="body" size="M" appearance={appearance} attention="high">
                    High
                  </Text>
                </span>
                <span data-testid={`text-appearance-${appearance}-tintedA11y`}>
                  <Text variant="body" size="M" appearance={appearance} attention="tintedA11y">
                    TintedA11y
                  </Text>
                </span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 8 Decorations ─────────────────────────────────── */}
      <QaStoryBand id="text-qa-decorations" title="8 Decorations (Figma — italic · underline · strikethrough)" overflow>
        <p className={styles.storySectionLead}>
          Boolean decoration flags: <code>italic</code>, <code>underline</code>,{' '}
          <code>strikethrough</code>. All three can be combined.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-italic">
                <Text variant="body" size="M" italic>
                  Italic text
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>italic</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-underline">
                <Text variant="body" size="M" underline>
                  Underlined text
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>underline</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-strikethrough">
                <Text variant="body" size="M" strikethrough>
                  Strikethrough text
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>strikethrough</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-italic-underline">
                <Text variant="body" size="M" italic underline>
                  Italic + underline
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>italic + underline</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-all-decorations">
                <Text variant="body" size="M" italic underline strikethrough>
                  All decorations
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>italic + underline + strikethrough</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 9 Text Alignment ──────────────────────────────── */}
      <QaStoryBand id="text-qa-alignment" title="9 Text Alignment (Figma — left · center · right)" overflow>
        <p className={styles.storySectionLead}>
          <code>textAlign</code> aligns block-level text. Requires the text element to have a
          defined width for alignment to be visible.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', maxWidth: '400px', width: '100%' }}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-align-left">
                <Text variant="body" size="M" textAlign="left" as="p" style={{ width: '100%' }}>
                  Left-aligned paragraph text for testing.
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>textAlign: left</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-align-center">
                <Text variant="body" size="M" textAlign="center" as="p" style={{ width: '100%' }}>
                  Centre-aligned paragraph text for testing.
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>textAlign: center</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-align-right">
                <Text variant="body" size="M" textAlign="right" as="p" style={{ width: '100%' }}>
                  Right-aligned paragraph text for testing.
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>textAlign: right</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 10 Truncation (maxLines) ──────────────────────── */}
      <QaStoryBand id="text-qa-truncation" title="10 Truncation — maxLines" overflow>
        <p className={styles.storySectionLead}>
          <code>maxLines</code> applies <code>-webkit-line-clamp</code> via{' '}
          <code>--_text-max-lines</code> CSS variable. Requires the container to have a constrained
          width.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-maxlines-1">
                <Text variant="body" size="M" maxLines={1} as="p" style={{ maxWidth: '240px' }}>
                  {LONG_SAMPLE}
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>maxLines: 1 (ellipsis after 1 line)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-maxlines-3">
                <Text variant="body" size="M" maxLines={3} as="p" style={{ maxWidth: '240px' }}>
                  {LONG_SAMPLE}
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>maxLines: 3 (clamp at 3 lines)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-maxlines-none">
                <Text variant="body" size="M" as="p" style={{ maxWidth: '240px' }}>
                  {LONG_SAMPLE}
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>no maxLines (unrestricted)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 11 Semantic / polymorphic `as` ─────────────────── */}
      <QaStoryBand id="text-qa-semantic" title="11 Semantic Elements (as prop)" overflow>
        <p className={styles.storySectionLead}>
          <code>as</code> is polymorphic — defaults to <code>span</code>. Pass heading levels,{' '}
          <code>p</code>, <code>code</code>, or <code>a</code> for semantic HTML. Token resolution is
          unchanged; semantics are author-controlled.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((tag) => (
              <div key={tag} className={styles.scenarioLabeledCell}>
                <span style={rowLabelStyle}>{`as="${tag}"`}</span>
                <span data-testid={`text-as-${tag}`}>
                  <Text variant="headline" size="M" as={tag}>
                    {`Heading level ${tag.slice(1)}`}
                  </Text>
                </span>
              </div>
            ))}
            <div className={styles.scenarioLabeledCell}>
              <span style={rowLabelStyle}>{'as="p"'}</span>
              <span data-testid="text-as-p">
                <Text variant="body" size="M" as="p">
                  Paragraph element with body typography.
                </Text>
              </span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span style={rowLabelStyle}>{'as="code"'}</span>
              <span data-testid="text-as-code">
                <Text variant="code" size="M" as="code">
                  {'inline_code()'}
                </Text>
              </span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span style={rowLabelStyle}>{'as="span" (default)'}</span>
              <span data-testid="text-as-span">
                <Text variant="body" size="M">
                  Default span element.
                </Text>
              </span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 12 Anchor (as="a") ────────────────────────────── */}
      <QaStoryBand id="text-qa-anchor" title="12 Anchor — as=&quot;a&quot; with href" overflow>
        <p className={styles.storySectionLead}>
          When <code>as="a"</code> and <code>href</code> is set, the component renders as a native
          anchor. <code>target</code> and <code>rel</code> are forwarded through anchor-specific
          prop handling in <code>Text.tsx</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-anchor-basic">
                <Text as="a" href="https://example.com" appearance="primary" attention="tintedA11y" underline>
                  Basic anchor link
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>as="a" + href</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-anchor-target-blank">
                <Text as="a" href="https://example.com" target="_blank" rel="noopener noreferrer" appearance="primary" attention="tintedA11y" underline>
                  Opens in new tab
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>target="_blank" + rel</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-anchor-hash">
                <Text as="a" href="#section" appearance="informative" attention="tintedA11y">
                  In-page anchor
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>href="#section" (in-page)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 13 Link slot ──────────────────────────────────── */}
      <QaStoryBand id="text-qa-link-slot" title="13 Link slot" overflow>
        <p className={styles.storySectionLead}>
          The <code>link</code> prop renders its content in a trailing <code>.linkSlot</code> span
          after the main content. Useful for inline "Read more" links.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-link-slot">
                <Text
                  variant="body"
                  size="M"
                  link={
                    <Text as="a" href="#" appearance="primary" attention="tintedA11y" underline>
                      Read more
                    </Text>
                  }
                >
                  Check the documentation before continuing.{' '}
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>link slot with inline anchor</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-link-slot-null">
                <Text variant="body" size="M">
                  No link slot rendered here.
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>no link slot (link=undefined)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 14 Surface context ────────────────────────────── */}
      <QaStoryBand id="text-qa-surface" title="14 Surface Context (Figma — token remapping)" overflow>
        <p className={styles.storySectionLead}>
          Text inside <code>[data-surface]</code> containers automatically adapts via brand CSS
          token remapping. No JavaScript logic — pure CSS cascade.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(
              [
                { mode: 'default' as const, label: 'default' },
                { mode: 'minimal' as const, label: 'minimal' },
                { mode: 'subtle' as const, label: 'subtle' },
                { mode: 'moderate' as const, label: 'moderate' },
                { mode: 'bold' as const, label: 'bold' },
                { mode: 'elevated' as const, label: 'elevated' },
              ] as const
            ).map(({ mode, label }) => (
              <div key={mode} className={styles.scenarioLabeledCell}>
                <Surface
                  mode={mode}
                  data-testid={`text-surface-${mode}`}
                  style={{
                    padding: 'var(--Spacing-4)',
                    borderRadius: 'var(--Shape-M)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--Spacing-2)',
                    minWidth: '120px',
                  }}
                >
                  <Text variant="title" size="S" attention="high" as="div">
                    Title
                  </Text>
                  <Text variant="body" size="S" attention="medium" as="div">
                    Body medium
                  </Text>
                  <Text variant="label" size="XS" attention="low" as="div">
                    Caption low
                  </Text>
                </Surface>
                <span className={styles.scenarioCellCaption}>{label}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 15 Real-world usage scenarios ─────────────────── */}
      <QaStoryBand id="text-qa-realworld" title="15 Real-world Usage Scenarios" overflow>
        <p className={styles.storySectionLead}>
          Representative in-product compositions: article header, product card, error state, pricing
          block, and metadata row.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-realworld-article">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)', maxWidth: '280px' }}>
                  <Text variant="display" size="M" as="h1">
                    Article Headline
                  </Text>
                  <Text variant="body" size="M" attention="medium" as="p">
                    A short introductory paragraph that provides context for the article. Written in
                    medium-attention body text.
                  </Text>
                  <Text variant="label" size="S" attention="low" as="span">
                    Published · 3 min read
                  </Text>
                </div>
              </span>
              <span className={styles.scenarioCellCaption}>Article header composition</span>
            </div>

            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-realworld-error">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
                  <Text variant="title" size="S" appearance="negative" attention="high" as="h3">
                    Payment Failed
                  </Text>
                  <Text variant="body" size="S" appearance="negative" attention="medium" as="p">
                    Your card was declined. Please try a different payment method.
                  </Text>
                </div>
              </span>
              <span className={styles.scenarioCellCaption}>Error state (negative appearance)</span>
            </div>

            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-realworld-pricing">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
                  <Text variant="label" size="S" attention="low">
                    Monthly plan
                  </Text>
                  <Text variant="display" size="S" appearance="primary" attention="high" as="div">
                    ₹499
                  </Text>
                  <Text variant="body" size="XS" attention="low" strikethrough>
                    ₹799
                  </Text>
                </div>
              </span>
              <span className={styles.scenarioCellCaption}>Pricing with strike-through</span>
            </div>

            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-realworld-success">
                <Text variant="body" size="M" appearance="positive" attention="high">
                  Profile updated successfully.
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>Success message (positive)</span>
            </div>

            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-realworld-metadata">
                <div style={{ display: 'flex', gap: 'var(--Spacing-3)', flexWrap: 'wrap' }}>
                  <Text variant="label" size="XS" attention="low">Category: Tech</Text>
                  <Text variant="label" size="XS" attention="low">·</Text>
                  <Text variant="label" size="XS" attention="low">5 min read</Text>
                </div>
              </span>
              <span className={styles.scenarioCellCaption}>Metadata row (label XS · low)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 16 Edge cases ─────────────────────────────────── */}
      <QaStoryBand id="text-qa-edge-cases" title="16 Edge Cases" overflow>
        <p className={styles.storySectionLead}>
          Boundary conditions: empty children, very long single word, emoji, invalid size fallback,
          zero maxLines, and the deprecated <code>language</code> prop.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-edge-empty">
                <Text variant="body" size="M">
                  {''}
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>empty children (no crash)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-edge-long-word">
                <Text variant="body" size="M" style={{ maxWidth: '120px', overflowWrap: 'break-word' }}>
                  Supercalifragilisticexpialidocious
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>very long single word (break-word)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-edge-emoji">
                <Text variant="body" size="M">
                  🚀 Emoji support ✅
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>emoji in content</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-edge-maxlines-zero">
                <Text variant="body" size="M" maxLines={0} style={{ maxWidth: '160px' }}>
                  {LONG_SAMPLE}
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>maxLines=0 (no clamp applied)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-edge-size-fallback">
                <Text variant="body" size={'3XS' as never}>
                  Body 3XS falls back to 2XS
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>body + invalid size → fallback 2XS</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-edge-text-prop">
                <Text variant="body" size="M" text="Content via text prop" />
              </span>
              <span className={styles.scenarioCellCaption}>text prop alias (no children)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 17 Accessibility validation ───────────────────── */}
      <QaStoryBand id="text-qa-a11y" title="17 Accessibility Validation (WCAG 2.1 AA)" overflow>
        <p className={styles.storySectionLead}>
          WCAG 2.1 AA requirements for text components: semantic heading hierarchy, anchor names,
          aria-label on decorative elements, aria-hidden, lang attribute for screen readers.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-a11y-heading-h1">
                <Text variant="display" size="L" as="h1">
                  Page Title (h1)
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>h1 — semantic page heading</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-a11y-heading-h2">
                <Text variant="headline" size="M" as="h2">
                  Section Heading (h2)
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>h2 — section heading</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-a11y-anchor-name">
                <Text as="a" href="https://example.com" appearance="primary" attention="tintedA11y" underline>
                  Accessible link name
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>anchor — explicit text = accessible name</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-a11y-aria-label">
                <Text variant="body" size="M" aria-label="Custom accessible name">
                  Overridden by aria-label
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>aria-label overrides visible text</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-a11y-aria-hidden">
                <Text variant="body" size="S" aria-hidden={true}>
                  Decorative (hidden from AT)
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>aria-hidden="true" (decorative)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span data-testid="text-a11y-lang">
                <Text variant="body" size="M" lang="hi">
                  नमस्ते (Hindi)
                </Text>
              </span>
              <span className={styles.scenarioCellCaption}>lang="hi" (script inference)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 18 Combination matrix ─────────────────────────── */}
      <QaStoryBand id="text-qa-combos" title="18 Combination Matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <span data-testid={`text-combo-${index}`}>
                  <Text
                    variant={row.variant}
                    size={row.size as never}
                    appearance={row.appearance as never}
                    attention={row.attention}
                    weight={row.weight}
                    italic={row.italic}
                    underline={row.underline}
                    strikethrough={row.strikethrough}
                  >
                    {row.sample}
                  </Text>
                </span>
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

    </QaShowcaseRoot>
  );
}
