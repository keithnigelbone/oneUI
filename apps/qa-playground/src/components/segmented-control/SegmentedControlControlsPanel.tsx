'use client';

import type { ComponentProps } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import type {
  SegmentedControlAttention,
  SegmentedControlShape,
  SegmentedControlSize,
  SegmentedControlTrackEmphasis,
  SegmentedControlType,
} from '@oneui/ui/components/SegmentedControl';
import type { ComponentAppearance } from '@oneui/shared';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import { Button } from '@oneui/ui/components/Button';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { Input } from '@oneui/ui/components/Input';
import panelStyles from './segmented-control-qa.module.css';
import styles from '../../styles/qa.module.css';
import {
  ControlledSegments,
  FIGMA_APPEARANCES,
  FIGMA_ATTENTIONS,
  FIGMA_SHAPES,
  FIGMA_SIZES,
  FIGMA_TRACK_EMPHASIS,
  QaHomeIcon,
  QaListIcon,
  QaOrdersIcon,
  QaUserIcon,
} from './segmentedControlQaShared';

type SlotMode = 'none' | 'start' | 'end' | 'both';

/** SelectableButton does not forward `data-testid` — wrap for Playwright anchors. */
function CtrlSelectableButton({
  testId,
  children,
  ...props
}: ComponentProps<typeof SelectableButton> & { testId: string }) {
  return (
    <span data-testid={testId} style={{ display: 'inline-flex' }}>
      <SelectableButton {...props}>{children}</SelectableButton>
    </span>
  );
}

const DEFAULT_ITEMS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

function buildJsxPreview(props: Record<string, unknown>, items: typeof DEFAULT_ITEMS, slotMode: SlotMode): string {
  const groupProps = Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) => (typeof v === 'string' ? `${k}="${v}"` : `${k}={${JSON.stringify(v)}}`))
    .join('\n  ');

  const itemLines = items.map((item) => {
    const parts: string[] = [`value="${item.value}"`];
    if (slotMode === 'start' || slotMode === 'both') parts.push('start={<Icon name="home" />}');
    if (slotMode === 'end' || slotMode === 'both') {
      parts.push('end={<CounterBadge value={3} aria-label="3 items" />}');
    }
    return `  <SegmentedControl.Item ${parts.join(' ')}>${item.label}</SegmentedControl.Item>`;
  });

  return `<SegmentedControl\n  ${groupProps}\n  aria-label="Live preview"\n>\n${itemLines.join('\n')}\n</SegmentedControl>`;
}

/**
 * Live playground — left property controls, right preview + JSX/JSON code blocks.
 */
