/**
 * Logo.showcase.native.tsx
 *
 * Parity with `packages/ui/src/components/Logo/Logo.showcase.tsx`.
 * Pass `svgContent` from brand context when available (Storybook / sample app).
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { tokens, typography } from '@oneui/tokens';
import type { LogoSize, LogoVariant } from './interface';
import { Logo } from './Logo.native';
import { Surface, useSurfaceTokens } from '../../theme';

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const labeledItem: StyleProp<ViewStyle> = {
  alignItems: 'center',
  gap: tokens.spacing['3'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
      {children}
    </Text>
  );
}

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';

const SAMPLE_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='white'/%3E%3C/svg%3E";

const SIZES: LogoSize[] = ['xs', 's', 'm', 'l', 'xl'];

const SIZE_LABELS: Record<string, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
};

export function LogoSizes({ svgContent = SAMPLE_SVG }: { svgContent?: string }): React.ReactElement {
  return (
    <View style={column}>
      <View style={row}>
        {SIZES.map((size) => (
          <View key={size} style={labeledItem}>
            <Logo size={size} svgContent={svgContent} alt='Brand Logo' />
            <Label>{SIZE_LABELS[size]}</Label>
          </View>
        ))}
        <View style={labeledItem}>
          <Logo size='custom' customSize={48} svgContent={svgContent} alt='Brand Logo' />
          <Label>custom (48)</Label>
        </View>
      </View>
      <View style={row}>
        <View style={labeledItem}>
          <Logo size='XS' svgContent={svgContent} alt='Brand Logo' />
          <Label>Figma XS</Label>
        </View>
        <View style={labeledItem}>
          <Logo size='XL' svgContent={svgContent} alt='Brand Logo' />
          <Label>Figma XL</Label>
        </View>
      </View>
    </View>
  );
}

export function LogoVariants({ svgContent = SAMPLE_SVG }: { svgContent?: string }): React.ReactElement {
  return (
    <View style={row}>
      {(['mark', 'full'] as LogoVariant[]).map((variant) => (
        <View key={variant} style={labeledItem}>
          <Logo variant={variant} size='xl' svgContent={svgContent} alt={`${variant} variant`} />
          <Label>{variant}</Label>
        </View>
      ))}
    </View>
  );
}

export function LogoCustomSize({ svgContent = SAMPLE_SVG }: { svgContent?: string }): React.ReactElement {
  return (
    <View style={row}>
      <Logo size='custom' customSize={48} svgContent={svgContent} alt='48 dp' />
      <Logo size='custom' customSize={72} svgContent={svgContent} alt='72 dp' />
      <Logo size='custom' customSize={96} svgContent={svgContent} alt='96 dp' />
    </View>
  );
}

export function LogoContentSources({ svgContent = SAMPLE_SVG }: { svgContent?: string }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View style={row}>
      <View style={labeledItem}>
        <Logo alt='Children' size='xl'>
          <Svg width='100%' height='100%' viewBox='0 0 24 24' fill={role.surfaces.bold}>
            <Path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
          </Svg>
        </Logo>
        <Label>children</Label>
      </View>
      <View style={labeledItem}>
        <Logo alt='SVG Content' size='xl' svgContent={svgContent} />
        <Label>svgContent</Label>
      </View>
      <View style={labeledItem}>
        <Logo alt='External Image' size='xl' src={SAMPLE_IMAGE_SRC} />
        <Label>src</Label>
      </View>
    </View>
  );
}

export function LogoFromImage(): React.ReactElement {
  return (
    <View style={row}>
      <Logo src={SAMPLE_IMAGE_SRC} alt='Image logo' size='l' />
    </View>
  );
}

export function LogoFromChildren(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View style={row}>
      <Logo size='l' alt='Custom JSX'>
        <Svg width='100%' height='100%' viewBox='0 0 24 24' fill={role.surfaces.bold}>
          <Path d='M12 2L2 7l10 5 10-5-10-5z' />
        </Svg>
      </Logo>
    </View>
  );
}

export function LogoImageFallback(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View style={row}>
      <View style={labeledItem}>
        <Logo
          alt='With Fallback'
          size='xl'
          src='https://invalid.example/broken.png'
          fallback={
            <Svg width='50%' height='50%' viewBox='0 0 24 24' fill={role.surfaces.bold}>
              <Path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z' />
            </Svg>
          }
        />
        <Label>broken src + fallback</Label>
      </View>
      <View style={labeledItem}>
        <Logo
          alt='No content'
          size='xl'
          fallback={
            <Text style={{ color: role.content.tintedA11y, fontSize: typography.size.xs }}>?</Text>
          }
        />
        <Label>empty + fallback</Label>
      </View>
    </View>
  );
}

/* ========================================
   Default — single Logo at size M.
   Mirrors web `Default` story.
   ======================================== */
