'use client';

import type { ReactNode } from 'react';
import { Badge } from '@oneui/ui/components/Badge';
import type { BadgeAppearance, BadgeProps, BadgeSize } from '@oneui/ui/components/Badge';
import { Icon } from '@oneui/ui/components/Icon';
import { Avatar } from '@oneui/ui/components/Avatar';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

/** Figma size labels ↔ code `size` (lowercase). */
const FIGMA_SIZES: { figma: string; size: BadgeSize }[] = [
  { figma: 'XS', size: 'xs' },
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
  { figma: 'XL', size: 'xl' },
];

/** Nine-role Figma appearance table (+ `auto`). Code also supports tertiary, quaternary, brand-bg (see report). */
const FIGMA_APPEARANCE_9 = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly BadgeAppearance[];

const ATTENTION_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

/** Same pattern as `packages/ui/src/components/Badge/Badge.stories.tsx` — slot Icon inherits appearance (no forced role). */
function slotIconEl() {
  return <Icon icon="home" aria-label="" />;
}
function slotAvatarEl() {
  return <Avatar content="icon" size="m" aria-label="AB" />;
}
function slotCounterEl() {
  return <CounterBadge value={3} size="m" appearance="negative" aria-label="3 items" />;
}
function slotIndicatorEl() {
  return <IndicatorBadge  size="m" aria-label="Alert" />;
}

type AttentionBothSlotsRow = {
  label: string;
  slots: () => { start: ReactNode; end: ReactNode };
  testidPrefix: string;
};

/** high · medium · low with identical start and end slot content (fresh nodes per cell). */
const ATTENTION_BOTH_SLOT_ROWS: AttentionBothSlotsRow[] = [
  {
    label: 'Icon · Icon',
    slots: () => ({ start: slotIconEl(), end: slotIconEl() }),
    testidPrefix: 'badge-attention-both-icon',
  },
  {
    label: 'Avatar · Avatar',
    slots: () => ({ start: slotAvatarEl(), end: slotAvatarEl() }),
    testidPrefix: 'badge-attention-both-avatar',
  },
  {
    label: 'CounterBadge · CounterBadge',
    slots: () => ({ start: slotCounterEl(), end: slotCounterEl() }),
    testidPrefix: 'badge-attention-both-counterbadge',
  },
  {
    label: 'IndicatorBadge · IndicatorBadge',
    slots: () => ({ start: slotIndicatorEl(), end: slotIndicatorEl() }),
    testidPrefix: 'badge-attention-both-indicatorbadge',
  },
];

type ComboRow = { caption: string; props: BadgeProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'XS · high · primary',
    props: { size: 'xs', attention: 'high', appearance: 'primary', children: 'Label' },
  },
  {
    caption: 'S · high · primary',
    props: { size: 's', attention: 'high', appearance: 'primary', children: 'Label' },
  },
  {
    caption: 'M · medium · neutral',
    props: { size: 'm', attention: 'medium', appearance: 'neutral', children: 'Label' },
  },
  {
    caption: 'L · low · negative',
    props: { size: 'l', attention: 'low', appearance: 'negative', children: 'Label' },
  },
  {
    caption: 'XL · high · positive',
    props: { size: 'xl', attention: 'high', appearance: 'positive', children: 'Label' },
  },
  {
    caption: 'M · high · primary · start Icon',
    props: {
      size: 'm',
      attention: 'high',
      appearance: 'primary',
      start: slotIconEl(),
      children: 'Label',
    },
  },
  {
    caption: 'M · high · primary · end Icon',
    props: {
      size: 'm',
      attention: 'high',
      appearance: 'primary',
      end: slotIconEl(),
      children: 'Label',
    },
  },
  {
    caption: 'M · high · primary · start+end Icon',
    props: {
      size: 'm',
      attention: 'high',
      appearance: 'primary',
      start: slotIconEl(),
      end: slotIconEl(),
      children: 'Label',
    },
  },
  {
    caption: 'M · high · primary · start Avatar',
    props: {
      size: 'm',
      attention: 'high',
      appearance: 'primary',
      start: slotAvatarEl(),
      children: 'Label',
    },
  },
  {
    caption: 'M · high · primary · start CounterBadge',
    props: {
      size: 'm',
      attention: 'high',
      appearance: 'primary',
      start: slotCounterEl(),
      children: 'Label',
    },
  },
  {
    caption: 'M · high · primary · start IndicatorBadge',
    props: {
      size: 'm',
      attention: 'high',
      appearance: 'primary',
      start: slotIndicatorEl(),
      children: 'Label',
    },
  },
  ...FIGMA_APPEARANCE_9.map((appearance) => ({
    caption: `M · high · ${appearance} · start Icon`,
    props: {
      size: 'm' as const,
      attention: 'high' as const,
      appearance,
      start: slotIconEl(),
      children: 'Label',
    } satisfies BadgeProps,
  })),
];

