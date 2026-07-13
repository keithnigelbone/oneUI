'use client';

/**
 * CheckboxFieldFigmaValidationGrid
 *
 * Mirrors the Figma COMPONENT_SET for CheckboxField:
 *
 *  Rows:    checked state  → unchecked (false) · checked (true) · indeterminate
 *  Columns: field config   → default · readOnly · disabled · required · invalid
 *                             · with description · with feedback · multi-option
 *
 * Each cell is labelled with the Figma property name(s) it validates so QA
 * engineers can cross-check the matrix against the Figma component set.
 *
 * Figma API table properties tested here:
 *   size (S/M/L), checked, indeterminate, readOnly, disabled, label, labelText,
 *   description, descriptionText, require, feedback, dynamicText, content (Figma-only)
 */

import React from 'react';
import { CheckboxField } from '@oneui/ui/components/CheckboxField';
import type { CheckboxFieldProps } from '@oneui/ui/components/CheckboxField';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { InputFeedback, InputDynamicText } from '@oneui/ui/components/Input';
import styles from '../shared/qa-figma-validation.module.css';

/* ─── Row definitions (checked state axis) ──────────────────────────── */
type CheckedState = 'unchecked' | 'checked' | 'indeterminate';

const CHECKED_STATE_ROWS: { state: CheckedState; label: string; props: Pick<CheckboxFieldProps, 'checked' | 'indeterminate'> }[] = [
  { state: 'unchecked', label: 'checked: false', props: { checked: false } },
  { state: 'checked', label: 'checked: true', props: { checked: true } },
  { state: 'indeterminate', label: 'indeterminate: true', props: { indeterminate: true } },
];

/* ─── Column definitions (field config axis) ─────────────────────────── */
interface ColConfig {
  id: string;
  header: string;
  /** Additional props merged onto CheckboxField for this column. */
  extraProps: Partial<CheckboxFieldProps>;
}

const FIELD_CONFIG_COLS: ColConfig[] = [
  {
    id: 'default',
    header: 'Default',
    extraProps: { label: 'Checkbox', description: 'Description' },
  },
  {
    id: 'readOnly',
    header: 'readOnly: true',
    extraProps: { label: 'Checkbox', description: 'Description', readOnly: true },
  },
  {
    id: 'disabled',
    header: 'disabled: true',
    extraProps: { label: 'Checkbox', description: 'Description', disabled: true },
  },
  {
    id: 'required',
    header: 'required: true',
    extraProps: { label: 'Checkbox', description: 'Description', required: true },
  },
  {
    id: 'invalid',
    header: 'invalid + error',
    extraProps: {
      label: 'Checkbox',
      description: 'Description',
      invalid: true,
      error: 'Required.',
    },
  },
  {
    id: 'label-only',
    header: 'label only',
    extraProps: { label: 'Checkbox' },
  },
  {
    id: 'no-label',
    header: 'no label\n(aria-label)',
    extraProps: {},
  },
];

/* ─── Size matrix rows (separate section) ────────────────────────────── */
const SIZE_ROWS: { size: CheckboxFieldProps['size']; label: string }[] = [
  { size: 's', label: 'S [4]' },
  { size: 'm', label: 'M [5]' },
  { size: 'l', label: 'L [6]' },
];

/* ─── Feedback variants section ──────────────────────────────────────── */
const FEEDBACK_ROWS: { id: string; label: string; feedbackEl: React.ReactNode }[] = [
  {
    id: 'negative',
    label: 'negative (error)',
    feedbackEl: (
      <InputFeedback variant="negative" attention="low">
        You must accept to continue.
      </InputFeedback>
    ),
  },
  {
    id: 'informative',
    label: 'informative',
    feedbackEl: (
      <InputFeedback variant="informative" attention="low">
        Preferences sync across devices.
      </InputFeedback>
    ),
  },
  {
    id: 'positive',
    label: 'positive',
    feedbackEl: (
      <InputFeedback variant="positive" attention="low">
        Saved successfully.
      </InputFeedback>
    ),
  },
  {
    id: 'neutral',
    label: 'no variant (neutral)',
    feedbackEl: <InputFeedback attention="low">Helper text.</InputFeedback>,
  },
];

