/**
 * Input.showcase.native.tsx
 *
 * Native gallery sections mirroring the matrix in
 * `packages/ui/src/components/Input/Input.stories.tsx`
 * and `packages/ui/src/components/Input/Input.showcase.tsx`.
 *
 * One exported function per story so the native sample app `ComponentDetailScreen`
 * can dispatch them under `<Section>` blocks (same convention as Avatar,
 * Button, InputFeedback).
 */

import React, { useState } from 'react';
import {
  Text as RNText,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens } from '@oneui/tokens';
import { Input } from './Input.native';
import {
  INPUT_APPEARANCES,
  type InputAppearance,
  type InputSize,
} from './interface';
import { Surface, useSurfaceTokens, useTypographyTokens } from '../../theme';

/**
 * All four Input sizes in ascending order. Mirrors the Figma `.DNA/Input`
 * size set (XS / S / M / L). Distinct from `INPUT_SIZES` (the S/M/L
 * field-label tier set) because the Input control ships a dedicated XS (f6)
 * tier that the label stack collapses to `s`.
 */
const ALL_INPUT_SIZES: readonly InputSize[] = ['xs', 's', 'm', 'l'];

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

const stack: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['5'],
  width: '100%',
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['2-5'],
  width: '100%',
};

const subColumn: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['3'],
};

function CaptionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const typo = useTypographyTokens('label', 'XS', { emphasis: 'medium' });
  return (
    <RNText
      style={{
        fontFamily: typo.fontFamily,
        fontSize: typo.fontSize,
        lineHeight: typo.lineHeight,
        fontWeight: typo.fontWeight,
        color: role.content.low,
      }}
    >
      {children}
    </RNText>
  );
}

// ---------------------------------------------------------------------------
// Showcase glyphs — inline SVGs the same way the Avatar showcase ships its
// `DefaultPersonIcon`. Each component matches the `IconComponentProps` shape
// so RN-SVG `<Path>` renders correctly inside the Input slot wrappers.
// ---------------------------------------------------------------------------

interface GlyphProps {
  width?: number | string;
  height?: number | string;
  size?: number;
  color?: string;
  fill?: string;
}

function GlyphSvg({
  width,
  height,
  size,
  color,
  fill,
  path,
}: GlyphProps & { path: string }): React.ReactElement {
  const w = width ?? size ?? '100%';
  const h = height ?? size ?? '100%';
  const tint = (fill ?? color ?? 'currentColor') as string;
  return (
    <Svg width={w} height={h} viewBox='0 0 24 24' fill='none'>
      <Path d={path} fill={tint} />
    </Svg>
  );
}

const SEARCH_PATH =
  'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';
const HEART_PATH =
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
const CLOSE_PATH =
  'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z';

const SearchIcon = (props: GlyphProps): React.ReactElement => (
  <GlyphSvg {...props} path={SEARCH_PATH} />
);
const HeartIcon = (props: GlyphProps): React.ReactElement => (
  <GlyphSvg {...props} path={HEART_PATH} />
);
const CloseIcon = (props: GlyphProps): React.ReactElement => (
  <GlyphSvg {...props} path={CLOSE_PATH} />
);

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Default — single uncontrolled input, size M, medium attention. */
export function InputDefault(): React.ReactElement {
  return (
    <View style={stack}>
      <Input placeholder='Placeholder' size='m' appearance='auto' />
    </View>
  );
}

/** Sizes — XS / S / M / L at default attention. Mirrors `InputFieldSizes`. */
export function InputSizes(): React.ReactElement {
  return (
    <View style={stack}>
      {ALL_INPUT_SIZES.map((size) => (
        <View key={String(size)} style={column}>
          <CaptionLabel>{`size: ${String(size).toUpperCase()}`}</CaptionLabel>
          <Input
            size={size}
            accessibilityLabel={`Size ${String(size).toUpperCase()}`}
            placeholder={`Size ${String(size).toUpperCase()}`}
            start={<HeartIcon />}
          />
        </View>
      ))}
    </View>
  );
}

