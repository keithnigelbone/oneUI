/**
 * InputFeedback.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/Input/Input.showcase.tsx`
 * `InputFeedbackShowcase` (variant × size × attention matrix) + the
 * single-row examples in `InputFeedback.stories.tsx`.
 */

import React from 'react';
import { Text as RNText, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens } from '@oneui/tokens';
import { Surface, useSurfaceTokens, useTypographyTokens } from '../../theme';
import { Text } from '../Text/Text.native';
import { InputFeedback } from './InputFeedback.native';
import {
  INPUT_FEEDBACK_ATTENTIONS,
  INPUT_FEEDBACK_SIZES,
  INPUT_FEEDBACK_VARIANTS,
  type InputFeedbackSize,
} from './interface';

const stack: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['2'],
};

const subColumn: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
};

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <Text variant='body' size='XS' attention='low'>
      {children}
    </Text>
  );
}

function SizeLabel({ size }: { size: InputFeedbackSize }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const typo = useTypographyTokens('label', 'XS', { emphasis: 'medium' });
  return (
    <RNText
      style={{
        fontFamily: typo.fontFamily,
        fontSize: typo.fontSize,
        lineHeight: typo.lineHeight,
        fontWeight: String(typo.fontWeight) as '500',
        color: role.content.medium,
      }}
    >
      size: {size}
    </RNText>
  );
}

/** Default — single negative low feedback row. */
export function InputFeedbackDefault(): React.ReactElement {
  return (
    <View style={stack}>
      <InputFeedback
        variant='negative'
        attention='low'
        size='m'
        feedback_message='Password must be at least 8 characters.'
      />
    </View>
  );
}

/**
 * Variants × Attention × Size — the matrix mirroring
 * `InputFeedbackShowcase` on web.
 */
export function InputFeedbackMatrix(): React.ReactElement {
  return (
    <View style={stack}>
      {INPUT_FEEDBACK_VARIANTS.map((variant) => (
        <View key={variant} style={column}>
          <CaptionLabel>{variant}</CaptionLabel>
          <View style={subColumn}>
            {INPUT_FEEDBACK_SIZES.map((size) => (
              <View key={`${variant}-${size}`} style={column}>
                <SizeLabel size={size} />
                <View style={subColumn}>
                  {INPUT_FEEDBACK_ATTENTIONS.map((attention) => (
                    <InputFeedback
                      key={`${variant}-${size}-${attention}`}
                      variant={variant}
                      attention={attention}
                      size={size}
                      feedback_message='Feedback message'
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Variants — one row per variant at default size + low attention. */
export function InputFeedbackVariants(): React.ReactElement {
  return (
    <View style={stack}>
      {INPUT_FEEDBACK_VARIANTS.map((variant) => (
        <InputFeedback
          key={variant}
          variant={variant}
          attention='low'
          size='m'
          feedback_message={`${variant.charAt(0).toUpperCase()}${variant.slice(1)} feedback message.`}
        />
      ))}
    </View>
  );
}

/** Attention levels — one column per attention at default size. */
export function InputFeedbackAttentionLevels(): React.ReactElement {
  return (
    <View style={stack}>
      {INPUT_FEEDBACK_ATTENTIONS.map((attention) => (
        <View key={attention} style={column}>
          <CaptionLabel>{attention}</CaptionLabel>
          <InputFeedback
            variant='negative'
            attention={attention}
            size='m'
            feedback_message='Password must be at least 8 characters.'
          />
        </View>
      ))}
    </View>
  );
}

/** Sizes — one row per size at low attention. */
export function InputFeedbackSizes(): React.ReactElement {
  return (
    <View style={stack}>
      {INPUT_FEEDBACK_SIZES.map((size) => (
        <View key={size} style={column}>
          <SizeLabel size={size} />
          <InputFeedback
            variant='informative'
            attention='medium'
            size={size}
            feedback_message='Saved as draft.'
          />
        </View>
      ))}
    </View>
  );
}

/**
 * Surface Context — feedback rendered inside `<Surface mode="bold">` etc.
 * `useSurfaceTokens(variant)` already remaps role tokens for the active
 * surface, so the feedback row stays legible against the parent fill.
 */
export function InputFeedbackSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, desc: 'page background' },
    { mode: 'minimal' as const, desc: 'light tint' },
    { mode: 'subtle' as const, desc: 'medium tint' },
    { mode: 'bold' as const, desc: 'full accent fill' },
  ];
  const surfaceStyle: ViewStyle = {
    padding: tokens.spacing['4-5'],
    borderRadius: tokens.shape.m,
    gap: tokens.spacing['3'],
  };
  return (
    <View style={stack}>
      {surfaceModes.map(({ mode, desc }) => (
        <View key={mode} style={column}>
          <CaptionLabel>{`${mode} — ${desc}`}</CaptionLabel>
          <Surface mode={mode} style={surfaceStyle}>
            <InputFeedback
              variant='negative'
              attention='low'
              size='m'
              feedback_message='Negative low'
            />
            <InputFeedback
              variant='positive'
              attention='medium'
              size='m'
              feedback_message='Positive medium'
            />
            <InputFeedback
              variant='warning'
              attention='high'
              size='m'
              feedback_message='Warning high'
            />
          </Surface>
        </View>
      ))}
    </View>
  );
}

/**
 * Disabled — InputFeedback has no native disabled state; consumers signal
 * irrelevance by removing the message. This section demonstrates the empty
 * branch (no row rendered) versus the visible state.
 */
export function InputFeedbackDisabled(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>visible</CaptionLabel>
        <InputFeedback
          variant='warning'
          attention='medium'
          size='m'
          feedback_message='Visible feedback row'
        />
      </View>
      <View style={column}>
        <CaptionLabel>empty message → renders nothing</CaptionLabel>
        <InputFeedback variant='warning' attention='medium' size='m' feedback_message='' />
      </View>
    </View>
  );
}
