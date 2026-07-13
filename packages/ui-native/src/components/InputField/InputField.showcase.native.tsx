/**
 * InputField.showcase.native.tsx
 *
 * Native gallery sections mirroring the matrix in
 * `packages/ui/src/components/InputField/InputField.stories.tsx` plus the
 * Input showcase aggregates (`InputFieldSizes`, `InputFieldStates`,
 * `InputFieldWithSlots`, `InputFieldAppearances`, `InputFieldAttentions`,
 * `InputFieldShapes`, `InputFieldFullComposition`,
 * `InputFieldSurfaceContext`, `InputFieldSearch`).
 *
 * One exported function per story so the native sample app can dispatch each
 * section under its own `<Section>` block (Avatar / Button convention).
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
import { InputField } from './InputField.native';
import { INPUT_APPEARANCES, INPUT_SIZES, type InputAppearance } from '../Input/interface';
import type { InputLabelSize } from './interface';
import { Surface, useSurfaceTokens, useTypographyTokens } from '../../theme';

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
// Showcase glyphs — match the Input showcase set (Search / Heart / Close).
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
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none">
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

/** Default — single field with label + placeholder. */
export function InputFieldDefault(): React.ReactElement {
  return (
    <View style={stack}>
      <InputField label="Label" placeholder="Placeholder" />
    </View>
  );
}

/** Sizes — S / M / L at default attention. Mirrors web `InputFieldSizes`. */
export function InputFieldSizes(): React.ReactElement {
  return (
    <View style={stack}>
      {INPUT_SIZES.map((size) => (
        <View key={size} style={column}>
          <CaptionLabel>{`size: ${size.toUpperCase()}`}</CaptionLabel>
          <InputField
            size={size as InputLabelSize}
            label={`Size ${size.toUpperCase()}`}
            placeholder={`Size ${size.toUpperCase()}`}
            start={<HeartIcon />}
          />
        </View>
      ))}
    </View>
  );
}

