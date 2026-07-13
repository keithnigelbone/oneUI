'use client';

import React, { useState, type CSSProperties } from 'react';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import type { SegmentedControlProps } from '@oneui/ui/components/SegmentedControl';
import { Button } from '@oneui/ui/components/Button';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';
import { Surface } from '@oneui/ui/components/Surface';
import { SegmentedControlControlsPanel } from './SegmentedControlControlsPanel';
import {
  ControlledSegments,
  FIGMA_APPEARANCES,
  FIGMA_ATTENTIONS,
  FIGMA_SHAPES,
  FIGMA_SIZES,
  FIGMA_TRACK_EMPHASIS,
  IconThreeItems,
  QaGridIcon,
  QaHomeIcon,
  QaListIcon,
  QaOrdersIcon,
  QaSc,
  QaUserIcon,
  SlotNavItems,
  TextThreeItems,
  rowLabelStyle,
} from './segmentedControlQaShared';

type ComboRow = { caption: string; props: SegmentedControlProps; defaultValue?: string };

const COMBO_MATRIX: ComboRow[] = [
  { caption: 'M · high · primary · pill', props: { size: 'm', attention: 'high', appearance: 'primary', shape: 'pill' } },
  { caption: 'S · medium · secondary · rectangular', props: { size: 's', attention: 'medium', appearance: 'secondary', shape: 'rectangular' }, defaultValue: 'b' },
  { caption: 'L · low · auto · equalWidth', props: { size: 'l', attention: 'low', appearance: 'auto', equalWidth: true, trackEmphasis: 'low' } },
  { caption: 'M · icon · hug width', props: { size: 'm', type: 'icon', equalWidth: false, attention: 'high' } },
  { caption: 'M · track medium · sparkle', props: { size: 'm', trackEmphasis: 'medium', appearance: 'sparkle' }, defaultValue: 'c' },
  { caption: 'M · disabled group', props: { size: 'm', disabled: true }, defaultValue: 'a' },
];

type InteractionDemoIds = {
  control: string;
  state: string;
  log: string;
};

const INTERACTION_CONTROLLED_IDS: InteractionDemoIds = {
  control: 'segmented-control-controlled',
  state: 'segmented-control-controlled-state',
  log: 'segmented-control-controlled-log',
};

const SELECTION_DYNAMIC_IDS: InteractionDemoIds = {
  control: 'segmented-control-selection-dynamic',
  state: 'segmented-control-selection-dynamic-state',
  log: 'segmented-control-selection-dynamic-log',
};

function InteractionControlledDemo({ ids = INTERACTION_CONTROLLED_IDS }: { ids?: InteractionDemoIds }) {
  const [value, setValue] = useState('week');
  const [log, setLog] = useState<string[]>([]);

  const onChange = (next: string) => {
    setValue(next);
    setLog((prev) => [...prev.slice(-4), `onValueChange("${next}")`]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
      <ControlledSegments
        testId={ids.control}
        value={value}
        onValueChange={onChange}
        aria-label="Controlled billing period"
      >
        <TextThreeItems prefix="ctrl-" />
      </ControlledSegments>
      <span className={styles.scenarioCellCaption} data-testid={ids.state}>
        value: {value}
      </span>
      <span className={styles.scenarioCellCaption} data-testid={ids.log}>
        {log.length ? log.join(' · ') : 'onValueChange: (none yet)'}
      </span>
    </div>
  );
}

function UncontrolledDemo() {
  return (
    <QaSc testId="segmented-control-uncontrolled">
      <SegmentedControl defaultValue="b" aria-label="Uncontrolled period" onValueChange={() => undefined}>
        <TextThreeItems prefix="unctrl-" />
      </SegmentedControl>
    </QaSc>
  );
}

function DynamicItemsDemo() {
  const [count, setCount] = useState(3);
  const labels = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Jota'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
      <ControlledSegments testId="segmented-control-dynamic-items" aria-label="Dynamic item count">
        {labels.slice(0, count).map((label, index) => (
          <SegmentedControl.Item key={label} value={`item-${index}`}>
            {label}
          </SegmentedControl.Item>
        ))}
      </ControlledSegments>
      <div style={{ display: 'flex', gap: 'var(--Spacing-2)', alignItems: 'center' }}>
        <Button size="s" variant="ghost" data-testid="segmented-control-dynamic-dec" onClick={() => setCount((c) => Math.max(1, c - 1))}>
          −
        </Button>
        <span className={styles.scenarioCellCaption} data-testid="segmented-control-dynamic-count">
          items: {count}
        </span>
        <Button size="s" variant="ghost" data-testid="segmented-control-dynamic-inc" onClick={() => setCount((c) => Math.min(10, c + 1))}>
          +
        </Button>
      </div>
    </div>
  );
}

