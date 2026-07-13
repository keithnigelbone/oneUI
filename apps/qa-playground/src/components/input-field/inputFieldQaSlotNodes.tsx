'use client';

import { Field } from '@base-ui/react/field';
import { Icon } from '@oneui/ui/components/Icon';
import { InputDynamicText, InputFeedback } from '@oneui/ui/components/Input';

/** Leading icon — `start` slot */
export const QA_INPUT_START_ICON = <Icon icon="search" size="4" aria-hidden />;

/** Trailing icon — `end` slot */
export const QA_INPUT_END_ICON = <Icon icon="close" size="4" aria-hidden />;

/** Prefix text — `start2` slot */
export const QA_INPUT_START2_PREFIX = <span>$</span>;

/** Suffix text — `end2` slot */
export const QA_INPUT_END2_SUFFIX = <span>kg</span>;

export const QA_FEEDBACK_SLOT = (
  <InputFeedback variant="informative" attention="low" feedback_message="Custom feedback slot message." />
);

export const QA_DYNAMIC_TEXT_SLOT = (
  <InputDynamicText size="m" content="Dynamic text via slot" end="Helper Button" />
);

export const QA_LABEL_SLOT = (
  <>
    <Field.Label>Custom label (labelSlot)</Field.Label>
    <Field.Description>Description supplied through labelSlot.</Field.Description>
  </>
);
