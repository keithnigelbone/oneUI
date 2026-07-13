'use client';

import { useRef, useState, type ReactNode } from 'react';
import { TabGroup, TabItem, TabPanel } from '@oneui/ui/components/Tabs';
import type { ComponentAppearance } from '@oneui/shared';
import type { TabGroupProps, TabsOrientation, TabsSize } from '@oneui/ui/components/Tabs';
import { Icon } from '@oneui/ui/components/Icon';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Figma S/M/L ↔ code `size` (lowercase). */
const FIGMA_SIZES: { figma: string; size: TabsSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

const FIGMA_ORIENTATIONS: { label: string; orientation: TabsOrientation }[] = [
  { label: 'horizontal', orientation: 'horizontal' },
  { label: 'vertical', orientation: 'vertical' },
];

/** Storybook Appearances subset + code-only roles. */
const CODE_APPEARANCES = [
  'primary',
  'secondary',
  'neutral',
  'sparkle',
  'positive',
  'negative',
  'warning',
  'informative',
] as const satisfies readonly ComponentAppearance[];

type ComboRow = {
  caption: string;
  groupProps: Omit<TabGroupProps, 'children'>;
  disabledThird?: boolean;
};

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'M · horizontal · primary', groupProps: { size: 'm', orientation: 'horizontal', defaultValue: 'a' } },
  { caption: 'S · vertical · secondary', groupProps: { size: 's', orientation: 'vertical', appearance: 'secondary', defaultValue: 'b' } },
  { caption: 'L · horizontal · sparkle', groupProps: { size: 'l', appearance: 'sparkle', defaultValue: 'c' } },
  { caption: 'M · disabled third tab', groupProps: { size: 'm', defaultValue: 'b' }, disabledThird: true },
];

function SampleLabels() {
  return (
    <>
      <TabItem value="a">Label</TabItem>
      <TabItem value="b">Label</TabItem>
      <TabItem value="c">Label</TabItem>
      <TabItem value="d">Label</TabItem>
    </>
  );
}

function OverviewLabels() {
  return (
    <>
      <TabItem value="overview">Overview</TabItem>
      <TabItem value="projects">Projects</TabItem>
      <TabItem value="account">Account</TabItem>
    </>
  );
}

/**
 * TODO: `TabGroup` / `BaseTabs.Root` does not accept `data-testid` on `TabGroupProps` yet.
 * Forward `data-testid` to the root element in `TabGroup.tsx` when wiring QA e2e.
 */
function QaTabGroup({
  'data-testid': testId,
  listClassName,
  children,
  className,
  ...props
}: TabGroupProps & {
  'data-testid'?: string;
  /** Applied to inner `TabGroup` / tab list (e.g. full-width flex). */
  listClassName?: string;
  children: ReactNode;
}) {
  return (
    <div data-testid={testId} className={className}>
      <TabGroup {...props} className={listClassName}>
        {children}
      </TabGroup>
    </div>
  );
}

const SCROLLABLE_TAB_LABELS = [
  'Summary',
  'Details',
  'History',
  'Billing',
  'Support',
  'Analytics',
  'Reports',
  'Settings',
  'Integrations',
  'Archive',
] as const;

function TabsScrollableDemo() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scrollByStep = (direction: -1 | 1) => {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: 'smooth' });
  };

  return (
    <div className={styles.tabsScrollableRow} data-testid="tabs-scrollable">
      <button
        type="button"
        className={styles.tabsScrollBtn}
        aria-label="Scroll tabs backward"
        onClick={() => scrollByStep(-1)}
      >
        ‹
      </button>
      <div ref={viewportRef} className={styles.tabsScrollableViewport} data-testid="tabs-scrollable-viewport">
        <TabGroup defaultValue="summary" size="m" orientation="horizontal" appearance="primary">
          {SCROLLABLE_TAB_LABELS.map((label) => {
            const value = label.toLowerCase();
            return (
              <TabItem key={value} value={value}>
                {label}
              </TabItem>
            );
          })}
        </TabGroup>
      </div>
      <button
        type="button"
        className={styles.tabsScrollBtn}
        aria-label="Scroll tabs forward"
        onClick={() => scrollByStep(1)}
      >
        ›
      </button>
    </div>
  );
}