/**
 * SegmentedControl QA showcase — API sections, slots, selection, a11y, edge cases, live controls.
 * The **Figma Validation** tab hosts {@link SegmentedControlFigmaValidationGrid}.
 */
export function SegmentedControlQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">

      <QaStoryBand id="segmented-control-qa-default" title="Default" centerContent>
        <QaSc testId="segmented-control-default">
          <SegmentedControl aria-label="Default segmented control">
            <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
            <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
            <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
          </SegmentedControl>
        </QaSc>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-automation" title="Automation anchors" centerContent>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <SegmentedControl
                data-testid="segmented-control"
                defaultValue="day"
                aria-label="Canonical segmented control for automation"
              >
                <SegmentedControl.Item value="day" data-testid="segment-item-day">
                  Day
                </SegmentedControl.Item>
                <SegmentedControl.Item value="week" data-testid="segment-item-week">
                  Week
                </SegmentedControl.Item>
                <SegmentedControl.Item value="month" data-testid="segment-item-month">
                  Month
                </SegmentedControl.Item>
              </SegmentedControl>
              <span className={styles.scenarioCellCaption}>Canonical selectors · defaultValue day</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-no-default">
                <SegmentedControl aria-label="No defaultValue or value">
                  <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
                  <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
                  <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>No value/defaultValue — selection empty at mount</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-basic" title="1 Basic examples" overflow>
        <p className={styles.storySectionLead}>
          Text segments, icon-only layout, mixed slots, equal vs variable width.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-basic-text" aria-label="Text segments">
                <TextThreeItems prefix="basic-text-" />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Text segments</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-basic-icon" type="icon" equalWidth={false} aria-label="Icon segments">
                <IconThreeItems prefix="basic-icon-" />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Icon segments</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-basic-mixed" aria-label="Mixed content">
                <SegmentedControl.Item value="a" start={<QaHomeIcon />}>Home</SegmentedControl.Item>
                <SegmentedControl.Item value="b" start={<QaListIcon />}>List</SegmentedControl.Item>
                <SegmentedControl.Item value="c" end={<CounterBadge value={2} aria-label="2 items" />}>Grid</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Mixed content</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-basic-equal" equalWidth aria-label="Equal width">
                <TextThreeItems prefix="eq-" />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>equalWidth=true</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-basic-variable" equalWidth={false} aria-label="Variable width">
                <SegmentedControl.Item value="s">S</SegmentedControl.Item>
                <SegmentedControl.Item value="medium">Medium label</SegmentedControl.Item>
                <SegmentedControl.Item value="longer">Much longer label</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>equalWidth=false</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-size" title="2 Size (S · M · L)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <ControlledSegments testId={`segmented-control-size-${figma.toLowerCase()}`} size={size} aria-label={`Size ${figma}`}>
                  <TextThreeItems prefix={`${size}-`} />
                </ControlledSegments>
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-attention" title="3 Attention (high · medium · low)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_ATTENTIONS.map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <ControlledSegments
                  testId={`segmented-control-attention-${attention}`}
                  attention={attention}
                  aria-label={`Attention ${attention}`}
                >
                  <TextThreeItems prefix={`${attention}-`} />
                </ControlledSegments>
                <span className={styles.scenarioCellCaption}>{attention}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-appearance" title="4 Appearance" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="SegmentedControl appearance roles">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCES.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)', flexWrap: 'wrap' }}>
                <span style={rowLabelStyle}>{appearance}</span>
                <ControlledSegments
                  testId={`segmented-control-appearance-${appearance}`}
                  appearance={appearance}
                  aria-label={`Appearance ${appearance}`}
                >
                  <TextThreeItems prefix={`${appearance}-`} />
                </ControlledSegments>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-shape" title="5 Shape (pill · rectangular)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SHAPES.map((shape) => (
              <div key={shape} className={styles.scenarioLabeledCell}>
                <ControlledSegments testId={`segmented-control-shape-${shape}`} shape={shape} aria-label={`Shape ${shape}`}>
                  <TextThreeItems prefix={`${shape}-`} />
                </ControlledSegments>
                <span className={styles.scenarioCellCaption}>{shape}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-track-emphasis" title="6 Track emphasis" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_TRACK_EMPHASIS.map((trackEmphasis) => (
              <div key={trackEmphasis} className={styles.scenarioLabeledCell}>
                <ControlledSegments
                  testId={`segmented-control-track-${trackEmphasis}`}
                  trackEmphasis={trackEmphasis}
                  aria-label={`Track ${trackEmphasis}`}
                >
                  <TextThreeItems prefix={`track-${trackEmphasis}-`} />
                </ControlledSegments>
                <span className={styles.scenarioCellCaption}>{trackEmphasis}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-equal-width" title="7 Equal width testing" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-equal-true" equalWidth aria-label="Equal width short labels">
                <SegmentedControl.Item value="a">A</SegmentedControl.Item>
                <SegmentedControl.Item value="b">B</SegmentedControl.Item>
                <SegmentedControl.Item value="c">C</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Short · equalWidth</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-equal-false" equalWidth={false} aria-label="Variable width mixed">
                <SegmentedControl.Item value="a">A</SegmentedControl.Item>
                <SegmentedControl.Item value="b">Medium</SegmentedControl.Item>
                <SegmentedControl.Item value="c">Very long segment label</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Mixed lengths · hug</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-equal-long" equalWidth aria-label="Equal width long labels">
                <SegmentedControl.Item value="a">Quarterly report</SegmentedControl.Item>
                <SegmentedControl.Item value="b">Annual summary</SegmentedControl.Item>
                <SegmentedControl.Item value="c">Custom range</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Long labels · equalWidth</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-slots" title="8 Slot testing (start · end · both · none)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-slot-start" aria-label="Start icon only">
                <SegmentedControl.Item value="a" start={<QaHomeIcon />}>Home</SegmentedControl.Item>
                <SegmentedControl.Item value="b" start={<QaOrdersIcon />}>Orders</SegmentedControl.Item>
                <SegmentedControl.Item value="c" start={<QaUserIcon />}>Profile</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>start icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-slot-end" aria-label="End CounterBadge">
                <SegmentedControl.Item value="a" end={<CounterBadge value={5} aria-label="5 notifications" />}>Inbox</SegmentedControl.Item>
                <SegmentedControl.Item value="b" end={<CounterBadge value={99} aria-label="99 updates" />}>Updates</SegmentedControl.Item>
                <SegmentedControl.Item value="c">Archive</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>end CounterBadge</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-slot-both" aria-label="Start and end slots">
                <SlotNavItems />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>start + end</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-slot-none" aria-label="No slots">
                <TextThreeItems prefix="slot-none-" />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>no slots</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-selection" title="9 Selection state" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-select-first">
                <SegmentedControl defaultValue="a" aria-label="First selected">
                  <SegmentedControl.Item value="a">First</SegmentedControl.Item>
                  <SegmentedControl.Item value="b">Second</SegmentedControl.Item>
                  <SegmentedControl.Item value="c">Third</SegmentedControl.Item>
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>First selected</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-select-middle">
                <SegmentedControl defaultValue="b" aria-label="Middle selected">
                  <SegmentedControl.Item value="a">First</SegmentedControl.Item>
                  <SegmentedControl.Item value="b">Second</SegmentedControl.Item>
                  <SegmentedControl.Item value="c">Third</SegmentedControl.Item>
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>Middle selected</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-select-last">
                <SegmentedControl defaultValue="c" aria-label="Last selected">
                  <SegmentedControl.Item value="a">First</SegmentedControl.Item>
                  <SegmentedControl.Item value="b">Second</SegmentedControl.Item>
                  <SegmentedControl.Item value="c">Third</SegmentedControl.Item>
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>Last selected</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <InteractionControlledDemo ids={SELECTION_DYNAMIC_IDS} />
              <span className={styles.scenarioCellCaption}>Dynamic selection</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-content-type" title="10 Content type" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-content-text" aria-label="Text only">
                <TextThreeItems prefix="text-" />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Text only</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-content-icon" type="icon" equalWidth={false} aria-label="Icon only">
                <IconThreeItems prefix="icon-" />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Icon only</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-content-text-icon" aria-label="Text and icon">
                <SegmentedControl.Item value="a" start={<QaHomeIcon />}>Home</SegmentedControl.Item>
                <SegmentedControl.Item value="b" start={<QaGridIcon />}>Browse</SegmentedControl.Item>
                <SegmentedControl.Item value="c" start={<QaUserIcon />}>Account</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Text + icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-content-long" equalWidth={false} aria-label="Long labels">
                <SegmentedControl.Item value="a">Quarterly performance</SegmentedControl.Item>
                <SegmentedControl.Item value="b">Year to date</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Long labels</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-content-emoji" aria-label="Emoji labels">
                <SegmentedControl.Item value="a">😀 Happy</SegmentedControl.Item>
                <SegmentedControl.Item value="b">🚀 Launch</SegmentedControl.Item>
                <SegmentedControl.Item value="c">⭐ Star</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Emoji labels</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-a11y" title="11 Accessibility validation" overflow>
        <p className={styles.storySectionLead}>
          aria-label / aria-labelledby, keyboard arrows, Tab focus, selected state on toggles.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-a11y-aria-label">
                <SegmentedControl defaultValue="a" aria-label="View mode">
                  <TextThreeItems prefix="a11y-label-" />
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>aria-label on group</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <span id="segmented-control-a11y-labelledby" className={styles.scenarioCellCaption}>
                Billing period
              </span>
              <QaSc testId="segmented-control-a11y-aria-labelledby">
                <SegmentedControl defaultValue="b" aria-labelledby="segmented-control-a11y-labelledby">
                  <TextThreeItems prefix="a11y-lblby-" />
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>aria-labelledby</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-a11y-icon-labels" type="icon" equalWidth={false} aria-label="Icon view switcher">
                <IconThreeItems prefix="a11y-icon-" />
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>icon items · per-item aria-label</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-a11y-disabled-item">
                <SegmentedControl defaultValue="a" aria-label="With disabled item">
                  <SegmentedControl.Item value="a">Active</SegmentedControl.Item>
                  <SegmentedControl.Item value="b" disabled>
                    Disabled
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="c">Other</SegmentedControl.Item>
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>disabled item</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-edge-cases" title="12 Edge cases" overflow>
        <QaApiSectionBody scrollable scrollableRegionLabel="SegmentedControl edge cases">
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-edge-single">
                <SegmentedControl defaultValue="only" aria-label="Single item">
                  <SegmentedControl.Item value="only">Only</SegmentedControl.Item>
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>Single item</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaSc testId="segmented-control-edge-two">
                <SegmentedControl defaultValue="a" aria-label="Two items">
                  <SegmentedControl.Item value="a">On</SegmentedControl.Item>
                  <SegmentedControl.Item value="b">Off</SegmentedControl.Item>
                </SegmentedControl>
              </QaSc>
              <span className={styles.scenarioCellCaption}>Two items</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <DynamicItemsDemo />
              <span className={styles.scenarioCellCaption}>Dynamic items (1–10)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-edge-empty-label" aria-label="Empty label segment">
                <SegmentedControl.Item value="a" aria-label="Whitespace segment">
                  {' '}
                </SegmentedControl.Item>
                <SegmentedControl.Item value="b">Visible</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Whitespace label (aria-label on item)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-edge-special" equalWidth={false} aria-label="Special characters">
                <SegmentedControl.Item value="a">50% · off</SegmentedControl.Item>
                <SegmentedControl.Item value="b">&lt;tag&gt;</SegmentedControl.Item>
                <SegmentedControl.Item value="c">€ · £ · ¥</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Special characters</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-edge-unicode" aria-label="Unicode text">
                <SegmentedControl.Item value="a">नमस्ते</SegmentedControl.Item>
                <SegmentedControl.Item value="b">مرحبا</SegmentedControl.Item>
                <SegmentedControl.Item value="c">你好</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>Unicode</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSegments testId="segmented-control-edge-rtl" aria-label="RTL text" style={{ direction: 'rtl' } as CSSProperties}>
                <SegmentedControl.Item value="a">العربية</SegmentedControl.Item>
                <SegmentedControl.Item value="b">עברית</SegmentedControl.Item>
              </ControlledSegments>
              <span className={styles.scenarioCellCaption}>RTL container</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-interaction" title="13 Interaction testing" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <InteractionControlledDemo />
              <span className={styles.scenarioCellCaption}>Controlled + onValueChange</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <UncontrolledDemo />
              <span className={styles.scenarioCellCaption}>Uncontrolled defaultValue</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-surface" title="14 Surface context" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Surface mode="bold" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-3)' }} data-testid="segmented-control-surface-bold">
                <ControlledSegments testId="segmented-control-on-bold" appearance="neutral" aria-label="On bold surface">
                  <TextThreeItems prefix="bold-" />
                </ControlledSegments>
              </Surface>
              <span className={styles.scenarioCellCaption}>on bold surface</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Surface mode="subtle" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-3)' }} data-testid="segmented-control-surface-subtle">
                <ControlledSegments testId="segmented-control-on-subtle" appearance="auto" aria-label="On subtle surface">
                  <TextThreeItems prefix="subtle-" />
                </ControlledSegments>
              </Surface>
              <span className={styles.scenarioCellCaption}>on subtle surface</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-controls" title="15 Live playground controls" overflow>
        <QaApiSectionBody>
          <SegmentedControlControlsPanel />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="segmented-control-qa-combos" title="16 Combination matrix" overflow>
        <p className={styles.storySectionLead}>
          Full-width stacked rows — segmented controls need horizontal room; avoid dense combo grids.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCellWide}>
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
                <div className={styles.scenarioWidePreviewWrap}>
                  <ControlledSegments
                    testId={`segmented-control-combo-${index}`}
                    {...row.props}
                    defaultValue={row.defaultValue ?? 'a'}
                    aria-label={row.caption}
                  >
                    {row.props.type === 'icon' ? (
                      <IconThreeItems prefix={`combo-${index}-`} />
                    ) : (
                      <TextThreeItems prefix={`combo-${index}-`} />
                    )}
                  </ControlledSegments>
                </div>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

    </QaShowcaseRoot>
  );
}