/**
 * Badge QA playground — Figma API sections, code-only notes, combination matrix.
 * `data-testid` is forwarded on the root Badge span only ({@link packages/ui/src/components/Badge/Badge.tsx}).
 */
export function BadgeQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="badge-qa-default" title="Default" centerContent>
        <Badge aria-label="Default badge" appearance="positive" data-testid="badge-default">
          Label
        </Badge>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-size" title="1 Size (XS · S · M · L · XL)" overflow>
        <p className={styles.storySectionLead}>
          Figma uses uppercase size labels; code uses lowercase <code>size</code> props (
          <code>xs</code> … <code>xl</code>
          ).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <Badge size={size} aria-label={`Size ${figma}`} data-testid={`badge-size-${figma}`}>
                  Label
                </Badge>
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-attention" title="2 Attention (high · medium · low)" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {(['high', 'medium', 'low'] as const).map((attention) => (
              <div key={attention} className={styles.scenarioLabeledCell}>
                <Badge
                  attention={attention}
                  aria-label={ATTENTION_LABEL[attention]}
                  data-testid={`badge-attention-${attention}`}
                >
                  {ATTENTION_LABEL[attention]}
                </Badge>
                <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand
        id="badge-qa-attention-both-slots"
        title="2b Attention — start & end (same slot type)"
        overflow
      >
        <p className={styles.storySectionLead}>
          Each row shows <strong>high</strong>, <strong>medium</strong>, and <strong>low</strong>{' '}
          attention with the same slot component in <code>start</code> and <code>end</code> (
          <code>size=&quot;m&quot;</code>, <code>appearance=&quot;primary&quot;</code>).
        </p>
        {ATTENTION_BOTH_SLOT_ROWS.map((row) => (
          <QaApiSectionBody key={row.testidPrefix}>
            <p className={styles.storySectionLead}>{row.label}</p>
            <div className={styles.scenarioFlexRow}>
              {(['high', 'medium', 'low'] as const).map((attention) => {
                const { start, end } = row.slots();
                return (
                  <div key={attention} className={styles.scenarioLabeledCell}>
                    <Badge
                      attention={attention}
                      size="m"
                      start={start}
                      end={end}
                      aria-label={`${row.label} attention ${attention}`}
                      data-testid={`${row.testidPrefix}-${attention}`}
                    >
                      {ATTENTION_LABEL[attention]}
                    </Badge>
                    <span className={styles.scenarioCellCaption}>{`attention: ${attention}`}</span>
                  </div>
                );
              })}
            </div>
          </QaApiSectionBody>
        ))}
      </QaStoryBand>

      <QaStoryBand id="badge-qa-appearance" title="3 Appearance (Figma 9 + auto)" overflow>
        <p className={styles.storySectionLead}>
          All at <strong>high</strong> attention. Source also allows <code>tertiary</code>,{' '}
          <code>quaternary</code>, and <code>brand-bg</code> (not in this Figma table) — see{' '}
          <code>public/qa-reports/prop-validation-report.md</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_APPEARANCE_9.map((appearance) => (
              <div key={appearance} className={styles.scenarioLabeledCell}>
                <Badge
                  appearance={appearance}
                  attention="high"
                  size="m"
                  aria-label={`appearance ${appearance}`}
                  data-testid={`badge-appearance-${appearance}`}
                >
                  {appearance}
                </Badge>
                <span className={styles.scenarioCellCaption}>{`appearance: ${appearance}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-start-slot" title="4 Start slot" overflow>
        <p className={styles.storySectionLead}>
          Figma lists symbolic slot modes; code passes <code>start=</code> <code>ReactNode</code>{' '}
          (Icon, Avatar, CounterBadge, IndicatorBadge). <code>none</code> = omit the prop.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Badge aria-label="start none" data-testid="badge-start-none">
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start: none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge start={slotIconEl()} aria-label="start icon" data-testid="badge-start-Icon">
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start: Icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotAvatarEl()}
                aria-label="start avatar"
                data-testid="badge-start-Avatar"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start: Avatar</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotCounterEl()}
                aria-label="start counter"
                data-testid="badge-start-CounterBadge"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start: CounterBadge</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotIndicatorEl()}
                aria-label="start indicator"
                data-testid="badge-start-IndicatorBadge"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start: IndicatorBadge</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-end-slot" title="5 End slot" overflow>
        <p className={styles.storySectionLead}>
          Same mapping as start — <code>end=</code> receives slot content; <code>none</code> omits
          the prop.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Badge aria-label="end none" data-testid="badge-end-none">
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>end: none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge end={slotIconEl()} aria-label="end icon" data-testid="badge-end-Icon">
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>end: Icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge end={slotAvatarEl()} aria-label="end avatar" data-testid="badge-end-Avatar">
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>end: Avatar</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                end={slotCounterEl()}
                aria-label="end counter"
                data-testid="badge-end-CounterBadge"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>end: CounterBadge</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                end={slotIndicatorEl()}
                aria-label="end indicator"
                data-testid="badge-end-IndicatorBadge"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>end: IndicatorBadge</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-start-end-combo" title="6 Start + end combinations" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotIconEl()}
                size="m"
                appearance="positive"
                aria-label="icon none"
                data-testid="badge-start-icon-end-none"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start=Icon, end=none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                end={slotIconEl()}
                size="m"
                appearance="positive"
                aria-label="none icon"
                data-testid="badge-start-none-end-icon"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start=none, end=Icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotIconEl()}
                size="m"
                appearance="positive"
                end={slotIconEl()}
                aria-label="icon icon"
                data-testid="badge-start-icon-end-icon"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start=Icon, end=Icon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotAvatarEl()}
                size="m"
                appearance="positive"
                aria-label="avatar none"
                data-testid="badge-start-avatar-end-none"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start=Avatar, end=none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotCounterEl()}
                size="m"
                appearance="positive"
                aria-label="counter none"
                data-testid="badge-start-counterbadge-end-none"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start=CounterBadge, end=none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                start={slotIndicatorEl()}
                size="m"
                appearance="positive"
                aria-label="indicator none"
                data-testid="badge-start-indicatorbadge-end-none"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start=IndicatorBadge, end=none</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                size="m"
                start={slotAvatarEl()}
                appearance="positive"
                end={slotCounterEl()}
                aria-label="avatar counter"
                data-testid="badge-start-avatar-end-counterbadge"
              >
                Label
              </Badge>
              <span className={styles.scenarioCellCaption}>start=Avatar, end=CounterBadge</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-accent" title="7 accent (code-only — not implemented)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: Figma documents `accent` as code-only; Badge has no `accent` prop — use `appearance` instead. */}
          There is no <code>accent</code> prop on <code>Badge</code>. Below uses{' '}
          <code>appearance=&quot;primary&quot; | &quot;secondary&quot; | &quot;sparkle&quot;</code>{' '}
          as a visual stand-in. Code only — not in Figma API.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                appearance="primary"
                attention="high"
                aria-label="primary stand-in"
                data-testid="badge-accent-primary"
              >
                Primary
              </Badge>
              <span className={styles.scenarioCellCaption}>appearance=primary (stand-in)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                appearance="secondary"
                attention="high"
                aria-label="secondary stand-in"
                data-testid="badge-accent-secondary"
              >
                Secondary
              </Badge>
              <span className={styles.scenarioCellCaption}>appearance=secondary (stand-in)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Badge
                appearance="sparkle"
                attention="high"
                aria-label="sparkle stand-in"
                data-testid="badge-accent-sparkle"
              >
                Sparkle
              </Badge>
              <span className={styles.scenarioCellCaption}>appearance=sparkle (stand-in)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-content" title="8 content (code-only — not implemented)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: Figma `content=text` has no matching prop — label text is `children`. */}
          There is no <code>content</code> prop; visible copy is <code>children</code>. Code only —
          not in Figma API.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Badge aria-label="Text content" data-testid="badge-content-text">
                Text Content
              </Badge>
              <span className={styles.scenarioCellCaption}>children (text)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="badge-qa-combos" title="9 Full combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={`badge-combo-${index}`} className={styles.scenarioLabeledCell}>
                <Badge
                  {...row.props}
                  aria-label={row.caption}
                  data-testid={`badge-combo-${index}`}
                />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
