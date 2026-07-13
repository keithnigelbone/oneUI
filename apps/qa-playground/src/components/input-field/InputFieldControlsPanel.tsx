'use client';

import { useMemo, useState } from 'react';
import { InputField } from '@oneui/ui/components/InputField';
import { Input } from '@oneui/ui/components/Input';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import panelStyles from './input-field-qa.module.css';
import styles from '../../styles/qa.module.css';
import {
  buildInputFieldQaProps,
  type InputFieldSizeFigma,
} from './inputFieldQaScenarios';

const SIZE_OPTIONS: { figma: InputFieldSizeFigma; code: 8 | 10 | 12 }[] = [
  { figma: 'S', code: 8 },
  { figma: 'M', code: 10 },
  { figma: 'L', code: 12 },
];

/**
 * Live playground controls — all eight Figma-style boolean axes + size on one preview mount.
 */
export function InputFieldControlsPanel() {
  const [size, setSize] = useState<InputFieldSizeFigma>('M');
  const [showLabel, setShowLabel] = useState(true);
  const [required, setRequired] = useState(false);
  const [infoIcon, setInfoIcon] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDynamicText, setShowDynamicText] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [labelText, setLabelText] = useState('Field label');
  const [inputValue, setInputValue] = useState('');

  const liveProps = useMemo(
    () =>
      buildInputFieldQaProps(
        {
          size,
          label: showLabel,
          required,
          infoIcon,
          description: showDescription,
          feedback: showFeedback,
          dynamicText: showDynamicText,
          disabled,
        },
        {
          label: showLabel ? labelText.trim() || 'Field label' : undefined,
          value: inputValue,
          onChange: setInputValue,
          placeholder: 'Enter text',
        },
      ),
    [
      size,
      showLabel,
      required,
      infoIcon,
      showDescription,
      showFeedback,
      showDynamicText,
      disabled,
      labelText,
      inputValue,
    ],
  );

  return (
    <div className={panelStyles.controlsPanel} data-testid="input-field-controls-panel">
      <div className={panelStyles.controlRow}>
        <span className={panelStyles.controlLabel} id="iff-ctrl-size-label">
          size
        </span>
        <div className={panelStyles.segmentRow} role="group" aria-labelledby="iff-ctrl-size-label">
          {SIZE_OPTIONS.map(({ figma }) => (
            <SelectableButton
              key={figma}
              size="s"
              selected={size === figma}
              onSelectedChange={(sel) => {
                if (sel) setSize(figma);
              }}
              data-testid={`input-field-ctrl-size-${figma}`}
            >
              {figma}
            </SelectableButton>
          ))}
        </div>
      </div>

      <div className={panelStyles.checkboxGrid}>
        <Checkbox
          checked={showLabel}
          onCheckedChange={setShowLabel}
          data-testid="input-field-ctrl-label"
        >
          label
        </Checkbox>
        <Checkbox
          checked={required}
          onCheckedChange={setRequired}
          data-testid="input-field-ctrl-required"
        >
          required
        </Checkbox>
        <Checkbox
          checked={infoIcon}
          onCheckedChange={setInfoIcon}
          data-testid="input-field-ctrl-info-icon"
        >
          infoIcon
        </Checkbox>
        <Checkbox
          checked={showDescription}
          onCheckedChange={setShowDescription}
          data-testid="input-field-ctrl-description"
        >
          description
        </Checkbox>
        <Checkbox
          checked={showFeedback}
          onCheckedChange={setShowFeedback}
          data-testid="input-field-ctrl-feedback"
        >
          feedback (error)
        </Checkbox>
        <Checkbox
          checked={showDynamicText}
          onCheckedChange={setShowDynamicText}
          data-testid="input-field-ctrl-dynamic-text"
        >
          dynamicText
        </Checkbox>
        <Checkbox
          checked={disabled}
          onCheckedChange={setDisabled}
          data-testid="input-field-ctrl-disabled"
        >
          disabled
        </Checkbox>
      </div>

      {showLabel ? (
        <div className={panelStyles.controlRow}>
          <label className={panelStyles.controlLabel} htmlFor="iff-ctrl-label-text">
            label text
          </label>
          <Input
            id="iff-ctrl-label-text"
            size="m"
            value={labelText}
            onChange={setLabelText}
            placeholder="Field label"
            data-testid="input-field-ctrl-label-text"
            aria-label="Label text"
          />
        </div>
      ) : null}

      <div className={panelStyles.previewShell}>
        <div className={styles.inputFieldPreviewFrame} data-testid="input-field-controls-live">
          <InputField {...liveProps} />
        </div>
      </div>
    </div>
  );
}
