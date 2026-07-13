/**
 * RadioField.showcase.tsx
 *
 * Shared sections for Storybook and platform docs. Token-only inline styles.
 */

import React from 'react';
import { RadioField } from './RadioField';
import { Radio } from '../Radio/Radio';
import { InputFeedback } from '../Input';
import { Surface } from '../Surface';

const section: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
  width: '100%',
};

const caption: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Low)',
  color: 'var(--Text-Low)',
};

export function RadioFieldDefault() {
  return (
    <div style={section}>
      <p style={caption}>
        Same contract as InputField / CheckboxField: feedback / error below the options.
      </p>
      <RadioField
        label="Delivery speed"
        description="Applies to this order only."
        name="radio-field-default"
        defaultValue="std"
        feedback={
          <InputFeedback variant="informative" attention="low">
            Standard is free for members.
          </InputFeedback>
        }
      >
        <Radio value="std">Standard</Radio>
        <Radio value="exp">Express</Radio>
      </RadioField>
    </div>
  );
}

export function RadioFieldSizes() {
  return (
    <div style={{ ...section, gap: 'var(--Spacing-5)' }}>
      {(['s', 'm', 'l'] as const).map((sz) => (
        <RadioField
          key={sz}
          size={sz}
          label={`Size ${sz.toUpperCase()}`}
          name={`radio-field-sizes-${sz}`}
          defaultValue="a"
          feedback={<InputFeedback attention="low">Feedback scales with field size.</InputFeedback>}
        >
          <Radio value="a">Option A</Radio>
          <Radio value="b">Option B</Radio>
        </RadioField>
      ))}
    </div>
  );
}

export function RadioFieldStates() {
  return (
    <div style={{ ...section, gap: 'var(--Spacing-5)' }}>
      <RadioField label="Default" name="rf-st-default" defaultValue="x">
        <Radio value="x">Choice one</Radio>
        <Radio value="y">Choice two</Radio>
      </RadioField>
      <RadioField label="Disabled group" name="rf-st-dis" defaultValue="a" disabled>
        <Radio value="a">Alpha</Radio>
        <Radio value="b">Beta</Radio>
      </RadioField>
      <RadioField label="Read-only" name="rf-st-ro" defaultValue="b" readOnly>
        <Radio value="a">Alpha</Radio>
        <Radio value="b">Beta</Radio>
      </RadioField>
    </div>
  );
}

export function RadioFieldSurfaceContext() {
  return (
    <div style={{ ...section, gap: 'var(--Spacing-4)' }}>
      <p style={caption}>Inside a bold surface, inner Radio tokens remap via [data-surface].</p>
      <Surface mode="bold">
        <div style={{ padding: 'var(--Spacing-4)' }}>
          <RadioField
            appearance="neutral"
            label="Notify me"
            name="radio-field-surf"
            defaultValue="yes"
            feedback={<InputFeedback attention="low">You can change this anytime.</InputFeedback>}
          >
            <Radio value="yes">Yes</Radio>
            <Radio value="no">No</Radio>
          </RadioField>
        </div>
      </Surface>
    </div>
  );
}
