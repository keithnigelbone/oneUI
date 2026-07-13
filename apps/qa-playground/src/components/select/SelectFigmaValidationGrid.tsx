'use client';

import React, { useState } from 'react';
import { Select } from '@oneui/ui/components/Select';
import { Icon } from '@oneui/ui/components/Icon';
import {
  SELECT_FIGMA_INPUT_ATTENTION_COLS,
  SELECT_FIGMA_INPUT_SIZE_ROWS,
  SELECT_FIGMA_INPUT_START_ROWS,
  SELECT_FIGMA_LABEL,
  SELECT_FIGMA_MENU_COLS,
  SELECT_FIGMA_PLACEHOLDER,
  SELECT_FIGMA_TRIGGER_COLS,
  SELECT_FIGMA_INPUT_GRID,
  SELECT_FIGMA_MENU_GRID,
  SELECT_FIGMA_TRIGGER_GRID,
  SELECT_FIGMA_VALIDATION_ROOT,
  selectFigmaCellTestId,
} from './selectFigmaValidation.shared';
import styles from './select-figma-validation.module.css';

const DEMO_OPTIONS = [
  { value: '1', label: 'Option title', secondaryText: 'Short description of this option' },
  { value: '2', label: 'Option title', secondaryText: 'Short description of this option' },
];

const DEMO_SECTIONS = [{ id: 'g1', label: 'Section label' }];
const GROUPED_OPTIONS = DEMO_OPTIONS.map((o) => ({ ...o, group: 'g1' }));

/**
 * Figma validation grids for Select micropattern (Frame 9 trigger row + SelectableInput matrix + Menu types).
 */
export function SelectFigmaValidationGrid() {
  return (
    <div className={styles.page} data-testid={SELECT_FIGMA_VALIDATION_ROOT}>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Trigger variants</h2>
        <p className={styles.metaLine}>
          Matches Figma Frame 9 — <code>trigger</code>: selectableInput, selectableButton, selectableIconButton.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid={SELECT_FIGMA_TRIGGER_GRID}>
            <caption className={styles.figmaCaption}>❖ Select — trigger</caption>
            <tbody>
              <tr>
                {SELECT_FIGMA_TRIGGER_COLS.map(({ trigger, label }) => (
                  <td key={trigger} className={styles.cell}>
                    <div className={styles.cellAnchor} data-testid={selectFigmaCellTestId('trigger', trigger)}>
                      <Select
                        trigger={trigger}
                        menuType="singleSelect"
                        options={DEMO_OPTIONS}
                        value="1"
                        onValueChange={() => {}}
                        label={trigger === 'selectableInput' ? SELECT_FIGMA_LABEL : undefined}
                        triggerLabel={trigger === 'selectableButton' ? 'Button' : undefined}
                        triggerIcon={
                          trigger === 'selectableIconButton' ? (
                            <Icon icon="heart" size="4" appearance="primary" emphasis="high" aria-hidden />
                          ) : undefined
                        }
                        attention="medium"
                        contained
                        chevron
                        placeholder={SELECT_FIGMA_PLACEHOLDER}
                        aria-label={trigger === 'selectableInput' ? undefined : `Select ${label}`}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr className={styles.footerRow}>
                {SELECT_FIGMA_TRIGGER_COLS.map(({ label }) => (
                  <td key={label}>trigger: {label}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SelectableInput — size × attention</h2>
        <p className={styles.metaLine}>
          Rows = <code>size</code> (s/m/l); columns = <code>attention</code> + <code>filled</code>.
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid={SELECT_FIGMA_INPUT_GRID}>
            <caption className={styles.figmaCaption}>❖ Select.SelectableInput</caption>
            <tbody>
              {SELECT_FIGMA_INPUT_SIZE_ROWS.map(({ size, label }) => (
                <tr key={size}>
                  {SELECT_FIGMA_INPUT_ATTENTION_COLS.map(({ attention, filled }) => (
                    <td key={`${size}-${attention}`} className={styles.cell}>
                      <div
                        className={styles.cellAnchor}
                        data-testid={selectFigmaCellTestId('input', `${size}-${attention}`)}
                      >
                        <Select.SelectableInput
                          size={size}
                          attention={attention}
                          filled={filled}
                          label
                        />
                      </div>
                    </td>
                  ))}
                  <th scope="row" className={styles.rowLabelRight}>
                    size: {label}
                  </th>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.footerRow}>
                {SELECT_FIGMA_INPUT_ATTENTION_COLS.map(({ label }) => (
                  <td key={label}>{label}</td>
                ))}
                <td className={styles.footerCorner} aria-hidden />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SelectableInput — start slots</h2>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable}>
            <caption className={styles.figmaCaption}>❖ start</caption>
            <tbody>
              {SELECT_FIGMA_INPUT_START_ROWS.map(({ start, label }) => (
                <tr key={start}>
                  <td className={styles.cell}>
                    <div className={styles.cellAnchor} data-testid={selectFigmaCellTestId('start', start)}>
                      <Select.SelectableInput size="m" label start={start} />
                    </div>
                  </td>
                  <th scope="row" className={styles.rowLabelRight}>
                    start: {label}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Menu types</h2>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid={SELECT_FIGMA_MENU_GRID}>
            <caption className={styles.figmaCaption}>❖ Select.Menu</caption>
            <tbody>
              <tr>
                {SELECT_FIGMA_MENU_COLS.map(({ menuType, label }) => (
                  <td key={menuType} className={styles.cell}>
                    <div data-testid={selectFigmaCellTestId('menu', menuType)}>
                      <Select.Menu
                        menuType={menuType}
                        groups={menuType === 'multiSelect'}
                        secondaryText={menuType === 'multiSelect'}
                        showSearch={menuType === 'multiSelect'}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
            <tfoot>
              <tr className={styles.footerRow}>
                {SELECT_FIGMA_MENU_COLS.map(({ label }) => (
                  <td key={label}>menuType: {label}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

/** Live API validation — controlled single / multi / actions. */
export function SelectApiValidationShowcase() {
  const [single, setSingle] = useState('1');
  const [multi, setMulti] = useState<string[]>(['1']);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', marginBottom: 'var(--Spacing-8)' }}>
      <div style={{ width: 328 }}>
        <Select
          trigger="selectableInput"
          label="Single select"
          options={DEMO_OPTIONS}
          value={single}
          onValueChange={setSingle}
          showSearch
        />
      </div>
      <div style={{ width: 328 }}>
        <Select
          menuType="multiSelect"
          secondaryText
          groups
          sections={DEMO_SECTIONS}
          options={GROUPED_OPTIONS}
          values={multi}
          onValuesChange={setMulti}
          aria-label="Multi select validation"
        />
      </div>
      <Select
        menuType="actions"
        trigger="selectableButton"
        triggerLabel="Actions"
        options={[
          { value: '1', label: 'Action' },
          { value: '2', label: 'Action' },
          { value: '3', label: 'Action' },
        ]}
        onAction={() => {}}
        aria-label="Actions validation"
      />
    </div>
  );
}
