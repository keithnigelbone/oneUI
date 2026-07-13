'use client';

import { useMemo, useState } from 'react';
import { InputFeedback } from '@oneui/ui/components/Input';
import type {
  InputFeedbackAttention,
  InputFeedbackSize,
  InputFeedbackVariant,
} from '@oneui/ui/components/Input';
import { Input } from '@oneui/ui/components/Input';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { SelectableButton } from '@oneui/ui/components/SelectableButton';
import type { SemanticIconName } from '@oneui/shared';
import panelStyles from './input-feedback-qa.module.css';
import styles from '../../styles/qa.module.css';

const SIZE_OPTIONS: { figma: 'S' | 'M' | 'L'; size: InputFeedbackSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

const ATTENTION_OPTIONS: InputFeedbackAttention[] = ['low', 'medium', 'high'];

const VARIANT_OPTIONS: InputFeedbackVariant[] = ['negative', 'positive', 'warning', 'informative'];

const VARIANT_APPEARANCE: Record<InputFeedbackVariant, 'negative' | 'positive' | 'warning' | 'informative'> = {
  negative: 'negative',
  positive: 'positive',
  warning: 'warning',
  informative: 'informative',
};

const CUSTOM_ICON_NAME: SemanticIconName = 'help';

/**
 * Live playground controls — all four Figma API props on one preview mount.
 */
export function InputFeedbackControlsPanel() {
  const [size, setSize] = useState<InputFeedbackSize>('m');
  const [attention, setAttention] = useState<InputFeedbackAttention>('low');
  const [variant, setVariant] = useState<InputFeedbackVariant>('negative');
  const [message, setMessage] = useState('Type your message...');
  const [showCustomIcon, setShowCustomIcon] = useState(false);

  const feedbackMessage = message.trim() || 'Type your message...';

  const liveProps = useMemo(
    () => ({
      size,
      attention,
      variant,
      feedback_message: feedbackMessage,
      ...(showCustomIcon ? { customIcon: CUSTOM_ICON_NAME } : {}),
    }),
    [size, attention, variant, feedbackMessage, showCustomIcon],
  );

  return (
    <div className={panelStyles.controlsPanel} data-testid="input-feedback-controls-panel">
      <div className={panelStyles.controlRow}>
        <span className={panelStyles.controlLabel} id="ifb-ctrl-size-label">
          size
        </span>
        <div className={panelStyles.segmentRow} role="group" aria-labelledby="ifb-ctrl-size-label">
          {SIZE_OPTIONS.map(({ figma, size: sizeValue }) => (
            <SelectableButton
              key={figma}
              size="s"
              selected={size === sizeValue}
              onSelectedChange={(sel) => {
                if (sel) setSize(sizeValue);
              }}
              data-testid={`input-feedback-ctrl-size-${figma}`}
            >
              {figma}
            </SelectableButton>
          ))}
        </div>
      </div>

      <div className={panelStyles.controlRow}>
        <span className={panelStyles.controlLabel} id="ifb-ctrl-attention-label">
          attention
        </span>
        <div className={panelStyles.segmentRow} role="group" aria-labelledby="ifb-ctrl-attention-label">
          {ATTENTION_OPTIONS.map((value) => (
            <SelectableButton
              key={value}
              size="s"
              selected={attention === value}
              onSelectedChange={(sel) => {
                if (sel) setAttention(value);
              }}
              data-testid={`input-feedback-ctrl-attention-${value}`}
            >
              {value}
            </SelectableButton>
          ))}
        </div>
      </div>

      <div className={panelStyles.controlRow}>
        <span className={panelStyles.controlLabel} id="ifb-ctrl-variant-label">
          variant
        </span>
        <div className={panelStyles.variantRow} role="group" aria-labelledby="ifb-ctrl-variant-label">
          {VARIANT_OPTIONS.map((value) => (
            <SelectableButton
              key={value}
              size="s"
              appearance={VARIANT_APPEARANCE[value]}
              selected={variant === value}
              onSelectedChange={(sel) => {
                if (sel) setVariant(value);
              }}
              data-testid={`input-feedback-ctrl-variant-${value}`}
            >
              {value}
            </SelectableButton>
          ))}
        </div>
      </div>

      <div className={panelStyles.controlRow}>
        <label className={panelStyles.controlLabel} htmlFor="ifb-ctrl-message">
          feedbackMessage
        </label>
        <Input
          id="ifb-ctrl-message"
          size="m"
          value={message}
          onChange={(value) => setMessage(value)}
          placeholder="Type your message..."
          data-testid="input-feedback-ctrl-message"
          aria-label="Feedback message text"
        />
      </div>

      <div className={panelStyles.checkboxRow}>
        <Checkbox
          checked={showCustomIcon}
          onCheckedChange={setShowCustomIcon}
          label={`customIcon (${CUSTOM_ICON_NAME})`}
          data-testid="input-feedback-ctrl-custom-icon"
        />
      </div>

      <div className={panelStyles.previewShell}>
        <div className={styles.inputFeedbackPreviewFrame} data-testid="input-feedback-controls-live">
          <InputFeedback {...liveProps} />
        </div>
      </div>
    </div>
  );
}
