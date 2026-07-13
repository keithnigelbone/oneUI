'use client';

import type { ReactNode } from 'react';
import { Chip } from '@oneui/ui/components/Chip';
import type { ChipAppearance, ChipAttention, ChipProps } from '@oneui/ui/components/Chip';
import { Icon } from '@oneui/ui/components/Icon';
import { Avatar } from '@oneui/ui/components/Avatar';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import { ChipSizeFigmaMatrix } from './ChipSizeFigmaMatrix';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Figma appearance variable modes (+ `auto`). Includes `brand-bg` — valid in code; Figma table catch-up pending. */
const FIGMA_APPEARANCE = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'brand-bg',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly ChipAppearance[];

type ComboRow = { caption: string; props: ChipProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'S · secondary · high · selected',
    props: { size: 's', appearance: 'secondary', attention: 'high', defaultSelected: true, children: 'Label' },
  },
  {
    caption: 'M · primary · medium · unselected',
    props: { size: 'm', appearance: 'primary', attention: 'medium', defaultSelected: false, children: 'Label' },
  },
  {
    caption: 'L · sparkle · low · selected',
    props: { size: 'l', appearance: 'sparkle', attention: 'low', defaultSelected: true, children: 'Label' },
  },
  {
    caption: 'M · auto · high · selected',
    props: { appearance: 'auto', attention: 'high', defaultSelected: true, children: 'Label' },
  },
  {
    caption: 'M · warning · high · disabled · selected',
    props: { appearance: 'warning', attention: 'high', disabled: true, defaultSelected: true, children: 'Label' },
  },
  {
    caption: 'M · positive · low · start Icon',
    props: {
      appearance: 'positive',
      attention: 'low',
      defaultSelected: false,
      start: <Icon icon="heart" size="4" aria-hidden />,
      children: 'Label',
    },
  },
  {
    caption: 'M · informative · high · end IndicatorBadge',
    props: {
      appearance: 'informative',
      attention: 'high',
      defaultSelected: true,
      end: <IndicatorBadge size="s" appearance="negative" aria-label="Status" />,
      children: 'Label',
    },
  },
  {
    caption: 'M · negative · medium · Avatar + CounterBadge',
    props: {
      appearance: 'negative',
      attention: 'medium',
      defaultSelected: true,
      start: <Avatar size="s" appearance="secondary" alt="User" />,
      end: <CounterBadge value={3} size="xs" appearance="negative" aria-label="3" />,
      children: 'Label',
    },
  },
];

/** Stable console contract for Playwright (`e2e/chip-qa.spec.ts` event tests). */
function logChipQaEvent(testId: string, event: string, payload: Record<string, unknown>) {
  console.log(`[chip-qa] ${event} ${JSON.stringify({ testId, ...payload })}`);
}

function DemoChip({ children = 'Label', ...props }: ChipProps) {
  return (
    <Chip aria-label={typeof children === 'string' ? children : 'Chip'} {...props}>
      {children}
    </Chip>
  );
}

/** One sandbox band: lead copy + scenarios stacked inside a single apiSectionBody (Switch/Checkbox pattern). */
function ChipScenarioBand({
  id,
  title,
  lead,
  overflow,
  centerContent,
  children,
}: {
  id: string;
  title: string;
  lead?: ReactNode;
  overflow?: boolean;
  centerContent?: boolean;
  children: ReactNode;
}) {
  return (
    <QaStoryBand
      id={id}
      title={title}
      lead={centerContent ? undefined : lead}
      overflow={overflow}
      centerContent={centerContent}
    >
      {centerContent ? (
        <div className={styles.scenarioInlinePreview}>{children}</div>
      ) : (
        <QaApiSectionBody>{children}</QaApiSectionBody>
      )}
    </QaStoryBand>
  );
}

/**
 * Chip QA playground — Figma API sections, slot matrix, combination grid.
 *
 * NOTE: Chip does not forward data-testid to the DOM root element (no ...rest spread).
 * All testids are placed on wrapper <div> elements so Playwright can locate them.
 * Functional tests that need chip attributes use
 * `wrapper.locator('button').first()` to reach the actual toggle button.
 */
