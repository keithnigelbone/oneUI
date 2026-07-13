'use client';

import React, { useState, type CSSProperties } from 'react';
import { CheckboxField } from '@oneui/ui/components/CheckboxField';
import type { CheckboxFieldProps } from '@oneui/ui/components/CheckboxField';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import type { CheckboxAppearance } from '@oneui/ui/components/Checkbox';
import { InputFeedback, InputDynamicText } from '@oneui/ui/components/Input';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Tooltip } from '@oneui/ui/components/Tooltip';
import { Surface } from '@oneui/ui/components/Surface';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const rowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

const FIGMA_SIZES: { figma: string; size: CheckboxFieldProps['size'] }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

const FIGMA_APPEARANCE = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly CheckboxAppearance[];

type ComboRow = { caption: string; props: CheckboxFieldProps };

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: 'S · neutral · label only',
    props: { size: 's', appearance: 'neutral', label: 'Small field' },
  },
  {
    caption: 'M · primary · checked + description',
    props: { size: 'm', appearance: 'primary', checked: true, label: 'Primary checked', description: 'Description text' },
  },
  {
    caption: 'L · secondary · indeterminate',
    props: { size: 'l', appearance: 'secondary', indeterminate: true, label: 'Large indeterminate' },
  },
  {
    caption: 'M · primary · required + asterisk',
    props: { size: 'm', appearance: 'primary', required: true, label: 'Required field' },
  },
  {
    caption: 'M · negative · invalid + error string',
    props: {
      size: 'm',
      appearance: 'negative',
      invalid: true,
      label: 'Accept terms',
      error: 'You must accept to continue.',
    },
  },
  {
    caption: 'M · neutral · disabled checked',
    props: {
      size: 'm',
      appearance: 'neutral',
      disabled: true,
      defaultChecked: true,
      label: 'Unavailable option',
    },
  },
  {
    caption: 'M · informative · readOnly checked',
    props: {
      size: 'm',
      appearance: 'informative',
      readOnly: true,
      checked: true,
      label: 'Read-only checked',
    },
  },
  {
    caption: 'M · positive · with dynamicText + helperButton',
    props: {
      size: 'm',
      appearance: 'positive',
      label: 'Subscribe',
      dynamicText: 'Optional',
      helperButton: 'Learn more',
    },
  },
];

/** Controlled toggle for real-world interaction testing. */
function ControlledSingleField() {
  const [checked, setChecked] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
      <CheckboxField
        label="Email me about product updates"
        checked={checked}
        onCheckedChange={setChecked}
        data-testid="checkboxfield-controlled-single"
        description="We never sell your address."
      />
      <span
        className={styles.scenarioCellCaption}
        data-testid="checkboxfield-controlled-single-state"
      >
        checked: {String(checked)}
      </span>
    </div>
  );
}

/** Controlled multi-option group for real-world interaction testing. */
function ControlledMultiField() {
  const [values, setValues] = useState<string[]>(['news']);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
      <CheckboxField
        label="Notification preferences"
        description="Select all that apply."
        name="notifications-controlled"
        groupValue={values}
        onGroupValueChange={setValues}
        data-testid="checkboxfield-controlled-multi"
      >
        <Checkbox value="news" label="Product news" data-testid="checkboxfield-option-news" />
        <Checkbox value="tips" label="Tips and tutorials" data-testid="checkboxfield-option-tips" />
        <Checkbox value="research" label="Research invites" data-testid="checkboxfield-option-research" />
      </CheckboxField>
      <span
        className={styles.scenarioCellCaption}
        data-testid="checkboxfield-controlled-multi-state"
      >
        selected: [{values.join(', ')}]
      </span>
    </div>
  );
}

/**
 * CheckboxField QA showcase — API sections, real-world usage, edge cases, interaction validations,
 * accessibility checks, and combination matrix.
 */