/** Attention levels — medium (outlined) vs high (filled) per size. */
export function InputFieldAttentions(): React.ReactElement {
  const attentions = ['medium', 'high'] as const;
  return (
    <View style={stack}>
      {attentions.map((attention) => (
        <View key={attention} style={column}>
          <CaptionLabel>{`${attention} ${attention === 'high' ? '(filled)' : '(outlined)'}`}</CaptionLabel>
          <View style={subColumn}>
            {INPUT_SIZES.map((size) => (
              <InputField
                key={`${attention}-${size}`}
                size={size as InputLabelSize}
                attention={attention}
                label={`Label ${size.toUpperCase()}`}
                placeholder={`Size ${size.toUpperCase()}`}
                start={<HeartIcon />}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** All appearance roles. Mirrors `InputFieldAppearances`. */
export function InputFieldAppearances(): React.ReactElement {
  return (
    <View style={stack}>
      {INPUT_APPEARANCES.map((role) => (
        <View key={role} style={column}>
          <CaptionLabel>{role}</CaptionLabel>
          <InputField
            label="Label"
            appearance={role as InputAppearance}
            placeholder="Placeholder"
            start={<HeartIcon />}
          />
        </View>
      ))}
    </View>
  );
}

/** Default vs pill shape. */
export function InputFieldShapes(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Default shape</CaptionLabel>
        <InputField label="Default" shape="default" placeholder="Rounded" start={<HeartIcon />} />
      </View>
      <View style={column}>
        <CaptionLabel>Pill shape</CaptionLabel>
        <InputField label="Pill" shape="pill" placeholder="Fully rounded" start={<HeartIcon />} />
      </View>
    </View>
  );
}

/** All visual states — idle / filled / disabled / read-only / error / description / required. */
export function InputFieldStates(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Idle</CaptionLabel>
        <InputField label="Label" placeholder="Placeholder" />
      </View>
      <View style={column}>
        <CaptionLabel>Filled</CaptionLabel>
        <InputField label="Label" defaultValue="Input text" />
      </View>
      <View style={column}>
        <CaptionLabel>Disabled</CaptionLabel>
        <InputField label="Label" placeholder="Disabled" disabled />
      </View>
      <View style={column}>
        <CaptionLabel>Read-only</CaptionLabel>
        <InputField label="Label" defaultValue="Read-only value" readOnly />
      </View>
      <View style={column}>
        <CaptionLabel>Error (string shorthand)</CaptionLabel>
        <InputField
          label="Email"
          placeholder="you@example.com"
          error="Enter a valid email address"
        />
      </View>
      <View style={column}>
        <CaptionLabel>With description</CaptionLabel>
        <InputField
          label="Label"
          description="Helpful supporting copy below the label."
          placeholder="With description"
        />
      </View>
      <View style={column}>
        <CaptionLabel>Required</CaptionLabel>
        <InputField
          label="Required field"
          required
          placeholder="Adds asterisk + a11y required"
        />
      </View>
    </View>
  );
}

/** 4-slot system — start / start2 / end / end2 combinations. */
export function InputFieldWithSlots(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Start icon</CaptionLabel>
        <InputField label="Label" start={<HeartIcon />} placeholder="With start icon" />
      </View>
      <View style={column}>
        <CaptionLabel>Start + end icons</CaptionLabel>
        <InputField
          label="Label"
          start={<HeartIcon />}
          end={<CloseIcon />}
          placeholder="Start and end"
        />
      </View>
      <View style={column}>
        <CaptionLabel>Start2 (prefix text)</CaptionLabel>
        <InputField label="Amount" start2="$" placeholder="0.00" type="number" />
      </View>
      <View style={column}>
        <CaptionLabel>End2 (suffix text)</CaptionLabel>
        <InputField label="Weight" end2="kg" placeholder="Enter weight" type="number" />
      </View>
      <View style={column}>
        <CaptionLabel>All 4 slots</CaptionLabel>
        <InputField
          label="Amount"
          start={<HeartIcon />}
          start2="$"
          end2=".00"
          end={<CloseIcon />}
          placeholder="Enter amount"
        />
      </View>
    </View>
  );
}

/** Full composition — label + description + info icon + feedback + dynamic row. */
export function InputFieldFullComposition(): React.ReactElement {
  return (
    <View style={stack}>
      <InputField
        label="Email address"
        description="We will never share your address."
        infoIcon
        infoIconAriaLabel="Why we ask for your email"
        placeholder="you@example.com"
        type="email"
        required
        error="Enter a valid email address"
        dynamicText="0 / 240 characters"
        helperButton="Clear"
      />
    </View>
  );
}

/** Controlled — round-trips `value` through `onChange`. */
export function InputFieldControlled(): React.ReactElement {
  const [value, setValue] = useState('Hello');
  return (
    <View style={stack}>
      <InputField
        label="Controlled"
        value={value}
        onChange={setValue}
        placeholder="Type to update"
        start={<SearchIcon />}
      />
      <CaptionLabel>{`value = "${value}"`}</CaptionLabel>
    </View>
  );
}

/**
 * Surface context — render InputFields inside `<Surface mode="...">` so the
 * border / fill / text / slot icons remap automatically. Peer of
 * `InputFieldSurfaceContext`.
 */
export function InputFieldSurfaceContext(): React.ReactElement {
  const modes: Array<{
    mode: 'default' | 'minimal' | 'subtle' | 'moderate' | 'bold';
    desc: string;
  }> = [
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
          <Surface mode={mode} appearance="secondary" style={surfaceStyle}>
            <InputField
              label="Medium (outlined)"
              placeholder={`Medium on ${mode}`}
              start={<HeartIcon />}
            />
            <InputField
              label="High (filled)"
              attention="high"
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
export function InputFieldSearch(): React.ReactElement {
  return (
    <View style={stack}>
      <View style={column}>
        <CaptionLabel>Search — leading icon only</CaptionLabel>
        <InputField
          label="Search"
          shape="pill"
          start={<SearchIcon />}
          placeholder="Search products, brands, categories…"
        />
      </View>
      <View style={column}>
        <CaptionLabel>Search — leading + trailing icon</CaptionLabel>
        <InputField
          label="Search"
          shape="pill"
          start={<SearchIcon />}
          end={<CloseIcon />}
          defaultValue="Sneakers"
        />
      </View>
      <View style={column}>
        <CaptionLabel>Filled (attention=high) — search variant</CaptionLabel>
        <InputField
          label="Search"
          shape="pill"
          attention="high"
          start={<SearchIcon />}
          end={<CloseIcon />}
          placeholder="Search across everything"
        />
      </View>
    </View>
  );
}
