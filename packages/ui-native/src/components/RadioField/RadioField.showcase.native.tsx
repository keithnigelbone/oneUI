/**
 * RadioField.showcase.native.tsx
 *
 * RN mirror of `RadioField.showcase.tsx`. Each export shadows the shared
 * web showcase so the native gallery and Storybook stay aligned.
 *
 * Sections:
 *   - RadioFieldDefault         (multi-option + dynamic + feedback)
 *   - RadioFieldSizes           (s / m / l)
 *   - RadioFieldStates          (default / disabled / readOnly)
 *   - RadioFieldRequiredAndError(asterisk + negative feedback)
 *   - RadioFieldIntegratedSingle(no children — implicit lone radio)
 *   - RadioFieldWithDynamicText (dynamic + helper button)
 *   - RadioFieldSurfaceContext  (bold surface remap)
 *   - RadioFieldFullWidth       (full-width layout)
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Surface, useSurfaceTokens } from '../../theme';
import { Radio } from '../Radio/Radio.native';
import { RadioField } from './RadioField.native';

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

export function RadioFieldDefault(): React.ReactElement {
  return (
    <View style={section}>
      <Caption>Multi-option field — header + options + helper row.</Caption>
      <RadioField
        label='Delivery speed'
        description='Applies to this order only.'
        defaultValue='std'
        dynamicText='Optional'
        helperButton='Learn more'
      >
        <Radio value='std'>Standard</Radio>
        <Radio value='exp'>Express</Radio>
      </RadioField>
    </View>
  );
}

export function RadioFieldSizes(): React.ReactElement {
  return (
    <View style={stack}>
      {(['s', 'm', 'l'] as const).map((sz) => (
        <RadioField
          key={sz}
          size={sz}
          label={`Size ${sz.toUpperCase()}`}
          description='Description scales with the field size.'
          defaultValue='a'
          dynamicText='Helper text'
        >
          <Radio value='a'>Option A</Radio>
          <Radio value='b'>Option B</Radio>
        </RadioField>
      ))}
    </View>
  );
}

export function RadioFieldStates(): React.ReactElement {
  return (
    <View style={stack}>
      <RadioField label='Default' defaultValue='x'>
        <Radio value='x'>Choice one</Radio>
        <Radio value='y'>Choice two</Radio>
      </RadioField>
      <RadioField label='Disabled group' defaultValue='a' disabled>
        <Radio value='a'>Alpha</Radio>
        <Radio value='b'>Beta</Radio>
      </RadioField>
      <RadioField label='Read-only' defaultValue='b' readOnly>
        <Radio value='a'>Alpha</Radio>
        <Radio value='b'>Beta</Radio>
      </RadioField>
    </View>
  );
}

export function RadioFieldRequiredAndError(): React.ReactElement {
  return (
    <View style={stack}>
      <RadioField label='Required option' description='Marked required.' required defaultValue='b'>
        <Radio value='a'>Alpha</Radio>
        <Radio value='b'>Beta</Radio>
      </RadioField>
      <RadioField
        label='Pick a delivery speed'
        description='You need to pick one before continuing.'
        invalid
        error='Please choose an option to continue.'
      >
        <Radio value='std'>Standard</Radio>
        <Radio value='exp'>Express</Radio>
      </RadioField>
    </View>
  );
}

export function RadioFieldIntegratedSingle(): React.ReactElement {
  const [checked, setChecked] = useState<boolean>(false);
  return (
    <View style={stack}>
      <Caption>Integrated single — implicit lone Radio beside the field label.</Caption>
      <RadioField
        label='Subscribe to weekly digest'
        description='Tap the radio to toggle on/off.'
        checked={checked}
        onCheckedChange={setChecked}
      />
    </View>
  );
}

export function RadioFieldWithDynamicText(): React.ReactElement {
  return (
    <RadioField
      label='Plan'
      description='Choose a plan to continue.'
      defaultValue='pro'
      dynamicText='0 / 120'
      helperButton='Suggest'
    >
      <Radio value='free'>Free</Radio>
      <Radio value='pro'>Pro</Radio>
    </RadioField>
  );
}

export function RadioFieldSurfaceContext(): React.ReactElement {
  return (
    <View style={section}>
      <Caption>
        On a bold surface the inner Radio tokens remap automatically — no caller-side adaptation
        required.
      </Caption>
      <Surface mode='bold' style={surfaceCell}>
        <RadioField
          appearance='neutral'
          label='Notify me'
          description='You can change this anytime.'
          defaultValue='yes'
        >
          <Radio value='yes'>Yes</Radio>
          <Radio value='no'>No</Radio>
        </RadioField>
      </Surface>
    </View>
  );
}

export function RadioFieldFullWidth(): React.ReactElement {
  return (
    <RadioField
      label='Subscribe to weekly digest'
      description='Stretches to the full available width.'
      fullWidth
      defaultValue='weekly'
      dynamicText='Once per week, no spam.'
    >
      <Radio value='weekly'>Weekly</Radio>
      <Radio value='monthly'>Monthly</Radio>
    </RadioField>
  );
}