export function CheckboxFieldQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">

      {/* ── Default ───────────────────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-default" title="Default" centerContent>
        <CheckboxField
          label="Accept terms and conditions"
          size="m"
          data-testid="checkboxfield-default"
        />
      </QaStoryBand>

      {/* ── 1 Size ───────────────────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-size" title="1 Size (S · M · L)" overflow>
        <p className={styles.storySectionLead}>
          Figma sizes <strong>S/M/L</strong> — code uses lowercase <code>size</code> prop (
          <code>s</code>, <code>m</code>, <code>l</code>). Also scales the attached{' '}
          <code>InputFeedback</code> and <code>InputDynamicText</code> rows.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            {FIGMA_SIZES.map(({ figma, size }) => (
              <div key={figma} className={styles.scenarioLabeledCell}>
                <CheckboxField
                  size={size}
                  label={`Size ${figma}`}
                  description="Description text"
                  feedback={<InputFeedback attention="low">Feedback scales with size.</InputFeedback>}
                  data-testid={`checkboxfield-size-${figma.toLowerCase()}`}
                />
                <span className={styles.scenarioCellCaption}>{`size: ${figma}`}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 2 Appearance ─────────────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-appearance" title="2 Appearance" overflow>
        <p className={styles.storySectionLead}>
          All Figma appearance values plus <code>auto</code>. Each row: unchecked, checked,
          indeterminate.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={rowLabelStyle}>{appearance}</span>
                <CheckboxField
                  appearance={appearance}
                  label="Label"
                  aria-label={`${appearance} unchecked`}
                  data-testid={`checkboxfield-appearance-${appearance}-off`}
                />
                <CheckboxField
                  appearance={appearance}
                  checked
                  label="Label"
                  aria-label={`${appearance} checked`}
                  data-testid={`checkboxfield-appearance-${appearance}-on`}
                />
                <CheckboxField
                  appearance={appearance}
                  indeterminate
                  label="Label"
                  aria-label={`${appearance} indeterminate`}
                  data-testid={`checkboxfield-appearance-${appearance}-ind`}
                />
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 3 Checked / Indeterminate ────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-checked" title="3 Checked · Indeterminate" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>selected</code> maps to <code>checked</code> prop; <code>indeterminate</code>{' '}
          is a separate boolean. Indeterminate takes visual precedence over <code>checked</code>.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" checked={false} data-testid="checkboxfield-checked-false" />
              <span className={styles.scenarioCellCaption}>checked: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" checked data-testid="checkboxfield-checked-true" />
              <span className={styles.scenarioCellCaption}>checked: true</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" indeterminate data-testid="checkboxfield-indeterminate-true" />
              <span className={styles.scenarioCellCaption}>indeterminate: true</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" indeterminate={false} data-testid="checkboxfield-indeterminate-false" />
              <span className={styles.scenarioCellCaption}>indeterminate: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Label"
                checked
                indeterminate
                data-testid="checkboxfield-checked-and-indeterminate"
              />
              <span className={styles.scenarioCellCaption}>checked + indeterminate (ind wins)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 4 readOnly ───────────────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-readonly" title="4 readOnly" overflow>
        <p className={styles.storySectionLead}>
          Figma plugin-level property; code <code>readOnly</code> prevents state changes while
          keeping the field visible and interactive for scrolling/tab focus.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" readOnly={false} data-testid="checkboxfield-readonly-false" />
              <span className={styles.scenarioCellCaption}>readOnly: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" readOnly checked={false} data-testid="checkboxfield-readonly-true-off" />
              <span className={styles.scenarioCellCaption}>readOnly · unchecked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" readOnly checked data-testid="checkboxfield-readonly-true-on" />
              <span className={styles.scenarioCellCaption}>readOnly · checked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" readOnly indeterminate data-testid="checkboxfield-readonly-true-ind" />
              <span className={styles.scenarioCellCaption}>readOnly · indeterminate</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 5 disabled ───────────────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-disabled" title="5 disabled" overflow>
        <p className={styles.storySectionLead}>
          Figma plugin property. Code uses Base UI <code>aria-disabled</code> pattern; the field
          chrome (label, description, feedback rows) also dims.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" description="Description" disabled={false} data-testid="checkboxfield-disabled-false" />
              <span className={styles.scenarioCellCaption}>disabled: false</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" description="Description" disabled checked={false} data-testid="checkboxfield-disabled-true-off" />
              <span className={styles.scenarioCellCaption}>disabled · unchecked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" description="Description" disabled checked data-testid="checkboxfield-disabled-true-on" />
              <span className={styles.scenarioCellCaption}>disabled · checked</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label" description="Description" disabled indeterminate data-testid="checkboxfield-disabled-true-ind" />
              <span className={styles.scenarioCellCaption}>disabled · indeterminate</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 6 Label · description · required · infoIconSlot ─ */}
      <QaStoryBand id="checkboxfield-qa-label" title="6 Label · description · required · infoIconSlot" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>label</code>, <code>labelText</code>, <code>description</code>,{' '}
          <code>descriptionText</code>, <code>require</code>, and <code>infoIcon</code> properties
          map directly to <code>label</code>, <code>description</code>, <code>required</code>, and{' '}
          <code>infoIconSlot</code> props.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Label only" data-testid="checkboxfield-label-only" />
              <span className={styles.scenarioCellCaption}>label only</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Label"
                description="Supporting description text"
                data-testid="checkboxfield-label-and-description"
              />
              <span className={styles.scenarioCellCaption}>label + description</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField label="Required field" required data-testid="checkboxfield-required" />
              <span className={styles.scenarioCellCaption}>required · asterisk visible</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Share crash reports"
                description="Anonymised, never includes message content."
                required
                infoIconSlot={
                  <Tooltip content="Reports are anonymised and never include message content." trigger="hover">
                    <IconButton
                      style={{ '--_ib-size': 'var(--_ib-icon-size)' } as React.CSSProperties}
                      icon="info"
                      aria-label="More about crash reports"
                      size="m"
                      appearance="neutral"
                      attention="low"
                      condensed
                    />
                  </Tooltip>
                }
                data-testid="checkboxfield-info-icon"
              />
              <span className={styles.scenarioCellCaption}>label + desc + required + infoIcon</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField data-testid="checkboxfield-no-label" aria-label="No label prop" />
              <span className={styles.scenarioCellCaption}>no label (aria-label only)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 7 Feedback · error · invalid ─────────────────── */}
      <QaStoryBand id="checkboxfield-qa-feedback" title="7 Feedback · error · invalid" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>feedback</code> property. <code>error</code> string renders a negative{' '}
          <code>InputFeedback</code>; <code>invalid</code> also sets error highlight on the control.{' '}
          Custom <code>feedback</code> slot accepts any <code>InputFeedback</code> variant.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Accept terms"
                error="You must accept to continue."
                data-testid="checkboxfield-error-string"
              />
              <span className={styles.scenarioCellCaption}>error string → negative feedback</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Accept terms"
                invalid
                error="Please complete verification."
                data-testid="checkboxfield-invalid-with-error"
              />
              <span className={styles.scenarioCellCaption}>invalid + error (error highlight)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Accept terms"
                invalid
                data-testid="checkboxfield-invalid-no-message"
              />
              <span className={styles.scenarioCellCaption}>invalid · no message (fieldErrorSlot)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Send diagnostics"
                feedback={
                  <InputFeedback variant="informative" attention="low">
                    Preferences sync across your devices.
                  </InputFeedback>
                }
                data-testid="checkboxfield-feedback-informative"
              />
              <span className={styles.scenarioCellCaption}>feedback: informative slot</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Send diagnostics"
                feedback={
                  <InputFeedback variant="positive" attention="low">
                    Saved successfully.
                  </InputFeedback>
                }
                data-testid="checkboxfield-feedback-positive"
              />
              <span className={styles.scenarioCellCaption}>feedback: positive slot</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Send diagnostics"
                feedback={<InputFeedback attention="low">Neutral helper text.</InputFeedback>}
                data-testid="checkboxfield-feedback-neutral"
              />
              <span className={styles.scenarioCellCaption}>feedback: neutral (no variant)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 8 dynamicText · helperButton · dynamicTextSlot ── */}
      <QaStoryBand id="checkboxfield-qa-dynamic-text" title="8 dynamicText · helperButton · dynamicTextSlot" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>dynamicText</code> property. <code>dynamicText</code> string shows leading
          copy; <code>helperButton</code> adds a trailing action. <code>dynamicTextSlot</code> accepts
          a full <code>InputDynamicText</code> element (takes precedence over string props).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Nickname"
                dynamicText="0 / 32"
                data-testid="checkboxfield-dynamic-text-only"
              />
              <span className={styles.scenarioCellCaption}>dynamicText string</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Subscribe"
                dynamicText="Optional"
                helperButton="Learn more"
                data-testid="checkboxfield-dynamic-text-with-button"
              />
              <span className={styles.scenarioCellCaption}>dynamicText + helperButton</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Nickname"
                dynamicTextSlot={<InputDynamicText content="0 / 32" end="Generate" />}
                data-testid="checkboxfield-dynamic-text-slot"
              />
              <span className={styles.scenarioCellCaption}>dynamicTextSlot (slot wins)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 9 Multi-option (children) mode ───────────────── */}
      <QaStoryBand id="checkboxfield-qa-multi" title="9 Multi-option (children) mode" overflow>
        <p className={styles.storySectionLead}>
          Passing <code>children</code> activates the <code>CheckboxGroup</code> branch —{' '}
          <code>label</code> / <code>description</code> render as a <code>fieldset</code> header;
          options use <code>labelAssociation=&quot;native&quot;</code>. <code>groupValue</code> /
          <code>groupDefaultValue</code> / <code>onGroupValueChange</code> control selection.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Notifications"
                description="Select all that apply."
                name="qa-multi-default"
                groupDefaultValue={['news']}
                data-testid="checkboxfield-multi-default"
              >
                <Checkbox value="news" label="Product news" data-testid="checkboxfield-multi-news" />
                <Checkbox value="tips" label="Tips and tutorials" data-testid="checkboxfield-multi-tips" />
                <Checkbox value="research" label="Research invites" data-testid="checkboxfield-multi-research" />
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>multi-option + defaultValue</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Topics"
                description="Fragment children are flattened."
                name="qa-multi-fragment"
                data-testid="checkboxfield-multi-fragment"
              >
                <>
                  <Checkbox value="a" label="Alpha" data-testid="checkboxfield-multi-frag-a" />
                  <Checkbox value="b" label="Beta" data-testid="checkboxfield-multi-frag-b" />
                  <Checkbox value="c" label="Gamma" data-testid="checkboxfield-multi-frag-c" />
                </>
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>Fragment children (flattened)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Delivery options"
                name="qa-multi-feedback"
                groupDefaultValue={['standard']}
                feedback={
                  <InputFeedback variant="informative" attention="low">
                    Changing options may reset your delivery window.
                  </InputFeedback>
                }
                data-testid="checkboxfield-multi-feedback"
              >
                <Checkbox value="standard" label="Standard" data-testid="checkboxfield-multi-standard" />
                <Checkbox value="express" label="Express" data-testid="checkboxfield-multi-express" />
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>multi + feedback slot</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Restricted options"
                name="qa-multi-disabled"
                disabled
                data-testid="checkboxfield-multi-disabled"
              >
                <Checkbox value="opt1" label="Option A" />
                <Checkbox value="opt2" label="Option B" />
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>multi + disabled (field-level)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Restricted options"
                name="qa-multi-invalid"
                invalid
                error="Select at least one option."
                data-testid="checkboxfield-multi-invalid"
              >
                <Checkbox value="opt1" label="Option A" />
                <Checkbox value="opt2" label="Option B" />
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>multi + invalid + error</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 10 fullWidth ─────────────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-fullwidth" title="10 fullWidth" overflow>
        <p className={styles.storySectionLead}>
          <code>fullWidth</code> stretches the field to fill its container.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', maxWidth: '480px', width: '100%' }}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Full width single field"
                description="Stretches to fill container."
                fullWidth
                feedback={<InputFeedback attention="low">Helper text.</InputFeedback>}
                data-testid="checkboxfield-fullwidth-single"
              />
              <span className={styles.scenarioCellCaption}>fullWidth: true (single)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Full width multi-option"
                name="qa-fullwidth-multi"
                fullWidth
                data-testid="checkboxfield-fullwidth-multi"
              >
                <Checkbox value="a" label="Option A" />
                <Checkbox value="b" label="Option B" />
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>fullWidth: true (multi)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 11 Real-world usage scenarios ────────────────── */}
      <QaStoryBand id="checkboxfield-qa-realworld" title="11 Real-world usage scenarios" overflow>
        <p className={styles.storySectionLead}>
          Realistic compositions: consent form, settings panel, filter group, and a "select all"
          gateway. All controlled.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <ControlledSingleField />
              <span className={styles.scenarioCellCaption}>Controlled single (toggle)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <ControlledMultiField />
              <span className={styles.scenarioCellCaption}>Controlled multi-option group</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Privacy &amp; data"
                description="Review our privacy policy before enabling."
                required
                checked={false}
                infoIconSlot={
                  <Tooltip content="Your data is encrypted and never shared." trigger="hover">
                    <IconButton
                      style={{ '--_ib-size': 'var(--_ib-icon-size)' } as React.CSSProperties}
                      icon="info"
                      aria-label="Privacy information"
                      size="m"
                      appearance="neutral"
                      attention="low"
                      condensed
                    />
                  </Tooltip>
                }
                error="You must accept the privacy policy to proceed."
                data-testid="checkboxfield-realworld-consent"
              />
              <span className={styles.scenarioCellCaption}>Consent + required + info + error</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 12 Edge cases ────────────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-edge-cases" title="12 Edge cases" overflow>
        <p className={styles.storySectionLead}>
          Boundary conditions: whitespace-only label/description stripped, dynamicText empty string
          suppressed, feedback + dynamicText coexist, children with no string header.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="  "
                data-testid="checkboxfield-edge-whitespace-label"
                aria-label="Whitespace label field"
              />
              <span className={styles.scenarioCellCaption}>whitespace label (stripped → no header)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Valid label"
                description="  "
                data-testid="checkboxfield-edge-whitespace-description"
              />
              <span className={styles.scenarioCellCaption}>whitespace description (stripped)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Mixed footer"
                feedback={<InputFeedback attention="low">Helper text.</InputFeedback>}
                dynamicText="0 / 32"
                data-testid="checkboxfield-edge-feedback-and-dynamic"
              />
              <span className={styles.scenarioCellCaption}>feedback + dynamicText coexist</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Empty dynamic"
                dynamicText=""
                helperButton=""
                data-testid="checkboxfield-edge-empty-dynamic"
              />
              <span className={styles.scenarioCellCaption}>dynamicText="" → no row rendered</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                name="qa-edge-no-header"
                data-testid="checkboxfield-edge-no-header-multi"
              >
                <Checkbox value="x" label="X" />
                <Checkbox value="y" label="Y" />
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>multi mode · no label header</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Long label that wraps to test layout resilience in narrow containers"
                description="A long description that also wraps to verify the layout does not break."
                data-testid="checkboxfield-edge-long-text"
                style={{ maxWidth: '200px' }}
              />
              <span className={styles.scenarioCellCaption}>long label + description (narrow)</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 13 Surface context ───────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-surface" title="13 Surface context" overflow>
        <p className={styles.storySectionLead}>
          Token remapping inside <code>[data-surface]</code> containers — tokens adapt without any
          JavaScript logic. Test on both <code>bold</code> and <code>subtle</code> surfaces.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <Surface
                mode="bold"
                style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-3)' }}
                data-testid="checkboxfield-surface-bold"
              >
                <CheckboxField
                  appearance="neutral"
                  label="Enable backup"
                  description="Stored encrypted."
                  feedback={<InputFeedback attention="low">Helps us improve reliability.</InputFeedback>}
                  data-testid="checkboxfield-on-bold-surface"
                />
              </Surface>
              <span className={styles.scenarioCellCaption}>on bold surface</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Surface
                mode="subtle"
                style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-3)' }}
                data-testid="checkboxfield-surface-subtle"
              >
                <CheckboxField
                  appearance="neutral"
                  label="Share usage data"
                  description="Anonymised analytics."
                  data-testid="checkboxfield-on-subtle-surface"
                />
              </Surface>
              <span className={styles.scenarioCellCaption}>on subtle surface</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <Surface
                mode="moderate"
                style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-3)' }}
                data-testid="checkboxfield-surface-moderate"
              >
                <CheckboxField
                  appearance="neutral"
                  checked
                  label="Opted in"
                  feedback={
                    <InputFeedback variant="positive" attention="low">Preference saved.</InputFeedback>
                  }
                  data-testid="checkboxfield-on-moderate-surface"
                />
              </Surface>
              <span className={styles.scenarioCellCaption}>on moderate surface · checked</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 14 Accessibility validation ──────────────────── */}
      <QaStoryBand id="checkboxfield-qa-a11y" title="14 Accessibility validation" overflow>
        <p className={styles.storySectionLead}>
          WCAG 2.1 AA requirements: labelled control, <code>aria-required</code>, error associated
          via <code>aria-describedby</code>, fieldset/legend for group, focus ring visible,{' '}
          <code>aria-disabled</code> not <code>disabled</code> (Base UI pattern).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Labelled control"
                data-testid="checkboxfield-a11y-labelled"
              />
              <span className={styles.scenarioCellCaption}>label → association (click-to-focus)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Required consent"
                required
                data-testid="checkboxfield-a11y-required"
              />
              <span className={styles.scenarioCellCaption}>required → aria-required="true"</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Verify identity"
                invalid
                error="Please complete verification."
                data-testid="checkboxfield-a11y-error-described"
              />
              <span className={styles.scenarioCellCaption}>error → aria-describedby (invalid)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Group header"
                description="Select all that apply."
                name="qa-a11y-group"
                data-testid="checkboxfield-a11y-group"
              >
                <Checkbox value="a" label="Alpha" data-testid="checkboxfield-a11y-opt-a" />
                <Checkbox value="b" label="Beta" data-testid="checkboxfield-a11y-opt-b" />
              </CheckboxField>
              <span className={styles.scenarioCellCaption}>fieldset/legend + aria-describedby</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Disabled control"
                disabled
                data-testid="checkboxfield-a11y-disabled"
              />
              <span className={styles.scenarioCellCaption}>disabled → aria-disabled (Base UI)</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <CheckboxField
                label="Read-only control"
                readOnly
                checked
                data-testid="checkboxfield-a11y-readonly"
              />
              <span className={styles.scenarioCellCaption}>readOnly → no state change on click</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      {/* ── 15 Combination matrix ────────────────────────── */}
      <QaStoryBand id="checkboxfield-qa-combos" title="15 Combination matrix" overflow>
        <QaApiSectionBody>
          <div className={styles.scenarioComboGrid}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={row.caption} className={styles.scenarioLabeledCell}>
                <CheckboxField {...row.props} data-testid={`checkboxfield-combo-${index}`} />
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

    </QaShowcaseRoot>
  );
}
