/**
 * Image.showcase.native.tsx
 *
 * RN mirror of `packages/ui/src/components/Image/Image.stories.tsx`. One
 * native section per Storybook story so the native gallery stays in sync
 * with the web docs.
 *
 * Web stories ↔ native sections:
 *   1. Default              → ImageDefault
 *   2. AspectRatios         → ImageAspectRatios
 *   3. ObjectFitModes       → ImageObjectFitModes
 *   4. States               → ImageStates
 *   5. WithFallback         → ImageWithFallback
 *   6. Interactive          → ImageInteractive
 *   7. Responsive           → ImageResponsive
 *   8. CornerRadius         → ImageCornerRadius
 *   9. WebHtmlAttributes    → omitted on native (web-only HTML <img>
 *      attributes — `srcSet` / `sizes` / `loading` / `lottieAttributes`)
 *
 * `ImageGallery` is a native-only extra retained for the original sample
 * app section (tile grid).
 */

import React, { useState } from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import type { ImageAspectRatio } from './interface';
import { Image } from './Image.native';
import { useSurfaceTokens } from '../../theme';

const SAMPLE = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop';
const PORTRAIT = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop';
const BAD_URL = 'https://invalid.example/does-not-exist.png';

// ─── Layout helpers ────────────────────────────────────────────────────────

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const sectionGap: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['6'],
};

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: tokens.spacing['4-5'],
  alignItems: 'flex-start',
};

const cell: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  alignItems: 'center',
  gap: tokens.spacing['3'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>{children}</Text>
  );
}

// Per-ratio width matches the web Storybook story so rendered tiles map 1:1.
function widthForRatio(ratio: ImageAspectRatio): number | undefined {
  if (ratio === 'auto') return 120;
  if (ratio === '9:21') return 72;
  if (ratio === '21:9') return 160;
  return 100;
}

function heightForRatio(ratio: ImageAspectRatio): number | undefined {
  return ratio === 'auto' ? 80 : undefined;
}

// ─── 1. Default ────────────────────────────────────────────────────────────

export function ImageDefault(): React.ReactElement {
  return (
    <View style={column}>
      <Image src={SAMPLE} alt='Mountain landscape' aspectRatio='16:9' width={320} />
    </View>
  );
}

// ─── 2. Aspect ratios ──────────────────────────────────────────────────────

export function ImageAspectRatios(): React.ReactElement {
  const ratios: ImageAspectRatio[] = [
    'auto', '1:1', '1:2', '2:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '9:21', '21:9',
  ];
  return (
    <View style={row}>
      {ratios.map((ratio) => (
        <View key={ratio} style={cell}>
          <Image
            src={SAMPLE}
            alt={`${ratio} ratio`}
            aspectRatio={ratio}
            width={widthForRatio(ratio)}
            height={heightForRatio(ratio)}
          />
          <Label>{ratio}</Label>
        </View>
      ))}
    </View>
  );
}

// ─── 3. Object fit modes ───────────────────────────────────────────────────
//
// Web also exposes the extended CSS keywords (scale-down / inherit /
// initial / revert / revert-layer / unset). RN's RNImage.resizeMode has
// no equivalents, so the native section only renders the canonical four.

export function ImageObjectFitModes(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  const baseline = ['cover', 'contain', 'fill', 'none'] as const;
  const subtleBorder = role.content.strokeMedium;
  return (
    <View style={sectionGap}>
      <View>
        <Label>Native-supported modes</Label>
        <View style={[row, { marginTop: tokens.spacing['3'] }]}>
          {baseline.map((fit) => (
            <View key={fit} style={cell}>
              <View
                style={{
                  borderWidth: tokens.borderWidth.hairline,
                  borderColor: subtleBorder,
                }}
              >
                <Image
                  src={PORTRAIT}
                  alt={`${fit} mode`}
                  aspectRatio='1:1'
                  width={150}
                  objectFit={fit}
                />
              </View>
              <Label>{fit}</Label>
            </View>
          ))}
        </View>
      </View>
      <View style={{ marginTop: tokens.spacing['4'] }}>
        <Label>Figma alias: fit=&quot;container&quot;</Label>
        <View style={[row, { marginTop: tokens.spacing['3'] }]}>
          <View style={cell}>
            <View
              style={{
                borderWidth: tokens.borderWidth.hairline,
                borderColor: subtleBorder,
              }}
            >
              <Image
                src={PORTRAIT}
                alt='Figma container fit'
                aspectRatio='1:1'
                width={150}
                fit='container'
              />
            </View>
            <Label>fit=container → contain</Label>
          </View>
        </View>
      </View>
      <Label>
        Extended CSS keywords (scale-down / inherit / initial / revert / revert-layer / unset)
        are web-only and have no React Native counterpart.
      </Label>
    </View>
  );
}

// ─── 4. States ─────────────────────────────────────────────────────────────

export function ImageStates(): React.ReactElement {
  return (
    <View style={row}>
      <View style={cell}>
        <Image src={SAMPLE} alt='Default' aspectRatio='1:1' width={120} />
        <Label>Default</Label>
      </View>
      <View style={cell}>
        <Image
          src={SAMPLE}
          alt='Interactive'
          aspectRatio='1:1'
          width={120}
          interactive
          onPress={() => undefined}
        />
        <Label>Interactive + onPress</Label>
      </View>
      <View style={cell}>
        <Image src={SAMPLE} alt='Interactive no handler' aspectRatio='1:1' width={120} interactive />
        <Label>interactive, no handler (image role)</Label>
      </View>
      <View style={cell}>
        <Image src={SAMPLE} alt='Disabled' aspectRatio='1:1' width={120} disabled />
        <Label>Disabled</Label>
      </View>
      <View style={cell}>
        <Image src={BAD_URL} alt='Error fallback' aspectRatio='1:1' width={120} />
        <Label>Default fallback</Label>
      </View>
    </View>
  );
}

