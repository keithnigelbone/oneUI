import { useMemo } from 'react';

import type {
  ButtonAppearance,
  ButtonAttention,
  ButtonSize,
  ButtonVariant,
} from '@oneui/ui/components/Button';
import { Button } from '@oneui/ui/components/Button';
import fixture from '../fixtures/figma-parity.fixture.json';
import { figmaButtonGridRowTestId, type FigmaButtonGridRow } from './figmaGridRowTestId';

import './tokens-bootstrap.css';
import styles from './figma-button-parity-page.module.css';
import { FigmaParityApp } from './FigmaParityApp';

/** Same slot glyph as `Button.stories.tsx` — inherits `currentColor` from the button. */
const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

type GridRow = FigmaButtonGridRow;
type FixtureVariant = (typeof fixture)['variants'][number];

function mapFixtureSizeToButtonSize(size: string): ButtonSize {
  const u = size.toUpperCase();
  if (u === 'XS') return 'xs';
  if (u === 'S') return 's';
  if (u === 'M') return 'm';
  if (u === 'L') return 'l';
  return 'm';
}

function rowLabel(row: GridRow): string {
  return `${row.variant} / ${row.attention} / ${row.state}`;
}

function rowSubLabel(row: GridRow): string {
  return `condensed=${row.condensed}, contained=${row.contained}, fullWidth=${row.fullWidth}, start=${row.start}, end=${row.end}`;
}

export function FigmaButtonParityPage() {
  const { columns, rows } = fixture.meta.grid;
  const canvasDefaults = fixture.meta.figmaContext?.canvasDefaultsAppliedToEveryVariant ?? {
    appearance: 'primary' as const,
    loading: false,
  };

  const cellMap = useMemo(() => {
    const m = new Map<string, FixtureVariant>();
    for (const v of fixture.variants) {
      const p = v.props as FixtureVariant['props'] & {
        appearance?: string;
        loading?: boolean;
      };
      const k = [
        p.size,
        p.variant,
        p.attention,
        p.state,
        p.condensed,
        p.contained,
        p.fullWidth,
        p.start,
        p.end,
        p.appearance ?? canvasDefaults.appearance,
        p.loading ?? canvasDefaults.loading,
      ].join('::');
      m.set(k, v);
    }
    return m;
  }, [canvasDefaults.appearance, canvasDefaults.loading]);

  const getCell = (size: string, row: GridRow): FixtureVariant | undefined => {
    const k = [
      size,
      row.variant,
      row.attention,
      row.state,
      row.condensed,
      row.contained,
      row.fullWidth,
      row.start,
      row.end,
      canvasDefaults.appearance,
      canvasDefaults.loading,
    ].join('::');
    return cellMap.get(k);
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Button — Figma Validation</h1>
      <p className={styles.metaLine}>
        {fixture.meta.figmaUrl} · COMPONENT_SET {fixture.meta.componentSetId} · {fixture.meta.totalVariants}{' '}
        variants
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.gridTable} data-testid="figma-button-grid">
          <thead>
            <tr>
              <th scope="col" className={styles.cornerHeader}>
                variant / attention / state
              </th>
              {columns.values.map((size) => (
                <th key={size} scope="col" className={styles.sizeHeader}>
                  {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.combinations.map((row) => (
              <tr key={rowLabel(row) + rowSubLabel(row)} data-testrow={figmaButtonGridRowTestId(row)}>
                <th scope="row" className={styles.rowHeader}>
                  <span className={styles.rowPrimary}>{rowLabel(row)}</span>
                  <span className={styles.rowSecondary}>{rowSubLabel(row)}</span>
                </th>
                {columns.values.map((size) => {
                  const v = getCell(size, row);
                  if (!v) {
                    return (
                      <td key={size} className={styles.cell}>
                        <span className={styles.missing}>—</span>
                      </td>
                    );
                  }
                  const variant = v.props.variant as ButtonVariant;
                  const p = v.props as FixtureVariant['props'] & {
                    appearance?: ButtonAppearance;
                    loading?: boolean;
                  };
                  const disabled =
                    p.state === 'disabled' ||
                    Boolean((p as { disabled?: boolean }).disabled);
                  const appearance = (p.appearance ?? canvasDefaults.appearance) as ButtonAppearance;
                  const loading = p.loading ?? canvasDefaults.loading;
                  return (
                    <td key={v.id} className={styles.cell}>
                      <Button
                        data-testid={v.id}
                        size={mapFixtureSizeToButtonSize(v.props.size)}
                        variant={variant}
                        attention={v.props.attention as ButtonAttention}
                        appearance={appearance}
                        contained={v.props.contained}
                        condensed={v.props.condensed}
                        fullWidth={v.props.fullWidth}
                        disabled={disabled}
                        loading={loading}
                        start={v.props.start ? <SlotIcon /> : undefined}
                        end={v.props.end ? <SlotIcon /> : undefined}
                      >
                        Label
                      </Button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FigmaButtonParityRoot() {
  return (
    <FigmaParityApp>
      <FigmaButtonParityPage />
    </FigmaParityApp>
  );
}