function TabsControlledDemo() {
  const [value, setValue] = useState<string | number | null>('overview');
  return (
    <QaTabGroup
      value={value}
      onValueChange={setValue}
      size="m"
      appearance="primary"
      data-testid="tabs-controlled"
    >
      <TabItem value="overview">Overview</TabItem>
      <TabItem value="projects">Projects</TabItem>
      <TabItem value="account">Account</TabItem>
      <TabPanel value="overview">Overview panel</TabPanel>
      <TabPanel value="projects">Projects panel</TabPanel>
      <TabPanel value="account">Account panel</TabPanel>
    </QaTabGroup>
  );
}

/**
 * Tabs QA playground — Figma TabGroup API (`size`, `orientation`, `interactionState`) + code-only props.
 * Size × orientation matrix lives on the **Figma Validation** tab.
 */
export function TabsQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="tabs-qa-default" title="Default (Tabs.stories Default)" centerContent>
        <QaApiSectionBody>
          <div className={styles.scenarioWidePreviewWrap}>
            <QaTabGroup
              defaultValue="overview"
              size="m"
              orientation="horizontal"
              appearance="primary"
              data-testid="tabs-default"
            >
              <OverviewLabels />
            </QaTabGroup>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-size" title="1 Size (S · M · L)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma <code>size</code> values <strong>S</strong>, <strong>M</strong>, <strong>L</strong> map to code{' '}
          <code>s</code>, <code>m</code>, <code>l</code>. Horizontal layout only here — full size × orientation grid is on
          Figma Validation.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <QaTabGroup size={size} defaultValue="a" data-testid={`tabs-size-${figma}`}>
                  <SampleLabels />
                </QaTabGroup>
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-orientation" title="2 Orientation (horizontal · vertical)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma <code>orientation</code>: <code>horizontal</code> (bottom indicator) and <code>vertical</code> (leading-edge
          indicator). Size M in each strip.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow} style={{ alignItems: 'flex-start' }}>
            {FIGMA_ORIENTATIONS.map(({ label, orientation }) => (
              <div key={label} className={styles.scenarioLabeledCell} style={{ minWidth: orientation === 'vertical' ? 'var(--Spacing-32)' : undefined }}>
                <QaTabGroup orientation={orientation} size="m" defaultValue="a" data-testid={`tabs-orientation-${label}`}>
                  <SampleLabels />
                </QaTabGroup>
                <span className={styles.scenarioCellCaption}>{`orientation: ${label}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-layout-variants" title="2b Layout variants (scrollable · full width)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Classic Material <code>variant=&quot;scrollable&quot;</code> / <code>fullWidth</code> — not in Figma TabGroup API
          ⚠️. QA shells only: narrow overflow viewport + scroll controls, or evenly stretched tabs in a full-width row.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>scrollable — overflow-x + scroll buttons</span>
              <TabsScrollableDemo />
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>fullWidth — tabs stretch to fill row</span>
              <div className={styles.tabsFullWidthShell}>
                <QaTabGroup
                  defaultValue="a"
                  size="m"
                  listClassName={styles.tabsFullWidthList}
                  data-testid="tabs-fullwidth"
                >
                  <TabItem value="a">Overview</TabItem>
                  <TabItem value="b">Projects</TabItem>
                  <TabItem value="c">Account</TabItem>
                  <TabItem value="d">Settings</TabItem>
                </QaTabGroup>
              </div>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-interaction-state" title="3 interactionState (Figma variable mode)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma <code>interactionState</code>: idle, hover, pressed, focus — variable modes, not TabGroup props ⚠️. Idle /
          hover / pressed come from CSS; focus can be forced on TabItem for docs:
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>idle / hover / pressed — real pointer + CSS (hover unselected labels)</span>
              <div className={styles.scenarioWidePreviewWrap}>
                <QaTabGroup defaultValue="b" data-testid="tabs-interaction-hover">
                  <TabItem value="a">Label</TabItem>
                  <TabItem value="b">Label</TabItem>
                  <TabItem value="c">Label</TabItem>
                </QaTabGroup>
              </div>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>focus — TabItem data-force-state="focus" ⚠️ (Storybook FocusState)</span>
              <div className={styles.scenarioWidePreviewWrap}>
                <QaTabGroup defaultValue="b" data-testid="tabs-interaction-focus">
                  <TabItem value="a">Label</TabItem>
                  <TabItem value="b" data-force-state="focus">
                    Label
                  </TabItem>
                  <TabItem value="c">Label</TabItem>
                </QaTabGroup>
              </div>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-states" title="4 TabItem states (selected · disabled)" overflow>
        <QaApiSectionBody>
          <QaTabGroup defaultValue="b" data-testid="tabs-states">
            <TabItem value="a">Enabled</TabItem>
            <TabItem value="b">Selected</TabItem>
            <TabItem value="c" disabled>
              Disabled
            </TabItem>
          </QaTabGroup>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-controlled" title="5 Controlled value + panels" overflow>
        <p className={styles.storySectionLeadCompact}>
          <code>value</code> / <code>onValueChange</code> — not in Figma TabGroup table ⚠️ (matches Storybook Interactive).
        </p>
        <QaApiSectionBody>
          <TabsControlledDemo />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-code-only" title="6 Code-only props (not in Figma TabGroup table)" overflow>
        <p className={styles.storySectionLeadCompact}>
          From <code>Tabs.shared.ts</code> / Storybook — absent from the Figma component-property table ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>appearance: primary (default)</span>
              <QaTabGroup appearance="primary" defaultValue="a" data-testid="tabs-code-only-appearance-primary">
                <SampleLabels />
              </QaTabGroup>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>appearance: auto → primary</span>
              <QaTabGroup appearance="auto" defaultValue="a" data-testid="tabs-appearance-auto">
                <SampleLabels />
              </QaTabGroup>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>activateOnFocus: true</span>
              <QaTabGroup activateOnFocus defaultValue="a" data-testid="tabs-activate-on-focus">
                <SampleLabels />
              </QaTabGroup>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>loopFocus: false</span>
              <QaTabGroup loopFocus={false} defaultValue="a" data-testid="tabs-loop-focus-false">
                <SampleLabels />
              </QaTabGroup>
            </div>
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>showIndicator: false</span>
              <QaTabGroup showIndicator={false} defaultValue="a" data-testid="tabs-no-indicator">
                <SampleLabels />
              </QaTabGroup>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-appearance-strip" title="7 Appearance strip (Storybook)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Multi-accent <code>appearance</code> on TabGroup — <code>brand-bg</code> supported in code ⚠️.
        </p>
        <QaApiSectionBody scrollable scrollableRegionLabel="Tabs appearance rows">
          <div className={styles.scenarioStackWide}>
            {CODE_APPEARANCES.map((appearance) => (
              <div key={appearance} className={styles.scenarioLabeledCellWide}>
                <span className={styles.scenarioCellCaption}>{`appearance: ${appearance}`}</span>
                <QaTabGroup appearance={appearance} defaultValue="b" data-testid={`tabs-appearance-${appearance}`}>
                  <SampleLabels />
                </QaTabGroup>
              </div>
            ))}
            <div className={styles.scenarioLabeledCellWide}>
              <span className={styles.scenarioCellCaption}>appearance: brand-bg</span>
              <QaTabGroup appearance="brand-bg" defaultValue="b" data-testid="tabs-appearance-brand-bg">
                <SampleLabels />
              </QaTabGroup>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-slots" title="8 start / end slots (WithIcons)" overflow>
        <p className={styles.storySectionLeadCompact}>
          Figma TabGroup table mentions start slot visibility via <code>orientation</code> description; icon/badge slots
          are TabItem API ⚠️ (<code>start</code> / <code>end</code>; legacy <code>icon</code> / <code>badge</code>).
        </p>
        <QaApiSectionBody>
          <QaTabGroup defaultValue="home" data-testid="tabs-with-icons">
            <TabItem value="home" start={<Icon icon="home" aria-hidden />}>
              Home
            </TabItem>
            <TabItem
              value="inbox"
              start={<Icon icon="mail" aria-hidden />}
              end={<CounterBadge value={3} appearance="negative" size="s" aria-label="3 unread" />}
            >
              Inbox
            </TabItem>
            <TabItem value="settings" start={<Icon icon="settings" aria-hidden />}>
              Settings
            </TabItem>
          </QaTabGroup>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tabs-qa-combos" title="9 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCellWide}>
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
                <QaTabGroup {...row.groupProps} data-testid={`tabs-combo-${index}`}>
                  {row.disabledThird ? (
                    <>
                      <TabItem value="a">Label</TabItem>
                      <TabItem value="b">Label</TabItem>
                      <TabItem value="c" disabled>
                        Label
                      </TabItem>
                      <TabItem value="d">Label</TabItem>
                    </>
                  ) : (
                    <SampleLabels />
                  )}
                </QaTabGroup>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