export function SegmentedControlControlsPanel() {
  const [size, setSize] = useState<SegmentedControlSize>('m');
  const [attention, setAttention] = useState<SegmentedControlAttention>('high');
  const [appearance, setAppearance] = useState<ComponentAppearance>('primary');
  const [shape, setShape] = useState<SegmentedControlShape>('pill');
  const [type, setType] = useState<SegmentedControlType>('text');
  const [trackEmphasis, setTrackEmphasis] = useState<SegmentedControlTrackEmphasis>('high');
  const [equalWidth, setEqualWidth] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [slotMode, setSlotMode] = useState<SlotMode>('none');
  const [selectedValue, setSelectedValue] = useState('day');
  const [itemLabels, setItemLabels] = useState(DEFAULT_ITEMS);

  const liveProps = useMemo(
    () => ({
      size,
      attention,
      appearance,
      shape,
      type,
      trackEmphasis,
      equalWidth,
      disabled,
    }),
    [size, attention, appearance, shape, type, trackEmphasis, equalWidth, disabled],
  );

  const jsonPreview = useMemo(
    () =>
      JSON.stringify(
        {
          ...liveProps,
          value: selectedValue,
          items: itemLabels,
          slots: slotMode,
        },
        null,
        2,
      ),
    [liveProps, selectedValue, itemLabels, slotMode],
  );

  const jsxPreview = useMemo(
    () => buildJsxPreview({ ...liveProps, value: selectedValue }, itemLabels, slotMode),
    [liveProps, selectedValue, itemLabels, slotMode],
  );

  const reset = useCallback(() => {
    setSize('m');
    setAttention('high');
    setAppearance('primary');
    setShape('pill');
    setType('text');
    setTrackEmphasis('high');
    setEqualWidth(true);
    setDisabled(false);
    setSlotMode('none');
    setSelectedValue('day');
    setItemLabels(DEFAULT_ITEMS);
  }, []);

  const copyText = useCallback(async (text: string, testId: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard unavailable in some test environments */
    }
    document.querySelector(`[data-testid="${testId}"]`)?.setAttribute('data-copied', 'true');
  }, []);

  const renderItems = () =>
    itemLabels.map((item) => {
      const start =
        slotMode === 'start' || slotMode === 'both' ? (
          item.value === 'week' ? (
            <QaOrdersIcon />
          ) : item.value === 'month' ? (
            <QaUserIcon />
          ) : (
            <QaHomeIcon />
          )
        ) : undefined;
      const end =
        slotMode === 'end' || slotMode === 'both' ? (
          <CounterBadge value={item.value === 'week' ? 12 : 3} aria-label={`${item.label} count`} />
        ) : undefined;

      if (type === 'icon') {
        return (
          <SegmentedControl.Item
            key={item.value}
            value={item.value}
            start={start ?? <QaListIcon />}
            aria-label={item.label}
          />
        );
      }

      return (
        <SegmentedControl.Item key={item.value} value={item.value} start={start} end={end}>
          {item.label}
        </SegmentedControl.Item>
      );
    });

  return (
    <div className={panelStyles.controlsSplit} data-testid="segmented-control-controls-panel">
      <div className={panelStyles.controlsPanel}>
        <h4 className={panelStyles.controlsTitle}>Property controls</h4>

        <div className={panelStyles.controlRow}>
          <span className={panelStyles.controlLabel} id="sc-ctrl-size-label">
            size
          </span>
          <div className={panelStyles.segmentRow} role="group" aria-labelledby="sc-ctrl-size-label">
            {FIGMA_SIZES.map(({ figma, size: code }) => (
              <CtrlSelectableButton
                key={figma}
                testId={`segmented-control-ctrl-size-${figma.toLowerCase()}`}
                size="s"
                selected={size === code}
                onSelectedChange={(sel) => {
                  if (sel) setSize(code);
                }}
              >
                {figma}
              </CtrlSelectableButton>
            ))}
          </div>
        </div>

        <div className={panelStyles.controlRow}>
          <span className={panelStyles.controlLabel} id="sc-ctrl-attention-label">
            attention
          </span>
          <div className={panelStyles.segmentRow} role="group" aria-labelledby="sc-ctrl-attention-label">
            {FIGMA_ATTENTIONS.map((value) => (
              <CtrlSelectableButton
                key={value}
                testId={`segmented-control-ctrl-attention-${value}`}
                size="s"
                selected={attention === value}
                onSelectedChange={(sel) => {
                  if (sel) setAttention(value);
                }}
              >
                {value}
              </CtrlSelectableButton>
            ))}
          </div>
        </div>

        <div className={panelStyles.controlRow}>
          <span className={panelStyles.controlLabel} id="sc-ctrl-appearance-label">
            appearance
          </span>
          <div className={panelStyles.segmentRow} role="group" aria-labelledby="sc-ctrl-appearance-label">
            {FIGMA_APPEARANCES.map((value) => (
              <CtrlSelectableButton
                key={value}
                testId={`segmented-control-ctrl-appearance-${value}`}
                size="s"
                selected={appearance === value}
                onSelectedChange={(sel) => {
                  if (sel) setAppearance(value);
                }}
              >
                {value}
              </CtrlSelectableButton>
            ))}
          </div>
        </div>

        <div className={panelStyles.controlRow}>
          <span className={panelStyles.controlLabel} id="sc-ctrl-shape-label">
            shape
          </span>
          <div className={panelStyles.segmentRow} role="group" aria-labelledby="sc-ctrl-shape-label">
            {FIGMA_SHAPES.map((value) => (
              <CtrlSelectableButton
                key={value}
                testId={`segmented-control-ctrl-shape-${value}`}
                size="s"
                selected={shape === value}
                onSelectedChange={(sel) => {
                  if (sel) setShape(value);
                }}
              >
                {value}
              </CtrlSelectableButton>
            ))}
          </div>
        </div>

        <div className={panelStyles.controlRow}>
          <span className={panelStyles.controlLabel} id="sc-ctrl-track-label">
            trackEmphasis
          </span>
          <div className={panelStyles.segmentRow} role="group" aria-labelledby="sc-ctrl-track-label">
            {FIGMA_TRACK_EMPHASIS.map((value) => (
              <CtrlSelectableButton
                key={value}
                testId={`segmented-control-ctrl-track-${value}`}
                size="s"
                selected={trackEmphasis === value}
                onSelectedChange={(sel) => {
                  if (sel) setTrackEmphasis(value);
                }}
              >
                {value}
              </CtrlSelectableButton>
            ))}
          </div>
        </div>

        <div className={panelStyles.controlRow}>
          <span className={panelStyles.controlLabel} id="sc-ctrl-type-label">
            type
          </span>
          <div className={panelStyles.segmentRow} role="group" aria-labelledby="sc-ctrl-type-label">
            {(['text', 'icon'] as const).map((value) => (
              <CtrlSelectableButton
                key={value}
                testId={`segmented-control-ctrl-type-${value}`}
                size="s"
                selected={type === value}
                onSelectedChange={(sel) => {
                  if (sel) setType(value);
                }}
              >
                {value}
              </CtrlSelectableButton>
            ))}
          </div>
        </div>

        <div className={panelStyles.controlRow}>
          <span className={panelStyles.controlLabel} id="sc-ctrl-slots-label">
            slots
          </span>
          <div className={panelStyles.segmentRow} role="group" aria-labelledby="sc-ctrl-slots-label">
            {(['none', 'start', 'end', 'both'] as const).map((value) => (
              <CtrlSelectableButton
                key={value}
                testId={`segmented-control-ctrl-slots-${value}`}
                size="s"
                selected={slotMode === value}
                onSelectedChange={(sel) => {
                  if (sel) setSlotMode(value);
                }}
              >
                {value}
              </CtrlSelectableButton>
            ))}
          </div>
        </div>

        <div className={panelStyles.checkboxGrid}>
          <Checkbox
            checked={equalWidth}
            onCheckedChange={setEqualWidth}
            label="equalWidth"
            data-testid="segmented-control-ctrl-equal-width"
          />
          <Checkbox
            checked={disabled}
            onCheckedChange={setDisabled}
            label="disabled"
            data-testid="segmented-control-ctrl-disabled"
          />
        </div>

        <div className={panelStyles.controlRow}>
          <label className={panelStyles.controlLabel} htmlFor="sc-ctrl-middle-label">
            middle item label
          </label>
          <Input
            id="sc-ctrl-middle-label"
            size="m"
            value={itemLabels[1]?.label ?? ''}
            onChange={(value) =>
              setItemLabels((prev) => prev.map((item, i) => (i === 1 ? { ...item, label: value } : item)))
            }
            data-testid="segmented-control-ctrl-item-label"
            aria-label="Middle segment label"
          />
        </div>

        <div className={panelStyles.codeActions}>
          <Button size="s" variant="subtle" onClick={reset} data-testid="segmented-control-ctrl-reset">
            Reset
          </Button>
        </div>
      </div>

      <div className={panelStyles.previewColumn}>
        <div className={panelStyles.previewShell} data-testid="segmented-control-controls-live">
          <ControlledSegments
            testId="segmented-control-controls-live-inner"
            {...liveProps}
            defaultValue={selectedValue}
            onValueChange={setSelectedValue}
            aria-label="Live segmented control preview"
          >
            {renderItems()}
          </ControlledSegments>
        </div>
        <p className={styles.scenarioCellCaption} data-testid="segmented-control-controls-state">
          selected: {selectedValue}
        </p>

        <div className={panelStyles.codeActions}>
          <Button
            size="s"
            variant="ghost"
            onClick={() => copyText(jsxPreview, 'segmented-control-copy-jsx')}
            data-testid="segmented-control-copy-jsx"
          >
            Copy JSX
          </Button>
          <Button
            size="s"
            variant="ghost"
            onClick={() => copyText(jsonPreview, 'segmented-control-copy-json')}
            data-testid="segmented-control-copy-json"
          >
            Copy JSON
          </Button>
        </div>

        <pre
          className={panelStyles.codeBlock}
          data-testid="segmented-control-code-jsx"
          tabIndex={0}
          role="region"
          aria-label="Generated JSX preview"
        >
          {jsxPreview}
        </pre>
        <pre
          className={panelStyles.codeBlock}
          data-testid="segmented-control-code-json"
          tabIndex={0}
          role="region"
          aria-label="Generated JSON props preview"
        >
          {jsonPreview}
        </pre>
      </div>
    </div>
  );
}