export function ChipQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <ChipScenarioBand id="chip-qa-default" title="Default" centerContent>
        {/* testid on div — Chip does not forward data-testid to the DOM */}
        <div data-testid="chip-default">
          <DemoChip />
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-size"
        title="1 Size (M · S · L)"
        overflow
        lead={
          <>
            Matches the Figma API-table art: rows are <strong>selected</strong> (<code>true</code> then{' '}
            <code>false</code>); columns are size in Figma order <strong>M, S, L</strong> (code <code>m</code>,{' '}
            <code>s</code>, <code>l</code>). Each chip uses <code>start</code> Icon + Label +{' '}
            <code>end</code> IndicatorBadge at <code>attention=&quot;low&quot;</code> so selected shows the orange stroke
            and unselected stays borderless.
          </>
        }
      >
        <ChipSizeFigmaMatrix />
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-selected"
        title="2 selected (true · false)"
        lead={
          <>
            Figma <code>selected</code> component property maps to <code>selected</code> / <code>defaultSelected</code>{' '}
            on the Toggle primitive.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          {/* testid on cell div — Chip does not forward data-testid to the DOM */}
          <div className={styles.scenarioLabeledCell} data-testid="chip-selected-true">
            <DemoChip appearance="secondary" attention="high" defaultSelected />
            <span className={styles.scenarioCellCaption}>selected: true (defaultSelected)</span>
          </div>
          <div className={styles.scenarioLabeledCell} data-testid="chip-selected-false">
            <DemoChip appearance="secondary" attention="high" defaultSelected={false} />
            <span className={styles.scenarioCellCaption}>selected: false</span>
          </div>
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-attention"
        title="3 Attention (high · medium · low)"
        lead={
          <>
            Figma <code>attention</code> maps to variant (<code>high</code> → bold fill when selected, <code>medium</code>{' '}
            → subtle, <code>low</code> → ghost/outlined). All chips shown selected so fill differences are visible.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          {(['high', 'medium', 'low'] as const satisfies readonly ChipAttention[]).map((attention) => (
            /* testid on cell div — Chip does not forward data-testid to the DOM */
            <div key={attention} className={styles.scenarioLabeledCell} data-testid={`chip-attention-${attention}`}>
              <DemoChip
                attention={attention}
                appearance="secondary"
                defaultSelected
              />
              <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
            </div>
          ))}
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-appearance"
        title="4 Appearance (Figma + auto)"
        overflow
        lead={
          <>
            Figma variable-mode roles at <code>attention=&quot;high&quot;</code> + selected.{' '}
            <code>brand-bg</code> is a valid <code>ComponentAppearance</code> role (implementation required); some Figma API
            screenshots omit it until variable modes are published — see <code>docs/appearance-roles.md</code>.
          </>
        }
      >
        <div className={styles.scenarioAppearanceStack}>
          {FIGMA_APPEARANCE.map((appearance) => (
            /* testid on row div — Chip does not forward data-testid to the DOM */
            <div key={appearance} className={styles.scenarioAppearanceRow} data-testid={`chip-appearance-${appearance}`}>
              <span className={styles.scenarioAppearanceLabel}>{appearance}</span>
              <DemoChip
                appearance={appearance}
                attention="high"
                defaultSelected
              />
            </div>
          ))}
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-disabled"
        title="5 disabled (variable mode)"
        lead={
          <>
            Figma <code>disabled</code> variable mode ↔ code <code>disabled</code> prop. Shown selected and unselected.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          {/* testids on cell divs — Chip does not forward data-testid to the DOM */}
          <div className={styles.scenarioLabeledCell} data-testid="chip-disabled-false">
            <DemoChip appearance="secondary" attention="high" defaultSelected />
            <span className={styles.scenarioCellCaption}>disabled: false</span>
          </div>
          <div className={styles.scenarioLabeledCell} data-testid="chip-disabled-true-selected">
            <DemoChip
              appearance="secondary"
              attention="high"
              defaultSelected
              disabled
            />
            <span className={styles.scenarioCellCaption}>disabled: true · selected</span>
          </div>
          <div className={styles.scenarioLabeledCell} data-testid="chip-disabled-true-unselected">
            <DemoChip appearance="secondary" attention="high" defaultSelected={false} disabled />
            <span className={styles.scenarioCellCaption}>disabled: true · unselected</span>
          </div>
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-start"
        title="6 start slot (none · Icon · Avatar · CounterBadge · IndicatorBadge)"
        lead={
          <>
            Figma <code>start</code> component property — code uses <code>start</code> ReactNode slot. Size M, selected,
            high attention.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          <SlotDemo caption="none" testId="chip-start-none" />
          <SlotDemo caption="Icon" testId="chip-start-icon" start={<Icon icon="heart" size="4" aria-hidden />} />
          <SlotDemo
            caption="Avatar"
            testId="chip-start-avatar"
            start={<Avatar size="s" appearance="secondary" alt="User" />}
          />
          <SlotDemo
            caption="CounterBadge"
            testId="chip-start-counter"
            start={<CounterBadge value={3} size="xs" appearance="negative" aria-label="3" />}
          />
          <SlotDemo
            caption="IndicatorBadge"
            testId="chip-start-indicator"
            start={<IndicatorBadge size="s" appearance="negative" aria-label="Status" />}
          />
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-end"
        title="7 end slot (none · Icon · Avatar · CounterBadge · IndicatorBadge)"
        lead={<>Figma <code>end</code> component property — code uses <code>end</code> ReactNode slot.</>}
      >
        <div className={styles.scenarioFlexRow}>
          <SlotDemo caption="none" testId="chip-end-none" endOnly />
          <SlotDemo caption="Icon" testId="chip-end-icon" end={<Icon icon="heart" size="4" aria-hidden />} endOnly />
          <SlotDemo
            caption="Avatar"
            testId="chip-end-avatar"
            end={<Avatar size="s" appearance="secondary" alt="User" />}
            endOnly
          />
          <SlotDemo
            caption="CounterBadge"
            testId="chip-end-counter"
            end={<CounterBadge value={5} size="xs" appearance="negative" aria-label="5" />}
            endOnly
          />
          <SlotDemo
            caption="IndicatorBadge"
            testId="chip-end-indicator"
            end={<IndicatorBadge size="s" appearance="negative" aria-label="Status" />}
            endOnly
          />
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-slots-combo"
        title="8 Slot combinations (Figma art)"
        lead={
          <>
            Icon + dot pairs from the COMPONENT_SET reference — mirrors rows on the <strong>Figma Validation</strong>{' '}
            tab.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          {/* testids on wrapper divs — Chip does not forward data-testid to the DOM */}
          <div data-testid="chip-slots-both-icons">
            <DemoChip
              appearance="secondary"
              attention="high"
              defaultSelected
              start={<Icon icon="heart" size="4" aria-hidden />}
              end={<Icon icon="heart" size="4" aria-hidden />}
            />
          </div>
          <div data-testid="chip-slots-icon-dot">
            <DemoChip
              appearance="secondary"
              attention="high"
              defaultSelected
              start={<Icon icon="heart" size="4" aria-hidden />}
              end={<IndicatorBadge size="s" appearance="negative" aria-label="Status" />}
            />
          </div>
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-extra"
        title="9 variant — code alias for attention ⚠️"
        lead={
          <>
            Not on the Figma API table: <code>variant</code> (<code>bold</code> / <code>subtle</code> / <code>ghost</code>
            ) overrides <code>attention</code> when both are set.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          <div className={styles.scenarioLabeledCell} data-testid="chip-variant-bold">
            <DemoChip variant="bold" appearance="secondary" defaultSelected />
            <span className={styles.scenarioCellCaption}>variant: bold ⚠️</span>
          </div>
          <div className={styles.scenarioLabeledCell} data-testid="chip-variant-subtle">
            <DemoChip variant="subtle" appearance="secondary" defaultSelected />
            <span className={styles.scenarioCellCaption}>variant: subtle ⚠️</span>
          </div>
          <div className={styles.scenarioLabeledCell} data-testid="chip-variant-ghost">
            <DemoChip variant="ghost" appearance="secondary" />
            <span className={styles.scenarioCellCaption}>variant: ghost ⚠️</span>
          </div>
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand
        id="chip-qa-events"
        title="10 Events (console)"
        lead={
          <>
            Chip user events surface through <code>onSelectedChange</code> (Base UI Toggle <code>onPressedChange</code>).
            Handlers below log <code>[chip-qa] selectedChange …</code> for Playwright — not production behaviour.
          </>
        }
      >
        <div className={styles.scenarioFlexRow}>
          {/* testids on cell divs — Chip does not forward data-testid to the DOM */}
          <div className={styles.scenarioLabeledCell} data-testid="chip-event-probe">
            <DemoChip
              appearance="secondary"
              attention="high"
              defaultSelected={false}
              onSelectedChange={(selected) =>
                logChipQaEvent('chip-event-probe', 'selectedChange', { selected })
              }
            />
            <span className={styles.scenarioCellCaption}>click / keyboard → selectedChange</span>
          </div>
          <div className={styles.scenarioLabeledCell} data-testid="chip-event-disabled">
            <DemoChip
              appearance="secondary"
              attention="high"
              defaultSelected
              disabled
              onSelectedChange={(selected) =>
                logChipQaEvent('chip-event-disabled', 'selectedChange', { selected })
              }
            />
            <span className={styles.scenarioCellCaption}>disabled — no toggle, no log</span>
          </div>
        </div>
      </ChipScenarioBand>

      <ChipScenarioBand id="chip-qa-combos" title="11 Combination matrix">
        <div className={styles.scenarioComboGrid}>
          {COMBO_MATRIX.map((row, index) => (
            /* testid on cell div — Chip does not forward data-testid to the DOM */
            <div key={row.caption} className={styles.scenarioLabeledCell} data-testid={`chip-combo-${index}`}>
              <DemoChip {...row.props} />
              <span className={styles.scenarioCellCaption}>{row.caption}</span>
            </div>
          ))}
        </div>
      </ChipScenarioBand>
    </QaShowcaseRoot>
  );
}

function SlotDemo({
  caption,
  testId,
  start,
  end,
  endOnly,
}: {
  caption: string;
  testId: string;
  start?: ReactNode;
  end?: ReactNode;
  endOnly?: boolean;
}) {
  // testid on cell div — Chip does not forward data-testid to the DOM
  return (
    <div className={styles.scenarioLabeledCell} data-testid={testId}>
      <DemoChip
        appearance="secondary"
        attention="high"
        defaultSelected
        start={endOnly ? undefined : start}
        end={end}
      />
      <span className={styles.scenarioCellCaption}>{caption}</span>
    </div>
  );
}