// ─── 5. With fallback ──────────────────────────────────────────────────────

export function ImageWithFallback(): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return (
    <View style={row}>
      <View style={cell}>
        <Image src={SAMPLE} alt='Valid image' aspectRatio='16:9' width={200} />
        <Label>Valid image</Label>
      </View>
      <View style={cell}>
        <Image src={BAD_URL} alt='Default fallback' aspectRatio='16:9' width={200} />
        <Label>Default (no fallback)</Label>
      </View>
      <View style={cell}>
        <Image
          src={BAD_URL}
          alt='Custom fallback'
          aspectRatio='16:9'
          width={200}
          fallback={
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: role.surfaces.subtle,
              }}
            >
              <Text
                style={{
                  fontSize: typography.size.s,
                  color: role.content.low,
                }}
              >
                No image
              </Text>
            </View>
          }
        />
        <Label>Custom fallback</Label>
      </View>
      <View style={cell}>
        <Image
          src={BAD_URL}
          alt='URL fallback'
          aspectRatio='16:9'
          width={200}
          fallbackSrc={SAMPLE}
        />
        <Label>fallbackSrc</Label>
      </View>
    </View>
  );
}

// ─── 6. Interactive ────────────────────────────────────────────────────────

export function ImageInteractive(): React.ReactElement {
  const [pressCount, setPressCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  return (
    <View style={column}>
      <Image
        src={SAMPLE}
        alt='Clickable image'
        aspectRatio='16:9'
        width={320}
        interactive
        onPress={() => undefined}
      />
      <Label>Tappable — interactive=true</Label>
      <View style={cell}>
        <Image
          src={SAMPLE}
          alt='Both onPress and onClick'
          aspectRatio='1:1'
          width={160}
          interactive
          onPress={() => setPressCount((c) => c + 1)}
          onClick={() => setClickCount((c) => c + 1)}
        />
        <Label>
          onPress + onClick — tap increments both (press: {pressCount}, click: {clickCount})
        </Label>
      </View>
    </View>
  );
}

// ─── 7. Responsive ─────────────────────────────────────────────────────────

export function ImageResponsive(): React.ReactElement {
  const widths = [
    { width: '100%' as const, label: 'Full width' },
    { width: '75%' as const, label: '75%' },
    { width: '50%' as const, label: '50%' },
  ];
  return (
    <View style={[column, { gap: tokens.spacing['4-5'] } as ViewStyle]}>
      {widths.map(({ width, label }) => (
        <View key={label} style={{ gap: tokens.spacing['3'] }}>
          <Label>{label}</Label>
          <Image src={SAMPLE} alt={`${label} image`} aspectRatio='16:9' width={width} />
        </View>
      ))}
    </View>
  );
}

// ─── 8. Corner radius ──────────────────────────────────────────────────────
//
// Web exposes `--Image-borderRadius` as a CSS custom property. On native,
// pass a `borderRadius` style to the outer wrapper — same effect, plus
// `overflow: hidden` is already on `styles.container` so the inner image
// is clipped without extra wiring.
//
// The native shape scale is t-shirt-sized (`xs`/`s`/`m`/`l`/`xl`/`2xl`/
// `3xl`) — fewer steps than the web 25-step f-scale, but the same
// progression visible as you walk the row.

export function ImageCornerRadius(): React.ReactElement {
  const shapeRows: { token: number; label: string }[] = [
    { token: tokens.shape.xs, label: 'XS' },
    { token: tokens.shape.s, label: 'S' },
    { token: tokens.shape.m, label: 'M' },
    { token: tokens.shape.l, label: 'L' },
    { token: tokens.shape.xl, label: 'XL' },
    { token: tokens.shape['2xl'], label: '2XL' },
    { token: tokens.shape['3xl'], label: '3XL' },
  ];

  const aspectGroups: { ratio: ImageAspectRatio; width: number }[] = [
    { ratio: '1:1', width: 120 },
    { ratio: '16:9', width: 180 },
    { ratio: '4:3', width: 160 },
  ];

  return (
    <View style={sectionGap}>
      {aspectGroups.map(({ ratio, width }) => (
        <View key={ratio}>
          <Label>{ratio}</Label>
          <View style={[row, { marginTop: tokens.spacing['3-5'] }]}>
            {shapeRows.map(({ token, label }) => (
              <View key={`${ratio}-${label}`} style={cell}>
                <Image
                  src={SAMPLE}
                  alt={`${ratio} ${label}`}
                  aspectRatio={ratio}
                  width={width}
                  style={{ borderRadius: token }}
                />
                <Label>{label}</Label>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Native-only extra: tile gallery ──────────────────────────────────────

export function ImageGallery(): React.ReactElement {
  return (
    <View style={[row, { gap: tokens.spacing['3-5'] } as ViewStyle]}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ width: 120 }}>
          <Image src={SAMPLE} alt={`Tile ${i + 1}`} aspectRatio='1:1' />
        </View>
      ))}
    </View>
  );
}

// ─── Back-compat aliases ───────────────────────────────────────────────────
//
// Earlier sample-app builds imported `ImageObjectFit` / `ImageFallback` —
// keep the names exported as aliases so existing apps don't break.

export { ImageObjectFitModes as ImageObjectFit };
export { ImageWithFallback as ImageFallback };
