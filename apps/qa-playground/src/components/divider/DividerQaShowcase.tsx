'use client';

import type { CSSProperties } from 'react';
import { Divider } from '@oneui/ui/components/Divider';
import { Icon } from '@oneui/ui/components/Icon';
import type {
  DividerAppearance,
  DividerAttention,
  DividerContent,
  DividerContentAlign,
  DividerProps,
  DividerSize,
} from '@oneui/ui/components/Divider';
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

/** Figma S/M/L ↔ code `size` (lowercase). Stroke width per Figma API table. */
const FIGMA_SIZES: { figma: string; size: DividerSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

/** Figma appearance variable modes (+ `auto`). Same order as `Divider.stories.tsx` argTypes. */
// TODO: When `brand-bg` is added to `DividerAppearance`, add a QA band mirroring Checkbox `brand-bg` Figma coverage.
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
] as const satisfies readonly DividerAppearance[];

const dividerSlotIcon = <Icon icon="heart" aria-hidden />;

const verticalStripStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  minHeight: 'var(--Spacing-18)',
  width: '100%',
};

type ComboRow = { caption: string; props: DividerProps };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'horizontal · M · neutral · low · none', props: { orientation: 'horizontal', size: 'm', appearance: 'neutral', attention: 'low', content: 'none' } },
  { caption: 'vertical · S · primary · high · none', props: { orientation: 'vertical', size: 's', appearance: 'primary', attention: 'high', content: 'none' } },
  { caption: 'horizontal · L · secondary · medium · icon · center', props: { size: 'l', appearance: 'secondary', attention: 'medium', content: 'icon', contentAlign: 'center' } },
  { caption: 'horizontal · M · sparkle · high · label · end', props: { appearance: 'sparkle', attention: 'high', content: 'label', contentAlign: 'end' } },
  { caption: 'M · warning · roundCaps · label', props: { appearance: 'warning', attention: 'high', content: 'label', roundCaps: true } },
  { caption: 'M · informative · start · icon', props: { appearance: 'informative', attention: 'medium', content: 'icon', contentAlign: 'start' } },
];

/**
 * Divider QA playground — Figma API sections, code-only notes, combination matrix.
 * The **Divider - Figma Validation** tab (`DividerFigmaValidationShowcase`) hosts two 162-cell
 * Cartesian matrices (horizontal and vertical), structured like {@link apps/button-figma-validation/src/FigmaButtonParityPage.tsx}.
 * `data-testid` is forwarded on the root separator only ({@link packages/ui/src/components/Divider/Divider.tsx}).
 */
