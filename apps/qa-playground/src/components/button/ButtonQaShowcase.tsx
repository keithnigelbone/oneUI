'use client';

import { useState, type CSSProperties } from 'react';
import { Button, ButtonAppearances } from '@oneui/ui/components/Button';
import type { ButtonProps, ButtonSize } from '@oneui/ui/components/Button';
import { CircularProgressIndicator } from '@oneui/ui/components/CircularProgressIndicator';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Figma S / M / L ↔ code `size` prop (t-shirt). */
const FIGMA_SIZE_STEPS = [
   { figma: 'XS', size: 'xs' as const },
  { figma: 'S', size: 's' as const },
  { figma: 'M', size: 'm' as const },
  { figma: 'L', size: 'l' as const },

] as const;

const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

const BUTTON_SIZE_ORDER = ['xs', 's', 'm', 'l'] as const satisfies readonly ButtonSize[];

const BUTTON_SIZE_LABEL: Record<(typeof BUTTON_SIZE_ORDER)[number], string> = {
  xs: 'Extra small',
  s: 'Small',
  m: 'Medium',
  l: 'Large',
};

const ATTENTION_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const LINK_TEXT_SIZES: { size: ButtonSize; label: string }[] = [
  { size: 's', label: BUTTON_SIZE_LABEL.s },
  { size: 'm', label: BUTTON_SIZE_LABEL.m },
  { size: 'l', label: BUTTON_SIZE_LABEL.l },
];

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3-5)',
  width: '100%',
};

const fullWidthDemoColumn: CSSProperties = {
  width: 'min(100%, var(--Tooltip-Max-Width))',
  marginInline: 'auto',
  boxSizing: 'border-box',
};

const dependencyRow: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 'var(--Spacing-4)',
  width: '100%',
  justifyContent: 'center',
};

const appearanceStrip: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-3-5)',
  alignItems: 'center',
  justifyContent: 'center',
};

const cpiStart = (
  <CircularProgressIndicator variant="indeterminate" size="XS" appearance="auto" aria-label="Progress" />
);

