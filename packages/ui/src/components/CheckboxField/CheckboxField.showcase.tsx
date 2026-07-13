/**
 * CheckboxField.showcase.tsx
 *
 * Shared sections for Storybook and platform docs. Token-only inline styles.
 */

import React from 'react';
import { CheckboxField } from './CheckboxField';
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

export function CheckboxFieldDefault() {
  return (
    <div style={section}>
      <p style={caption}>
        Same contract as InputField: feedback / error below the control row.
      </p>
      <CheckboxField
        label="Send me product news"
        size="m"
        feedback={
          <InputFeedback variant="informative" attention="low">
            Preferences sync across your devices.
          </InputFeedback>
        }
      />
    </div>
  );
}

export function CheckboxFieldSizes() {
  return (
    <div style={{ ...section, gap: 'var(--Spacing-5)' }}>
      {(['s', 'm', 'l'] as const).map((sz) => (
        <CheckboxField
          key={sz}
          size={sz}
          label={`Size ${sz.toUpperCase()}`}
          feedback={<InputFeedback attention="low">Feedback scales with field size.</InputFeedback>}
        />
      ))}
    </div>
  );
}

export function CheckboxFieldStates() {
  return (
    <div style={{ ...section, gap: 'var(--Spacing-5)' }}>
      <CheckboxField
        label="Default"
        checked={false}
      />
      <CheckboxField label="Checked" checked />
      <CheckboxField label="Indeterminate" indeterminate />
      <CheckboxField label="Disabled" disabled />
      <CheckboxField label="Read-only" readOnly checked />
    </div>
  );
}

export function CheckboxFieldSurfaceContext() {
  return (
    <div style={{ ...section, gap: 'var(--Spacing-4)' }}>
      <p style={caption}>Inside a bold surface, the inner Checkbox tokens remap via [data-surface].</p>
      <Surface mode="bold">
        <div style={{ padding: 'var(--Spacing-4)' }}>
          <CheckboxField
            appearance="neutral"
            label="Enable backup"
            feedback={<InputFeedback attention="low">Stored encrypted in your region.</InputFeedback>}
          />
        </div>
      </Surface>
    </div>
  );
}