export function DividerQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="divider-qa-default" title="Default" centerContent>
        {/*
          Parent uses align-items: center — a width:100% child can collapse to 0 intrinsic width.
          Use a definite token width so the horizontal rule lays out for a11y / Playwright.
        */}
        <div style={{ width: 'var(--Spacing-40)', maxWidth: '100%' }}>
          <Divider data-testid="divider-default" />
        </div>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-orientation" title="1 Orientation (horizontal · vertical)" overflow>
        <p className={styles.storySectionLead}>
          Figma API: <code>orientation</code>. Code matches <code>horizontal</code> | <code>vertical</code> (see{' '}
          <code>Divider.stories.tsx</code>, Orientations).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ alignItems: 'stretch', minHeight: 'var(--Spacing-18)' }}>
            <div className={styles.scenarioLabeledCell} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--Spacing-3-5)', width: '100%' }}>
                <Divider orientation="horizontal" data-testid="divider-orientation-horizontal" />
              </div>
              <span className={styles.scenarioCellCaption}>horizontal</span>
            </div>
            <div className={styles.scenarioLabeledCell} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
              <Divider orientation="vertical" data-testid="divider-orientation-vertical" />
              <span className={styles.scenarioCellCaption}>vertical</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-size" title="2 Size (S · M · L) — stroke width" overflow>
        <p className={styles.storySectionLead}>
          Figma labels <strong>S/M/L</strong> for stroke width; code uses lowercase <code>size</code> (<code>s</code>, <code>m</code>, <code>l</code>). Same mapping as{' '}
          <code>Divider.stories.tsx</code> / <code>Divider.showcase.tsx</code> <code>DividerSizes</code>. Each row fixes <code>attention</code> (high · medium · low) so stroke
          weight reads at every contrast tier.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {(['high', 'medium', 'low'] as const satisfies readonly DividerAttention[]).map((attention) => (
              <div key={attention} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={appearanceRowLabelStyle}>{attention}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={styles.scenarioFlexRow}>
                    {FIGMA_SIZES.map(({ figma, size }) => (
                      <div key={figma} className={styles.scenarioLabeledCell} style={{ flex: 1, minWidth: 0 }}>
                        <Divider size={size} attention={attention} data-testid={`divider-size-${attention}-${figma}`} />
                        <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-slot" title="3 Slot (Figma) → content prop" overflow>
        <p className={styles.storySectionLead}>
          Figma API column: <strong>slot</strong> (<code>none</code> · <code>Icon</code> · <code>Label</code>). In code the prop is <code>content=&quot;none&quot; | &quot;icon&quot; | &quot;label&quot;</code> — naming differs from Figma ⚠️. Values are lowercase in code.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ flexDirection: 'column', gap: 'var(--Spacing-5)', alignItems: 'stretch' }}>
            <div className={styles.scenarioLabeledCell}>
              <Divider content="none" attention="medium" data-testid="divider-slot-none" />
              <span className={styles.scenarioCellCaption}>slot: none (content=none)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Divider content="icon" attention="medium" data-testid="divider-slot-icon">
                {dividerSlotIcon}
              </Divider>
              <span className={styles.scenarioCellCaption}>slot: Icon (content=icon)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Divider content="label" attention="medium" data-testid="divider-slot-label">
                Section
              </Divider>
              <span className={styles.scenarioCellCaption}>slot: Label (content=label)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-content-align" title="4 contentAlign (center · start · end)" overflow>
        <p className={styles.storySectionLead}>
          Figma: position of the slot. Shown with <code>content=&quot;label&quot;</code> and <code>attention=&quot;medium&quot;</code> — same pattern as <code>DividerWithLabel</code> in{' '}
          <code>Divider.showcase.tsx</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ flexDirection: 'column', gap: 'var(--Spacing-5)', alignItems: 'stretch' }}>
            {(['center', 'start', 'end'] as const satisfies readonly DividerContentAlign[]).map((align) => (
              <div key={align} className={styles.scenarioLabeledCell}>
                <Divider content="label" contentAlign={align} attention="medium" data-testid={`divider-contentAlign-${align}`}>
                  Align
                </Divider>
                <span className={styles.scenarioCellCaption}>{`contentAlign: ${align}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-appearance" title="5 Appearance (Figma variable modes + auto)" overflow>
        <p className={styles.storySectionLead}>
          Figma marks <strong>appearance</strong> as <strong>variable mode</strong> (not a simple component property). Code: <code>appearance</code> on <code>Divider</code>.{' '}
          <code>brand-bg</code> exists on other components but is <strong>not</strong> part of <code>DividerAppearance</code> today — no row here.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                {/* Definite min-width: a width:100% horizontal rule collapses to 0 intrinsic
                    width inside an align-items:center flex row (see Default band note above). */}
                <div style={{ flex: 1, minWidth: 'var(--Spacing-40)' }}>
                  <Divider appearance={appearance} size="m" attention="medium" content="none" data-testid={`divider-appearance-${appearance}`} />
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-attention" title="6 Attention (high · medium · low)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>Divider.stories.tsx</code> Attention Levels — horizontal rules, default appearance. Each level shows <code>content=&quot;label&quot;</code> and <code>content=&quot;icon&quot;</code> (slot) so stroke weight reads with real content.{' '}
          <strong>Raised (WCAG):</strong> <code>attention=&quot;low&quot;</code> + label slot uses default Divider tokens only; automated axe can report{' '}
          <code>color-contrast</code> just under 4.5:1 on the default QA surface — tracked for resolution in <code>@oneui/ui</code> Divider, not patched here.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ flexDirection: 'column', gap: 'var(--Spacing-5)', alignItems: 'stretch' }}>
            {(['high', 'medium', 'low'] as const satisfies readonly DividerAttention[]).map((attention) => (
              <div
                key={attention}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', alignItems: 'stretch' }}
              >
                <div className={styles.scenarioLabeledCell}>
                  <Divider
                    attention={attention}
                    size="m"
                    content="label"
                    contentAlign="center"
                    data-testid={`divider-attention-${attention}-label`}
                  >
                    {attention === 'high' ? 'High' : attention === 'medium' ? 'Medium' : 'Low'}
                  </Divider>
                  <span className={styles.scenarioCellCaption}>{`attention: ${attention} · label`}</span>
                </div>
                <div className={styles.scenarioLabeledCell}>
                  <Divider attention={attention} size="m" content="icon" contentAlign="center" data-testid={`divider-attention-${attention}-icon`}>
                    {dividerSlotIcon}
                  </Divider>
                  <span className={styles.scenarioCellCaption}>{`attention: ${attention} · icon`}</span>
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-round-caps" title="7 roundCaps (true · false)" overflow>
        <p className={styles.storySectionLead}>
          Figma API: <code>roundCaps</code> — rounded stroke ends. Code: boolean <code>roundCaps</code> (see{' '}
          <code>Divider.showcase.tsx</code>, <code>DividerRoundCaps</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ flexDirection: 'column', gap: 'var(--Spacing-5)', alignItems: 'stretch' }}>
            <div className={styles.scenarioLabeledCell}>
              <Divider size="l" attention="high" roundCaps={false} data-testid="divider-roundCaps-false" />
              <span className={styles.scenarioCellCaption}>roundCaps: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Divider size="l" attention="high" roundCaps data-testid="divider-roundCaps-true" />
              <span className={styles.scenarioCellCaption}>roundCaps: true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-vertical-slot" title="8 Vertical + slot / contentAlign (code patterns)" overflow>
        <p className={styles.storySectionLead}>
          Figma table lists orientation and slot separately; vertical + icon + align mirrors <code>Divider.stories.tsx</code> Vertical With Icon / Vertical With Label. Not a separate Figma row — code reference ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ alignItems: 'stretch', minHeight: 'var(--Spacing-18)', gap: 'var(--Spacing-6)' }}>
            {(['start', 'center', 'end'] as const).map((align) => (
              <div key={align} className={styles.scenarioLabeledCell} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3-5)', flex: 1 }}>
                <Divider orientation="vertical" content="icon" contentAlign={align} attention="medium" data-testid={`divider-vertical-icon-${align}`}>
                  {dividerSlotIcon}
                </Divider>
                <span className={styles.scenarioCellCaption}>{`vertical · icon · ${align}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="divider-qa-combos" title="9 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <div style={row.props.orientation === 'vertical' ? verticalStripStyle : { width: '100%' }}>
                  <Divider {...row.props} data-testid={`divider-combo-${index}`}>
                    {row.props.content === 'icon' ? dividerSlotIcon : row.props.content === 'label' ? 'Label' : null}
                  </Divider>
                </div>
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