function SingleTextSizesRow({ id }: { id?: string }) {
  return (
    <div id={id} className={styles.scenarioFlexRow}>
      {LINK_TEXT_SIZES.map(({ size, label }) => (
        <div key={label} className={styles.scenarioLabeledCell}>
          <Button contained={false} size={size}>
            VS
          </Button>
          <span className={styles.scenarioCellCaption}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function SingleTextAttentionRow({ id }: { id?: string }) {
  return (
    <div id={id} className={styles.scenarioFlexRow}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} className={styles.scenarioLabeledCell}>
          <Button contained={false} attention={attention}>
            VS
          </Button>
          <span className={styles.scenarioCellCaption}>{ATTENTION_LABEL[attention]}</span>
        </div>
      ))}
    </div>
  );
}

function SingleTextFullWidthRow({ id }: { id?: string }) {
  return (
    <div id={id} style={fullWidthDemoColumn}>
      <div style={stack}>
        <Button contained={false} size="s" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
          {`Full width — ${BUTTON_SIZE_LABEL.s}`}
        </Button>
        <Button contained={false} size="m" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
          {`Full width — ${BUTTON_SIZE_LABEL.m}`}
        </Button>
        <Button contained={false} size="l" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
          {`Full width — ${BUTTON_SIZE_LABEL.l}`}
        </Button>
      </div>
    </div>
  );
}

function SingleTextStatesRow({ id }: { id?: string }) {
  return (
    <div id={id} className={styles.scenarioFlexRow}>
      <div className={styles.scenarioLabeledCell}>
        <Button contained={false}>VS</Button>
        <span className={styles.scenarioCellCaption}>Default</span>
      </div>
      <div className={styles.scenarioLabeledCell}>
        <Button contained={false} disabled>
          VS
        </Button>
        <span className={styles.scenarioCellCaption}>Disabled</span>
      </div>
      <div className={styles.scenarioLabeledCell}>
        <Button contained={false} loading>
          VS
        </Button>
        <span className={styles.scenarioCellCaption}>Loading</span>
      </div>
    </div>
  );
}

function InteractiveSection({ id }: { id?: string }) {
  const [clickCount, setClickCount] = useState(0);
  return (
    <div id={id} style={fullWidthDemoColumn}>
      <div style={stack}>
        <Button fullWidth size="m" start={<SlotIcon />} onClick={() => setClickCount((c) => c + 1)}>
          {`Clicked: ${clickCount}`}
        </Button>
      </div>
    </div>
  );
}

/** Representative prop stacks for automation / visual spot checks. */
const COMBO_SAMPLES: Array<{ caption: string; props: ButtonProps }> = [
  { caption: 'S · high · primary', props: { size: 's', attention: 'high', appearance: 'primary', children: 'Combo' } },
  { caption: 'M · high · neutral', props: { size: 'm', attention: 'high', appearance: 'neutral', children: 'Combo' } },
  { caption: 'L · high · negative', props: { size: 'l', attention: 'high', appearance: 'negative', children: 'Combo' } },
  {
    caption: 'M · high · positive · disabled',
    props: { size: 'm', attention: 'high', appearance: 'positive', disabled: true, children: 'Combo' },
  },
  {
    caption: 'M · high · primary · loading',
    props: { size: 'm', attention: 'high', appearance: 'primary', loading: true, children: 'Save' },
  },
  {
    caption: 'M · high · primary · start+end Icon',
    props: {
      size: 'm',
      attention: 'high',
      appearance: 'primary',
      start: <SlotIcon />,
      end: <SlotIcon />,
      children: 'Combo',
    },
  },
  {
    caption: 'M · high · primary · condensed',
    props: { size: 'm', attention: 'high', appearance: 'primary', condensed: true, children: 'Combo' },
  },
  {
    caption: 'M · high · primary · fullWidth',
    props: { size: 'm', attention: 'high', appearance: 'primary', fullWidth: true, children: 'Combo' },
  },
];

/**
 * Button QA canvas — Figma-aligned API sections (`data-testid` on root &lt;button&gt; only),
 * uncontained (contained=false) single-text reference, and full appearance matrix ({@link ButtonAppearances}).
 */
export function ButtonQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="button-qa-default" title="Default" centerContent>
        <Button attention="medium" size="m">
          Button
        </Button>
      </QaStoryBand>

      {/* 1 Size — Figma S / M / L */}
      <QaStoryBand id="button-qa-button-sizes-contained" title="1 Size (S · M · L)" overflow>
        <QaApiSectionBody scrollable>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZE_STEPS.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <Button size={size} data-testid={`btn-size-${figma}`}>
                  {`Size ${figma}`}
                </Button>
                <span className={styles.scenarioCellCaption}>{`size → ${figma} (${BUTTON_SIZE_LABEL[size]})`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 2 Attention */}
      <QaStoryBand id="button-qa-button-attention" title="2 Attention (high · medium · low)" overflow>
        <QaApiSectionBody scrollable>
          <div className={styles.scenarioFlexRow}>
            {(['high', 'medium', 'low'] as const).map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <Button attention={attention} data-testid={`btn-attention-${attention}`}>
                  {ATTENTION_LABEL[attention]}
                </Button>
                <span className={styles.scenarioCellCaption}>{ATTENTION_LABEL[attention]}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 3a Appearance strip — high attention for calmer contrast in QA shell */}
      <QaStoryBand id="button-qa-api-appearance-strip" title="Appearances (3a — roles, high attention)" overflow>
        <p className={styles.storySectionLead}>
          One chip per <code>appearance</code> value (plus <code>auto</code>), all at <strong>high</strong> attention. Code
          also supports <code>tertiary</code>, <code>quaternary</code>, and <code>brand-bg</code> beyond the 9-role Figma
          table.
        </p>
        <QaApiSectionBody scrollable>
          <div style={appearanceStrip}>
            <Button appearance="auto" attention="high" size="m" data-testid="btn-appearance-auto">
              auto
            </Button>
            {COMPONENT_APPEARANCE_ROLES.map((role) => (
              <Button key={role} appearance={role} attention="high" size="m" data-testid={`btn-appearance-${role}`}>
                {role}
              </Button>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 3b Full matrix — same as Storybook; medium attention rows may fail strict axe contrast in this fixture */}
      <QaStoryBand id="button-qa-appearance-matrix" title="Appearances (3b — full matrix)" overflow>
        <QaApiSectionBody>
          <div id="button-qa-appearance-matrix-root">
            <ButtonAppearances />
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 4 condensed × contained */}
      <QaStoryBand id="button-qa-api-condensed-contained" title="4 Condensed × contained (dependency)" overflow>
        <p className={styles.storySectionLead}>
          Figma: <code>condensed</code> only applies when <code>contained=true</code>. When <code>contained=false</code>,{' '}
          <code>Button contained=&#123;false&#125;</code> — condensed is ignored (same visual with{' '}
          <code>condensed=true</code> vs <code>false</code>).
        </p>
        <QaApiSectionBody scrollable>
          <div style={stack}>
            <div style={dependencyRow}>
              <div className={styles.scenarioLabeledCell}>
                <Button contained={false} condensed={false} data-testid="btn-contained-false-condensed-false">
                  uncontained
                </Button>
                <span className={styles.scenarioCellCaption}>contained=false, condensed=false</span>
              </div>
              <div className={styles.scenarioLabeledCell}>
                <Button contained={false} condensed data-testid="btn-contained-false-condensed-true">
                  uncontained
                </Button>
                <span className={styles.scenarioCellCaption}>contained=false, condensed=true (ignored)</span>
              </div>
            </div>
            <div style={dependencyRow}>
              <div className={styles.scenarioLabeledCell}>
                <Button contained condensed={false} size="m" data-testid="btn-contained-true-condensed-false">
                  {BUTTON_SIZE_LABEL.m}
                </Button>
                <span className={styles.scenarioCellCaption}>contained=true, condensed=false</span>
              </div>
              <div className={styles.scenarioLabeledCell}>
                <Button contained condensed size="m" data-testid="btn-contained-true-condensed-true">
                  {BUTTON_SIZE_LABEL.m}
                </Button>
                <span className={styles.scenarioCellCaption}>contained=true, condensed=true</span>
              </div>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 5 fullWidth × contained */}
      <QaStoryBand id="button-qa-button-full-width" title="5 fullWidth × contained (dependency)" overflow>
        <p className={styles.storySectionLead}>
          <code>fullWidth</code> applies only when <code>contained=true</code>; uncontained uses inline width on{' '}
          <code>Button contained=&#123;false&#125;</code> for demos elsewhere.
        </p>
        <QaApiSectionBody scrollable>
          <div style={fullWidthDemoColumn}>
            <div style={stack}>
              <div className={styles.scenarioLabeledCell}>
                <Button contained={false} fullWidth={false} data-testid="btn-fullwidth-contained-false">
                  uncontained
                </Button>
                <span className={styles.scenarioCellCaption}>contained=false, fullWidth=false (ignored)</span>
             
              <Button contained fullWidth={false} size="m" data-testid="btn-fullwidth-contained-true-width-false">
                contained · not full width
              </Button>
              <Button contained fullWidth size="m" data-testid="btn-fullwidth-contained-true-width-true">
                contained · full width
              </Button>
              </div>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 6 start / end */}
      <QaStoryBand id="button-qa-button-with-icons" title="6 Start + end slots" overflow>
        <QaApiSectionBody scrollable>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Button size="m" data-testid="btn-start-none-end-none">
                Label
              </Button>
              <span className={styles.scenarioCellCaption}>start=none, end=none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button start={<SlotIcon />} size="m" data-testid="btn-start-icon-end-none">
                Start
              </Button>
              <span className={styles.scenarioCellCaption}>start=Icon, end=none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button end={<SlotIcon />} size="m" data-testid="btn-start-none-end-icon">
                End
              </Button>
              <span className={styles.scenarioCellCaption}>start=none, end=Icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button start={<SlotIcon />} end={<SlotIcon />} size="m" data-testid="btn-start-icon-end-icon">
                Both
              </Button>
              <span className={styles.scenarioCellCaption}>start=Icon, end=Icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button start={cpiStart} size="m" data-testid="btn-start-cpi-end-none">
                With CPI
              </Button>
              <span className={styles.scenarioCellCaption}>start=circularProgressIndicator, end=none</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 7 disabled */}
      <QaStoryBand id="button-qa-api-disabled" title="7 disabled" overflow>
        <QaApiSectionBody scrollable>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Button disabled={false} data-testid="btn-disabled-false">
                Enabled
              </Button>
              <span className={styles.scenarioCellCaption}>disabled=false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button disabled data-testid="btn-disabled-true">
                Disabled
              </Button>
              <span className={styles.scenarioCellCaption}>disabled=true</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 8 loading */}
      <QaStoryBand id="button-qa-button-loading" title="8 loading" overflow>
        <p className={styles.storySectionLead}>
          Implemented: <code>loading=true</code> maps to <code>disabled</code> and hides <code>start</code> /{' '}
          <code>end</code> slots. Spinner is an inline SVG (Figma &quot;circularProgressIndicator&quot; slot is not a separate
          component prop). Label children still render — stricter &quot;content = CPI only&quot; from the Figma doc is not
          enforced in source (<code>Button.tsx</code>).
        </p>
        <QaApiSectionBody scrollable>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Button loading={false} data-testid="btn-loading-false">
                Normal
              </Button>
              <span className={styles.scenarioCellCaption}>loading=false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button loading data-testid="btn-loading-true">
                Loading
              </Button>
              <span className={styles.scenarioCellCaption}>loading=true</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button loading start={<SlotIcon />} end={<SlotIcon />} size="m" data-testid="btn-loading-slots-hidden">
                Save
              </Button>
              <span className={styles.scenarioCellCaption}>loading + start/end (slots hidden)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 9 accent — not a Button prop; use appearance for a rough visual analogue */}
      <QaStoryBand id="button-qa-api-accent" title="9 accent (code-only — not implemented)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: accent prop — not implemented on Button; Figma &quot;accent&quot; is expressed via `appearance`. */}
          There is no <code>accent</code> prop on <code>Button</code>. The closest API is <code>appearance</code>{' '}
          (multi-accent roles). Below uses <code>appearance=&quot;primary&quot; | &quot;secondary&quot; | &quot;sparkle&quot;</code> for a rough
          stand-in.
        </p>
        <QaApiSectionBody scrollable>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Button appearance="primary" data-testid="btn-accent-primary-standin">
                Primary
              </Button>
              <span className={styles.scenarioCellCaption}>appearance=primary (stand-in)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button appearance="secondary" data-testid="btn-accent-secondary-standin">
                Secondary
              </Button>
              <span className={styles.scenarioCellCaption}>appearance=secondary (stand-in)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Button appearance="sparkle" data-testid="btn-accent-sparkle-standin">
                Sparkle
              </Button>
              <span className={styles.scenarioCellCaption}>appearance=sparkle (stand-in)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* 10 combination matrix */}
      <QaStoryBand id="button-qa-api-combos" title="10 Combination samples" overflow>
        <QaApiSectionBody scrollable>
          <div className={styles.scenarioComboGrid}>
            {COMBO_SAMPLES.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <Button {...row.props} data-testid={`btn-combo-${index}`} />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand title="Single Text Button (uncontained)" overflow>
        <p className={styles.storySectionLead}>
          Uncontained text via <code>Button contained=&#123;false&#125;</code> — Figma <code>size</code> <strong>S</strong> / <strong>M</strong> /{' '}
          <strong>L</strong> only here.
        </p>
      </QaStoryBand>

      <QaStoryBand title="Single Text — Sizes" overflow>
        <SingleTextSizesRow id="button-qa-single-text-sizes" />
      </QaStoryBand>

      <QaStoryBand title="Single Text — Attention" overflow>
        <SingleTextAttentionRow id="button-qa-single-text-attention" />
      </QaStoryBand>

      <QaStoryBand title="Single Text — Full width" overflow>
        <SingleTextFullWidthRow id="button-qa-single-text-full-width" />
      </QaStoryBand>

      <QaStoryBand title="Single Text — States" overflow>
        <SingleTextStatesRow id="button-qa-single-text-states" />
      </QaStoryBand>

      <QaStoryBand id="button-qa-interactive" title="Interactive" overflow>
        <InteractiveSection />
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