export function LogoDefault({ svgContent = SAMPLE_SVG }: { svgContent?: string }): React.ReactElement {
  return <Logo size='m' svgContent={svgContent} alt='Brand Logo' />;
}

/* ========================================
   Surface Context — every surface mode in a flat list.
   Mirrors web `SurfaceContext` story.
   ======================================== */
const SURFACE_MODES = [
  { mode: 'default' as const, label: 'default', desc: 'page background' },
  { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
  { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
  { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
  { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
  { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
];

const surfacePadding: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
  padding: tokens.spacing['4-5'],
  borderRadius: tokens.shape.l,
};

export function LogoSurfaceContext({
  svgContent = SAMPLE_SVG,
}: { svgContent?: string }): React.ReactElement {
  return (
    <View style={column}>
      {SURFACE_MODES.map(({ mode, label, desc }) => (
        <View key={mode} style={{ gap: tokens.spacing['3'] }}>
          <Label>
            {label} — {desc}
          </Label>
          <Surface mode={mode} style={surfacePadding}>
            <Logo size='l' svgContent={svgContent} alt='Brand Logo' />
            <Logo size='xl' svgContent={svgContent} alt='Brand Logo' />
          </Surface>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   Interactive — tappable logo (Figma `interactive={true}`).
   ======================================== */
export function LogoInteractive({
  svgContent = SAMPLE_SVG,
}: { svgContent?: string }): React.ReactElement {
  const [pressCount, setPressCount] = useState(0);
  return (
    <View style={column}>
      <Logo
        size='m'
        variant='mark'
        svgContent={svgContent}
        alt='Jio — go home'
        interactive
        onPress={() => setPressCount((n) => n + 1)}
        accessibilityHint='Navigates to home'
      />
      <Label>{pressCount > 0 ? `Pressed ${pressCount} time(s)` : 'Tap the logo'}</Label>
      <Logo
        size='m'
        variant='mark'
        svgContent={svgContent}
        alt='Disabled logo'
        interactive
        disabled
        onPress={() => undefined}
      />
      <Label>interactive + disabled (static)</Label>
    </View>
  );
}

/* ========================================
   Themes — All sizes side-by-side, plus all sizes inside a bold surface.
   Mirrors web `Themes` story (decorator-driven on web).
   ======================================== */
const themeRow: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: tokens.spacing['4'],
};

export function LogoThemes({
  svgContent = SAMPLE_SVG,
}: { svgContent?: string }): React.ReactElement {
  return (
    <View style={[row, { alignItems: 'flex-start', gap: tokens.spacing['6'] }]}>
      <View style={[labeledItem, { gap: tokens.spacing['4-5'] }]}>
        <Label>All sizes</Label>
        <View style={themeRow}>
          {SIZES.map((size) => (
            <Logo key={size} size={size} svgContent={svgContent} alt='Brand Logo' />
          ))}
        </View>
      </View>
      <View style={[labeledItem, { gap: tokens.spacing['4-5'] }]}>
        <Label>On bold surface</Label>
        <Surface
          mode='bold'
          style={[
            themeRow,
            { padding: tokens.spacing['4-5'], borderRadius: tokens.shape.l },
          ]}
        >
          {SIZES.map((size) => (
            <Logo key={size} size={size} svgContent={svgContent} alt='Brand Logo' />
          ))}
        </Surface>
      </View>
    </View>
  );
}
