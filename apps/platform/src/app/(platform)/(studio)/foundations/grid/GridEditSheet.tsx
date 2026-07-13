/**
 * GridEditSheet.tsx
 *
 * Brand-config editor rendered inside the reusable <Sheet> on the Grid page.
 * Edits a draft (columns / max-width / uncapped per breakpoint + container
 * variant). Margin/gutter are shown read-only for v1.
 */

'use client';

import {
  BREAKPOINT_IDS,
  BREAKPOINT_RANGES,
  F_STEPS,
  fStepToDimensionStep,
  type BreakpointId,
  type ContainerDefaultVariant,
} from '@oneui/shared';
import { Tabs } from '@oneui/ui/components/Tabs';
import { Stepper } from '@oneui/ui/components/Stepper';
import { Switch } from '@oneui/ui/components/Switch';
import { Slider } from '@oneui/ui-internal/components/Slider';
import styles from './GridEditSheet.module.css';

export interface GridBreakpointSpec {
  columns: number;
  maxWidth: number | null;
}

export interface GridEditDraft {
  breakpoints: Record<BreakpointId, GridBreakpointSpec>;
  defaultVariant: ContainerDefaultVariant;
}

export interface GridEditSheetProps {
  draft: GridEditDraft;
  onColumnsChange: (bp: BreakpointId, columns: number) => void;
  onMaxWidthChange: (bp: BreakpointId, maxWidth: number | null) => void;
  onUncappedChange: (bp: BreakpointId, uncapped: boolean) => void;
  /** Variant editing lives in the header tabs (<GridEditTabs>), not the body. */
}

/** Display the f-step name for a margin/gutter dimension token (read-only). */
function tokenToFStep(token: string): string {
  return F_STEPS.find((s) => fStepToDimensionStep(s) === token) ?? token;
}

function getRange(bp: BreakpointId) {
  return BREAKPOINT_RANGES.find((r) => r.id === bp)!;
}

export const GridEditTabs = ({
  variant,
  onVariantChange,
}: {
  variant: ContainerDefaultVariant;
  onVariantChange: (v: ContainerDefaultVariant) => void;
}) => (
  <Tabs.Root
    value={variant}
    onValueChange={(v) => v && onVariantChange(v as ContainerDefaultVariant)}
  >
    <Tabs.List>
      <Tabs.Item value="fluid">Fluid</Tabs.Item>
      <Tabs.Item value="fixed">Fixed</Tabs.Item>
      <Tabs.Item value="full-bleed">Full-bleed</Tabs.Item>
      <Tabs.Indicator />
    </Tabs.List>
  </Tabs.Root>
);

export function GridEditSheet({
  draft,
  onColumnsChange,
  onMaxWidthChange,
  onUncappedChange,
}: GridEditSheetProps) {
  return (
    <>
      {BREAKPOINT_IDS.map((bp) => {
        const spec = draft.breakpoints[bp];
        const uncapped = spec.maxWidth == null;
        const range = getRange(bp);
        return (
          <section key={bp} className={styles.bpCard}>
            <h3 className={styles.bpTitle}>Breakpoint {bp}</h3>

            <div className={styles.row}>
              <span className={styles.rowLabel}>Columns</span>
              <Stepper
                value={spec.columns}
                min={1}
                max={24}
                step={1}
                size="s"
                attention="low"
                onChange={(_, v) => v != null && onColumnsChange(bp, v)}
                aria-label={`Columns for breakpoint ${bp}`}
              />
            </div>

            <div className={styles.row}>
              <span className={styles.rowLabel}>Margin</span>
              <span className={styles.readOnlyValue}>{tokenToFStep(range.margin.default)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.rowLabel}>Gutter</span>
              <span className={styles.readOnlyValue}>{tokenToFStep(range.gutter.default)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.rowLabel}>Uncapped (fills viewport)</span>
              <Switch
                checked={uncapped}
                onCheckedChange={(checked) => onUncappedChange(bp, checked)}
                aria-label={`Uncapped for breakpoint ${bp}`}
              />
            </div>

            {!uncapped && (
              <div className={styles.sliderRow}>
                <div className={styles.sliderHead}>
                  <span className={styles.rowLabel}>Max width</span>
                  <span className={styles.readOnlyValue}>{spec.maxWidth}px</span>
                </div>
                <Slider
                  value={spec.maxWidth ?? 1280}
                  min={480}
                  max={2400}
                  step={20}
                  knobStyle="inside"
                  showTooltip={false}
                  onValueChange={(v) => onMaxWidthChange(bp, Array.isArray(v) ? v[0] : v)}
                  aria-label={`Max width for breakpoint ${bp}`}
                />
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