export function CheckboxFieldFigmaValidationGrid() {
  return (
    <div className={styles.page} data-testid="checkboxfield-figma-validation-root">

      {/* ── Section 1: checked-state × field-config matrix ── */}
      <p className={styles.metaLine}>
        Figma <strong>COMPONENT_SET</strong> matrix —{' '}
        <strong>rows</strong>: checked state (unchecked / checked / indeterminate) ×{' '}
        <strong>columns</strong>: field config (default / readOnly / disabled / required / invalid /
        label-only / no-label). Size M throughout. Matches Figma properties:{' '}
        <code>selected</code>, <code>indeterminate</code>, <code>readOnly</code>,{' '}
        <code>disabled</code>, <code>label</code>, <code>require</code>, <code>feedback</code>.
      </p>

      <div className={styles.tableWrap}>
        <table
          className={styles.gridTable}
          data-testid="figma-checkboxfield-state-grid"
        >
          <caption className={styles.figmaCaption}>
            <span className={styles.figmaCaptionMark} aria-hidden>❖</span>{' '}
            CheckboxField — checked-state × field-config
          </caption>
          <thead>
            <tr>
              {FIELD_CONFIG_COLS.map((col) => (
                <th key={col.id} scope="col" className={styles.footerLabel} style={{ whiteSpace: 'pre' }}>
                  {col.header}
                </th>
              ))}
              <th scope="col" className={styles.footerCorner} aria-hidden />
            </tr>
          </thead>
          <tbody>
            {CHECKED_STATE_ROWS.map(({ state, label, props: stateProps }) => (
              <tr key={state} data-testrow={`state-${state}`}>
                {FIELD_CONFIG_COLS.map((col) => {
                  const mergedProps: CheckboxFieldProps = {
                    ...stateProps,
                    ...col.extraProps,
                    ...(!col.extraProps.label
                      ? { 'aria-label': `${state} ${col.id}` }
                      : {}),
                  };
                  return (
                    <td key={col.id} className={styles.cell}>
                      <CheckboxField
                        {...mergedProps}
                        data-testid={`figma-checkboxfield-${state}-${col.id}`}
                      />
                    </td>
                  );
                })}
                <th scope="row" className={styles.rowLabelRight}>
                  {label}
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Section 2: Size × checked-state matrix ────────── */}
      <div className={styles.subSection}>
        <p className={styles.metaLine}>
          Figma <code>size</code> (S/M/L = bracket steps 4/5/6) × checked state with{' '}
          <code>label</code> + <code>description</code>.
        </p>
        <div className={styles.tableWrap}>
          <table
            className={styles.gridTable}
            data-testid="figma-checkboxfield-size-grid"
          >
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>❖</span>{' '}
              CheckboxField — size × checked-state
            </caption>
            <thead>
              <tr>
                {CHECKED_STATE_ROWS.map(({ state, label }) => (
                  <th key={state} scope="col" className={styles.footerLabel}>
                    {label}
                  </th>
                ))}
                <th scope="col" className={styles.footerCorner} aria-hidden />
              </tr>
            </thead>
            <tbody>
              {SIZE_ROWS.map(({ size, label }) => (
                <tr key={size} data-testrow={`size-${size}`}>
                  {CHECKED_STATE_ROWS.map(({ state, props: stateProps }) => (
                    <td key={state} className={styles.cell}>
                      <CheckboxField
                        size={size}
                        label="Checkbox"
                        description="Description"
                        {...stateProps}
                        data-testid={`figma-checkboxfield-size-${size}-${state}`}
                      />
                    </td>
                  ))}
                  <th scope="row" className={styles.rowLabelRight}>
                    size: {label}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: feedback variant × checked-state ─────── */}
      <div className={styles.subSection}>
        <p className={styles.metaLine}>
          Figma <code>feedback</code> property — variant rows (negative / informative / positive /
          neutral) × checked state. Size M throughout.
        </p>
        <div className={styles.tableWrap}>
          <table
            className={styles.gridTable}
            data-testid="figma-checkboxfield-feedback-grid"
          >
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>❖</span>{' '}
              CheckboxField — feedback variant × checked-state
            </caption>
            <thead>
              <tr>
                {CHECKED_STATE_ROWS.map(({ state, label }) => (
                  <th key={state} scope="col" className={styles.footerLabel}>
                    {label}
                  </th>
                ))}
                <th scope="col" className={styles.footerCorner} aria-hidden />
              </tr>
            </thead>
            <tbody>
              {FEEDBACK_ROWS.map(({ id, label, feedbackEl }) => (
                <tr key={id} data-testrow={`feedback-${id}`}>
                  {CHECKED_STATE_ROWS.map(({ state, props: stateProps }) => (
                    <td key={state} className={styles.cell}>
                      <CheckboxField
                        label="Checkbox"
                        description="Description"
                        feedback={feedbackEl}
                        {...stateProps}
                        data-testid={`figma-checkboxfield-feedback-${id}-${state}`}
                      />
                    </td>
                  ))}
                  <th scope="row" className={styles.rowLabelRight}>
                    {label}
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: dynamicText row ──────────────────────── */}
      <div className={styles.subSection}>
        <p className={styles.metaLine}>
          Figma <code>dynamicText</code> property — <code>dynamicText</code> string and{' '}
          <code>dynamicTextSlot</code> with <code>InputDynamicText</code>. Validates the footer row
          renders at the correct f-step for each size.
        </p>
        <div className={styles.tableWrap}>
          <table
            className={styles.gridTable}
            data-testid="figma-checkboxfield-dynamic-grid"
          >
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>❖</span>{' '}
              CheckboxField — dynamicText × size
            </caption>
            <thead>
              <tr>
                {SIZE_ROWS.map(({ size, label }) => (
                  <th key={size} scope="col" className={styles.footerLabel}>
                    size: {label}
                  </th>
                ))}
                <th scope="col" className={styles.footerCorner} aria-hidden />
              </tr>
            </thead>
            <tbody>
              <tr data-testrow="dynamic-string">
                {SIZE_ROWS.map(({ size }) => (
                  <td key={size} className={styles.cell}>
                    <CheckboxField
                      size={size}
                      label="Subscribe"
                      dynamicText="Optional"
                      helperButton="Learn more"
                      data-testid={`figma-checkboxfield-dynamic-string-${size}`}
                    />
                  </td>
                ))}
                <th scope="row" className={styles.rowLabelRight}>
                  dynamicText + helperButton
                </th>
              </tr>
              <tr data-testrow="dynamic-slot">
                {SIZE_ROWS.map(({ size }) => (
                  <td key={size} className={styles.cell}>
                    <CheckboxField
                      size={size}
                      label="Nickname"
                      dynamicTextSlot={<InputDynamicText content="0 / 32" end="Generate" />}
                      data-testid={`figma-checkboxfield-dynamic-slot-${size}`}
                    />
                  </td>
                ))}
                <th scope="row" className={styles.rowLabelRight}>
                  dynamicTextSlot
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Multi-option (Figma content=true) ─────── */}
      <div className={styles.subSection}>
        <p className={styles.metaLine}>
          Figma <code>content</code> property (Figma-only) — controls whether the nested option list
          is rendered. In code this is the presence of <code>children</code>. Validates multi-option
          mode: header, fieldset/legend, options list, and footer rows.
        </p>
        <div className={styles.tableWrap}>
          <table
            className={styles.gridTable}
            data-testid="figma-checkboxfield-multi-grid"
          >
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>❖</span>{' '}
              CheckboxField — multi-option (content: true) × state
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.footerLabel}>Default</th>
                <th scope="col" className={styles.footerLabel}>disabled</th>
                <th scope="col" className={styles.footerLabel}>invalid + error</th>
                <th scope="col" className={styles.footerLabel}>with feedback</th>
                <th scope="col" className={styles.footerCorner} aria-hidden />
              </tr>
            </thead>
            <tbody>
              <tr data-testrow="multi-configs">
                <td className={styles.cell}>
                  <CheckboxField
                    label="Notifications"
                    description="Select all that apply."
                    name="figma-multi-default"
                    groupDefaultValue={['news']}
                    data-testid="figma-checkboxfield-multi-default"
                  >
                    <Checkbox value="news" label="Product news" />
                    <Checkbox value="tips" label="Tips &amp; tutorials" />
                    <Checkbox value="research" label="Research invites" />
                  </CheckboxField>
                </td>
                <td className={styles.cell}>
                  <CheckboxField
                    label="Notifications"
                    description="All options disabled."
                    name="figma-multi-disabled"
                    disabled
                    data-testid="figma-checkboxfield-multi-disabled"
                  >
                    <Checkbox value="news" label="Product news" />
                    <Checkbox value="tips" label="Tips &amp; tutorials" />
                  </CheckboxField>
                </td>
                <td className={styles.cell}>
                  <CheckboxField
                    label="Notifications"
                    name="figma-multi-invalid"
                    invalid
                    error="Select at least one option."
                    data-testid="figma-checkboxfield-multi-invalid"
                  >
                    <Checkbox value="news" label="Product news" />
                    <Checkbox value="tips" label="Tips &amp; tutorials" />
                  </CheckboxField>
                </td>
                <td className={styles.cell}>
                  <CheckboxField
                    label="Delivery options"
                    name="figma-multi-feedback"
                    groupDefaultValue={['standard']}
                    feedback={
                      <InputFeedback variant="informative" attention="low">
                        Changing options may reset your delivery window.
                      </InputFeedback>
                    }
                    data-testid="figma-checkboxfield-multi-feedback"
                  >
                    <Checkbox value="standard" label="Standard" />
                    <Checkbox value="express" label="Express" />
                  </CheckboxField>
                </td>
                <th scope="row" className={styles.rowLabelRight}>
                  content: true
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
