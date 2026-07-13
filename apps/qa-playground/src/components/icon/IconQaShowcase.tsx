'use client';

import type { CSSProperties, ReactNode } from 'react';
import { Icon, ICON_SIZES } from '@oneui/ui/components/Icon';
import type { IconAppearance, IconEmphasis, IconProps, IconSize } from '@oneui/ui/components/Icon/shared';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/**
 * Neutral minimal surface — same as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`
 * so icon tokens remap against the same parent step as Bottom Navigation QA strips.
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

/** Shared row-label style — matches Stepper / Checkbox QA pages */
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
 * Figma API table: appearance — 8 colour roles (variable mode).
 * Order matches the attached Figma property screenshot.
 */
const FIGMA_APPEARANCE: readonly IconAppearance[] = [
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
 * Figma API table: emphasis — 5 on-colour levels (colour token).
 * Figma labels: high / medium [text] / low [text] / tinted / tintedA11y
 */
const FIGMA_EMPHASIS: { value: IconEmphasis; figmaLabel: string }[] = [
  { value: 'high',        figmaLabel: 'high' },
  { value: 'medium',      figmaLabel: 'medium [text]' },
  { value: 'low',         figmaLabel: 'low [text]' },
  { value: 'tinted',      figmaLabel: 'tinted' },
  { value: 'tintedA11y',  figmaLabel: 'tintedA11y' },
];

/** Surface modes exercised in the surface-context band. */
const SURFACE_MODES = [
  { mode: 'default'  as const, label: 'default',  desc: 'page background' },
  { mode: 'minimal'  as const, label: 'minimal',  desc: 'light tint' },
  { mode: 'subtle'   as const, label: 'subtle',   desc: 'medium tint' },
  { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
  { mode: 'bold'     as const, label: 'bold',     desc: 'full accent (inversion point)' },
  { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
];

type ComboRow = { caption: string; props: IconProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'size 8 · primary · high',
    props: { icon: 'heart', size: '8', appearance: 'primary', emphasis: 'high', 'aria-label': 'Heart high' },
  },
  {
    caption: 'size 5 · secondary · tintedA11y',
    props: { icon: 'star', size: '5', appearance: 'secondary', emphasis: 'tintedA11y', 'aria-label': 'Star tintedA11y' },
  },
  {
    caption: 'size 10 · negative · tinted',
    props: { icon: 'heart', size: '10', appearance: 'negative', emphasis: 'tinted', 'aria-label': 'Negative tinted' },
  },
  {
    caption: 'size 3 · positive · medium',
    props: { icon: 'check', size: '3', appearance: 'positive', emphasis: 'medium', 'aria-label': 'Positive medium' },
  },
  {
    caption: 'size 16 · sparkle · high',
    props: { icon: 'star', size: '16', appearance: 'sparkle', emphasis: 'high', 'aria-label': 'Sparkle high' },
  },
  {
    caption: 'size 6 · warning · low',
    props: { icon: 'heart', size: '6', appearance: 'warning', emphasis: 'low', 'aria-label': 'Warning low' },
  },
  {
    caption: 'size 12 · informative · tintedA11y',
    props: { icon: 'search', size: '12', appearance: 'informative', emphasis: 'tintedA11y', 'aria-label': 'Informative tintedA11y' },
  },
  {
    caption: 'size 24 · neutral · high (decorative)',
    props: { icon: 'home', size: '24', appearance: 'neutral', emphasis: 'high' },
  },
];

/**
 * Icon QA playground — Figma API sections, code-only notes, combination matrix.
 *
 * Figma API table (node 2342:40776):
 *   size        → variable mode (20 values: 2 – 40)
 *   appearance  → variable mode (8 colour roles)
 *   emphasis    → colour token (5 levels)
 *
 * Additional code-only props (not in the attached Figma API table):
 *   icon, aria-label, aria-hidden
 */
export function IconQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">

      {/* ─── Default ──────────────────────────────────────────────────────────── */}
      <QaStoryBand id="icon-qa-default" title="Default" centerContent>
        <QaNeutralSurfaceFrame>
          <Icon
            icon="heart"
            data-testid="icon-default"
            aria-label="Heart"
          />
        </QaNeutralSurfaceFrame>
      </QaStoryBand>

      {/* ─── 1 · Size ─────────────────────────────────────────────────────────── */}
      <QaStoryBand id="icon-qa-size" title="1 Size (Figma variable mode — 20 values)" overflow>
        <p className={styles.storySectionLead}>
          Figma maps <strong>size</strong> to spacing variable mode indices. Code uses <code>IconSize</code> — a union of{' '}
          20 string literals matching spacing token indices (<code>2</code> → <code>40</code>). Default:{' '}
          <code>&apos;5&apos;</code> (20 × 20 px).
        </p>
        <p className={styles.storySectionLead}>
          All 20 sizes rendered below at <code>appearance=&quot;primary&quot;</code>,{' '}
          <code>emphasis=&quot;high&quot;</code>.
        </p>
        <QaApiSectionBody
          scrollable
          scrollableRegionLabel="Icon size scenarios"
        >
          <QaNeutralSurfaceFrame style={{ width: 'max-content', maxWidth: '100%' }}>
            <div className={styles.scenarioFlexRow}>
              {(ICON_SIZES as readonly IconSize[]).map((size) => (
                <div key={size} className={styles.scenarioLabeledCell}>
                  <Icon
                    icon="heart"
                    size={size}
                    appearance="primary"
                    emphasis="high"
                    aria-label={`Size ${size}`}
                    data-testid={`icon-size-${size}`}
                  />
                  <span className={styles.scenarioCellCaption}>{`size: ${size}`}</span>
                </div>
              ))}
            </div>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ─── 2 · Appearance ───────────────────────────────────────────────────── */}
      <QaStoryBand id="icon-qa-appearance" title="2 Appearance (Figma variable mode — 8 colour roles)" overflow>
        <p className={styles.storySectionLead}>
          Figma lists 8 colour roles as a variable mode. Code exposes <code>appearance?: IconAppearance</code>.{' '}
          Unlike <code>Stepper</code>, Icon does <strong>not</strong> include <code>auto</code> or{' '}
          <code>brand-bg</code> — the type is its own 8-member union (see{' '}
          <code>packages/ui/src/components/Icon/Icon.shared.ts</code>). Slot-parent inheritance fills the appearance{' '}
          when omitted inside an <code>IconButton</code>/<code>Button</code>.
        </p>
        <p className={styles.storySectionLead}>
          Each row shows all 5 emphasis levels for that role. Fixed <code>size=&quot;8&quot;</code>.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div
                key={appearance}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}
              >
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <QaNeutralSurfaceFrame style={{ flex: '1 1 auto' }}>
                  {FIGMA_EMPHASIS.map(({ value: emphasis, figmaLabel }) => (
                    <div key={emphasis} className={styles.scenarioLabeledCell}>
                      <Icon
                        icon="heart"
                        size="8"
                        appearance={appearance}
                        emphasis={emphasis}
                        aria-label={`${appearance} ${figmaLabel}`}
                        data-testid={`icon-appearance-${appearance}-${emphasis}`}
                      />
                      <span className={styles.scenarioCellCaption}>{figmaLabel}</span>
                    </div>
                  ))}
                </QaNeutralSurfaceFrame>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ─── 3 · Emphasis ─────────────────────────────────────────────────────── */}
      <QaStoryBand id="icon-qa-emphasis" title="3 Emphasis (Figma colour token — 5 levels)" overflow>
        <p className={styles.storySectionLead}>
          Figma lists <strong>emphasis</strong> as a colour token property with five options:{' '}
          <code>high</code> / <code>medium [text]</code> / <code>low [text]</code> / <code>tinted</code> /{' '}
          <code>tintedA11y</code>. Code maps these exactly via <code>IconEmphasis</code>. Default:{' '}
          <code>&apos;high&apos;</code>.
        </p>
        <p className={styles.storySectionLead}>
          Token mappings: <code>high</code> → <code>--&#123;Role&#125;-High</code> |{' '}
          <code>medium</code> → <code>--&#123;Role&#125;-Medium-Text</code> |{' '}
          <code>low</code> → <code>--&#123;Role&#125;-Low</code> |{' '}
          <code>tinted</code> → <code>--&#123;Role&#125;-Tinted</code> |{' '}
          <code>tintedA11y</code> → <code>--&#123;Role&#125;-TintedA11y</code>.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <div className={styles.scenarioFlexRow}>
              {FIGMA_EMPHASIS.map(({ value: emphasis, figmaLabel }) => (
                <div key={emphasis} className={styles.scenarioLabeledCell}>
                  <Icon
                    icon="heart"
                    size="10"
                    appearance="primary"
                    emphasis={emphasis}
                    aria-label={figmaLabel}
                    data-testid={`icon-emphasis-${emphasis}`}
                  />
                  <span className={styles.scenarioCellCaption}>{figmaLabel}</span>
                </div>
              ))}
            </div>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Note: <code>tinted</code> and <code>tintedA11y</code> use role accent colour — they are most visible
          with a non-neutral appearance (e.g. <code>primary</code> above). On <code>neutral</code>,{' '}
          <code>tinted</code> resolves close to <code>low</code>.
        </p>
      </QaStoryBand>

      {/* ─── 4 · Accessibility: aria-label + decorative ───────────────────────── */}
      <QaStoryBand id="icon-qa-a11y" title="4 Accessibility — aria-label · decorative — not in attached Figma API table ⚠️" overflow>
        <p className={styles.storySectionLead}>
          The Figma property table does <strong>not</strong> list <code>aria-label</code> or{' '}
          <code>aria-hidden</code> as explicit props. In code, <code>aria-label</code> toggles between a semantic
          image (<code>role=&quot;img&quot;</code>) and a fully decorative icon (<code>aria-hidden=&quot;true&quot;</code>
          , default). Use a label only when the icon conveys meaning not expressed in adjacent text.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <div className={styles.scenarioFlexRow}>
              <div className={styles.scenarioLabeledCell}>
                <Icon
                  icon="heart"
                  size="8"
                  appearance="primary"
                  emphasis="high"
                  aria-label="Favourited"
                  data-testid="icon-a11y-labelled"
                />
                <span className={styles.scenarioCellCaption}>
                  aria-label=&quot;Favourited&quot; → role=&quot;img&quot; (semantic)
                </span>
              </div>
              <div className={styles.scenarioLabeledCell}>
                <Icon
                  icon="heart"
                  size="8"
                  appearance="neutral"
                  emphasis="medium"
                  data-testid="icon-a11y-decorative"
                />
                <span className={styles.scenarioCellCaption}>
                  no aria-label → aria-hidden=&quot;true&quot; (decorative, default) ⚠️
                </span>
              </div>
              <div className={styles.scenarioLabeledCell}>
                <Icon
                  icon="heart"
                  size="8"
                  appearance="neutral"
                  emphasis="high"
                  aria-hidden={false}
                  data-testid="icon-a11y-aria-hidden-false"
                />
                <span className={styles.scenarioCellCaption}>
                  aria-hidden=false (explicit override) ⚠️
                </span>
              </div>
            </div>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ─── 5 · icon as ReactElement — code-only ────────────────────────────── */}
      <QaStoryBand id="icon-qa-react-element" title="5 icon as ReactElement — not in attached Figma API table ⚠️" overflow>
        <p className={styles.storySectionLead}>
          Figma only models the semantic icon name. In code, <code>icon</code> also accepts any{' '}
          <code>ReactElement</code> — useful for custom SVG or third-party icon sets not covered by the Jio
          semantic registry. The wrapper <code>&lt;span&gt;</code> still emits <code>data-size</code>,{' '}
          <code>data-appearance</code>, <code>data-emphasis</code> data attributes and inherits{' '}
          <code>currentColor</code> via the CSS Module.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <div className={styles.scenarioFlexRow}>
              <div className={styles.scenarioLabeledCell}>
                <Icon
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      width="1em"
                      height="1em"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  }
                  size="8"
                  appearance="sparkle"
                  emphasis="high"
                  aria-label="Custom circle icon"
                  data-testid="icon-react-element"
                />
                <span className={styles.scenarioCellCaption}>icon as ReactElement (custom SVG) ⚠️</span>
              </div>
            </div>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ─── 6 · Surface Context ──────────────────────────────────────────────── */}
      <QaStoryBand id="icon-qa-surface-context" title="6 Surface Context — tokens remap inside [data-surface]" overflow>
        <p className={styles.storySectionLead}>
          Icon is surface-context-aware via CSS token remapping. On a{' '}
          <code>mode=&quot;bold&quot;</code> surface the <code>--Primary-High</code> token flips to the contrasting
          extreme of that step, so a <code>high</code> emphasis icon stays legible with zero JS. Each surface below
          renders all 5 emphasis levels at <code>appearance=&quot;primary&quot;</code>, size <code>8</code>.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {SURFACE_MODES.map(({ mode, label, desc }) => (
              <div
                key={mode}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--Typography-Font-Primary)',
                    fontSize: 'var(--Label-S-FontSize)',
                    lineHeight: 'var(--Label-S-LineHeight)',
                    fontWeight: 'var(--Label-FontWeight-Low)',
                    color: 'var(--Text-Medium)',
                  }}
                >
                  {label} — {desc}
                </span>
                <Surface
                  mode={mode}
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 'var(--Spacing-4-5)',
                    padding: 'var(--Spacing-4-5)',
                    borderRadius: 'var(--Shape-L)',
                  }}
                  data-testid={`icon-surface-${mode}`}
                >
                  {FIGMA_EMPHASIS.map(({ value: emphasis, figmaLabel }) => (
                    <div key={emphasis} className={styles.scenarioLabeledCell}>
                      <Icon
                        icon="heart"
                        size="8"
                        appearance="primary"
                        emphasis={emphasis}
                        aria-label={`${label} ${figmaLabel}`}
                        data-testid={`icon-surface-${mode}-${emphasis}`}
                      />
                      <span
                        className={styles.scenarioCellCaption}
                        style={{ color: 'var(--Text-Medium)' }}
                      >
                        {figmaLabel}
                      </span>
                    </div>
                  ))}
                </Surface>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ─── 7 · Multiple icon names ──────────────────────────────────────────── */}
      <QaStoryBand id="icon-qa-icon-names" title="7 Semantic icon names (Jio icon set)" overflow>
        <p className={styles.storySectionLead}>
          Verifies that the <code>icon</code> prop resolves different semantic names from the Jio icon set via{' '}
          <code>IconResolver</code>. All shown at <code>size=&quot;8&quot;</code>, <code>appearance=&quot;neutral&quot;</code>,{' '}
          <code>emphasis=&quot;high&quot;</code>.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame>
            <div className={styles.scenarioFlexRow}>
              {(['heart', 'star', 'check', 'search', 'settings', 'home'] as const).map((name) => (
                <div key={name} className={styles.scenarioLabeledCell}>
                  <Icon
                    icon={name}
                    size="8"
                    appearance="neutral"
                    emphasis="high"
                    aria-label={name}
                    data-testid={`icon-name-${name}`}
                  />
                  <span className={styles.scenarioCellCaption}>{`icon: "${name}"`}</span>
                </div>
              ))}
            </div>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ─── 8 · Combination matrix ───────────────────────────────────────────── */}
      <QaStoryBand id="icon-qa-combos" title="8 Combination matrix" overflow>
        <p className={styles.storySectionLead}>
          Cross-prop combinations covering representative size × appearance × emphasis triples, including
          decorative (no <code>aria-label</code>) and semantic uses.
        </p>
        <QaApiSectionBody>
          <QaNeutralSurfaceFrame style={{ width: '100%' }}>
            <div className={styles.scenarioComboGrid}>
              {COMBO_MATRIX.map((row, index) => (
                <div key={row.caption} className={styles.scenarioLabeledCell}>
                  <Icon {...row.props} data-testid={`icon-combo-${index}`} />
                  <span className={styles.scenarioCellCaption}>{row.caption}</span>
                </div>
              ))}
            </div>
          </QaNeutralSurfaceFrame>
        </QaApiSectionBody>
      </QaStoryBand>

    </QaShowcaseRoot>
  );
}