/** Attention levels — medium (outlined) vs high (filled) per size. */
export function InputAttentionLevels(): React.ReactElement {
  const attentions = ['medium', 'high'] as const;
  return (
    <View style={stack}>
      {attentions.map((attention) => (
        <View key={attention} style={column}>
          <CaptionLabel>{`${attention} ${attention === 'high' ? '(filled)' : '(outlined)'}`}</CaptionLabel>
          <View style={subColumn}>
            {ALL_INPUT_SIZES.map((size) => (
              <Input
                key={`${attention}-${String(size)}`}
                size={size}
                attention={attention}
                accessibilityLabel={`${attention} ${String(size).toUpperCase()}`}
                placeholder={`Size ${String(size).toUpperCase()}`}
                start={<HeartIcon />}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** All appearance roles — peer of `InputFieldAppearances`. */
export function InputAppearances(): React.ReactElement {
  return (
    <View style={stack}>
      {INPUT_APPEARANCES.map((role) => (
        <View key={role} style={column}>
          <CaptionLabel>{role}</CaptionLabel>
          <Input
            accessibilityLabel={role}
            appearance={role as InputAppearance}
            placeholder='Placeholder'
            start={<HeartIcon />}
          />
        </View>
      ))}
    </View>
  );
}

/** Shape variants — default vs pill. */
export function InputShapes(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Default shape</CaptionLabel>
        <Input accessibilityLabel='Default shape' shape='default' placeholder='Rounded' start={<HeartIcon />} />
      </View>
      <View style={column}>
        <CaptionLabel>Pill shape</CaptionLabel>
        <Input accessibilityLabel='Pill shape' shape='pill' placeholder='Fully rounded' start={<HeartIcon />} />
      </View>
    </View>
  );
}

/** All visual states — peer of `InputFieldStates`. */
export function InputStates(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Idle</CaptionLabel>
        <Input accessibilityLabel='Idle input' placeholder='Placeholder' />
      </View>
      <View style={column}>
        <CaptionLabel>Filled</CaptionLabel>
        <Input accessibilityLabel='Filled input' defaultValue='Input text' />
      </View>
      <View style={column}>
        <CaptionLabel>Disabled</CaptionLabel>
        <Input accessibilityLabel='Disabled input' placeholder='Disabled' disabled />
      </View>
      <View style={column}>
        <CaptionLabel>Read-only</CaptionLabel>
        <Input accessibilityLabel='Read-only input' defaultValue='Read-only value' readOnly />
      </View>
      <View style={column}>
        <CaptionLabel>Error highlight</CaptionLabel>
        <Input
          accessibilityLabel='Input with error'
          placeholder='Error state'
          errorHighlight
          aria-invalid
        />
      </View>
    </View>
  );
}

/** Disabled — single emphasised story (consumers ask for it explicitly). */
export function InputDisabled(): React.ReactElement {
  return (
    <View style={stack}>
      <Input
        accessibilityLabel='Disabled input'
        placeholder='Read-only placeholder'
        start={<HeartIcon />}
        disabled
      />
    </View>
  );
}

/** 4-slot system — peer of `InputFieldWithSlots`. */
export function InputWithSlots(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Start icon</CaptionLabel>
        <Input accessibilityLabel='Input with start icon' start={<HeartIcon />} placeholder='With start icon' />
      </View>
      <View style={column}>
        <CaptionLabel>Start + end icons</CaptionLabel>
        <Input
          accessibilityLabel='Input with start and end icons'
          start={<HeartIcon />}
          end={<CloseIcon />}
          placeholder='Start and end'
        />
      </View>
      <View style={column}>
        <CaptionLabel>Start2 (prefix text)</CaptionLabel>
        <Input accessibilityLabel='Amount' start2='$' placeholder='0.00' type='number' />
      </View>
      <View style={column}>
        <CaptionLabel>End2 (suffix text)</CaptionLabel>
        <Input accessibilityLabel='Weight' end2='kg' placeholder='Enter weight' type='number' />
      </View>
      <View style={column}>
        <CaptionLabel>All 4 slots</CaptionLabel>
        <Input
          accessibilityLabel='Amount'
          start={<HeartIcon />}
          start2='$'
          end2='.00'
          end={<CloseIcon />}
          placeholder='Enter amount'
        />
      </View>
    </View>
  );
}

/** Controlled — round-trips `value` through `onChange` for QA. */
export function InputControlled(): React.ReactElement {
  const [value, setValue] = useState('Hello');
  return (
    <View style={stack}>
      <Input
        accessibilityLabel='Controlled input'
        value={value}
        onChange={setValue}
        placeholder='Type to update'
        start={<SearchIcon />}
      />
      <CaptionLabel>{`value = "${value}"`}</CaptionLabel>
    </View>
  );
}

/**
 * Surface context — render Inputs inside `<Surface mode="...">` so the
 * border / fill / text / slot icons remap automatically. Peer of
 * `InputFieldSurfaceContext`.
 */
export function InputSurfaceContext(): React.ReactElement {
  const modes: Array<{ mode: 'default' | 'minimal' | 'subtle' | 'moderate' | 'bold'; desc: string }> = [
    { mode: 'default', desc: 'page background' },
    { mode: 'minimal', desc: 'lightest tint' },
    { mode: 'subtle', desc: 'light tint' },
    { mode: 'moderate', desc: 'medium tint' },
    { mode: 'bold', desc: 'full accent fill' },
  ];

  const surfaceStyle: ViewStyle = {
    padding: tokens.spacing['4'],
    borderRadius: tokens.shape.m,
    width: '100%',
    gap: tokens.spacing['3'],
  };

  return (
    <View style={stack}>
      {modes.map(({ mode, desc }) => (
        <View key={mode} style={column}>
          <CaptionLabel>{`${mode} — ${desc}`}</CaptionLabel>
          <Surface mode={mode} appearance='secondary' style={surfaceStyle}>
            <Input
              accessibilityLabel={`Medium outlined input on ${mode}`}
              placeholder={`Medium on ${mode}`}
              start={<HeartIcon />}
            />
            <Input
              accessibilityLabel={`High filled input on ${mode}`}
              attention='high'
              placeholder={`Filled on ${mode}`}
              start={<HeartIcon />}
            />
          </Surface>
        </View>
      ))}
    </View>
  );
}

/** Search pattern — leading SearchIcon + trailing CloseIcon, pill shape. */
export function InputSearch(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Search — leading icon only</CaptionLabel>
        <Input
          accessibilityLabel='Search'
          shape='pill'
          start={<SearchIcon />}
          placeholder='Search products, brands, categories…'
        />
      </View>
      <View style={column}>
        <CaptionLabel>Search — leading + trailing icon</CaptionLabel>
        <Input
          accessibilityLabel='Search'
          shape='pill'
          start={<SearchIcon />}
          end={<CloseIcon />}
          defaultValue='Sneakers'
        />
      </View>
      <View style={column}>
        <CaptionLabel>Filled (attention=high) — search variant</CaptionLabel>
        <Input
          accessibilityLabel='Search'
          shape='pill'
          attention='high'
          start={<SearchIcon />}
          end={<CloseIcon />}
          placeholder='Search across everything'
        />
      </View>
    </View>
  );
}
