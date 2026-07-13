/**
 * CheckboxField.showcase.native.tsx
 *
 * RN mirror of `CheckboxField.showcase.tsx`. Each export shadows the
 * shared web showcase so the native gallery and Storybook stay aligned.
 *
 * Sections:
 *   - CheckboxFieldDefault           (single mode, label + dynamic + feedback)
 *   - CheckboxFieldSizes             (s / m / l)
 *   - CheckboxFieldStates            (default / checked / indeterminate / disabled / readOnly)
 *   - CheckboxFieldRequiredAndError  (asterisk + negative feedback)
 *   - CheckboxFieldMultiOption       (children = stack of <Checkbox>)
 *   - CheckboxFieldWithDynamicText   (dynamicText + helperButton row only)
 *   - CheckboxFieldSurfaceContext    (bold surface remap)
 *   - CheckboxFieldFullWidth         (full-width form layout)
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Surface, useSurfaceTokens } from '../../theme';
import { Checkbox } from '../Checkbox/Checkbox.native';
import { CheckboxField } from './CheckboxField.native';

// ─── Layout helpers ─────────────────────────────────────────────────────────

const section: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
  width: '100%',
};

const stack: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['5'],
  width: '100%',
};

const surfaceCell: StyleProp<ViewStyle> = {
  padding: tokens.spacing['4'],
  borderRadius: tokens.shape.m,
};

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</Text>
  );
}

// ─── Sections ──────────────────────────────────────────────────────────────

export function CheckboxFieldDefault(): React.ReactElement {
  return (
    <View style={section}>
      <Caption>Single mode — integrated label + description + helper row.</Caption>
      <CheckboxField
        label='Send me product news'
        description='You can change this any time.'
        size='m'
        dynamicText='Optional'
        helperButton='Learn more'
      />
    </View>
  );
}

export function CheckboxFieldSizes(): React.ReactElement {
  return (
    <View style={stack}>
      {(['s', 'm', 'l'] as const).map((sz) => (
        <CheckboxField
          key={sz}
          size={sz}
          label={`Size ${sz.toUpperCase()}`}
          description='Description scales with the field size.'
          dynamicText='Helper text'
        />
      ))}
    </View>
  );
}

export function CheckboxFieldStates(): React.ReactElement {
  return (
    <View style={stack}>
      <CheckboxField label='Default' />
      <CheckboxField label='Checked' selected />
      <CheckboxField label='Indeterminate' indeterminate />
      <CheckboxField label='Disabled' disabled />
      <CheckboxField label='Read-only' readOnly selected />
    </View>
  );
}

export function CheckboxFieldRequiredAndError(): React.ReactElement {
  return (
    <View style={stack}>
      <CheckboxField label='Required option' description='Marked required.' required />
      <CheckboxField
        label='Accept the terms'
        description='Tap to acknowledge before continuing.'
        invalid
        error='You must accept the terms to continue.'
      />
    </View>
  );
}

export function CheckboxFieldMultiOption(): React.ReactElement {
  const [groupValue, setGroupValue] = useState<string[]>(['email']);
  return (
    <CheckboxField
      label='Notification channels'
      description='Pick where we should reach you.'
      groupValue={groupValue}
      onGroupValueChange={setGroupValue}
      dynamicText={`${groupValue.length} channel${groupValue.length === 1 ? '' : 's'} selected`}
    >
      <Checkbox value='email' label='Email' />
      <Checkbox value='sms' label='SMS' />
      <Checkbox value='push' label='Push notifications' description='In-app reminders.' />
    </CheckboxField>
  );
}

export function CheckboxFieldWithDynamicText(): React.ReactElement {
  return (
    <CheckboxField
      label='Nickname'
      description='Choose a unique handle.'
      dynamicText='0 / 32'
      helperButton='Generate'
    />
  );
}

export function CheckboxFieldSurfaceContext(): React.ReactElement {
  return (
    <View style={section}>
      <Caption>
        On a bold surface the inner Checkbox tokens remap automatically — no caller-side
        adaptation required.
      </Caption>
      <Surface mode='bold' style={surfaceCell}>
        <CheckboxField
          appearance='neutral'
          label='Enable backup'
          description='Stored encrypted in your region.'
          dynamicText='Helper text'
        />
      </Surface>
    </View>
  );
}

export function CheckboxFieldFullWidth(): React.ReactElement {
  return (
    <CheckboxField
      label='Subscribe to weekly digest'
      description='Stretches to the full available width.'
      fullWidth
      dynamicText='Once per week, no spam.'
    />
  );
}
