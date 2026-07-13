/**
 * Scrim.showcase.native.tsx
 *
 * Native-only showcase — no web Storybook peer. Proves the prop contract end-to-end.
 */

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Image } from '../Image/Image.native';
import { Scrim } from './Scrim.native';
import { Surface, useSurfaceTokens } from '../../theme';
import type { ScrimAttention, ScrimPosition, ScrimProps, ScrimSize } from './interface';

const ATTENTION_LEVELS = ['low', 'medium', 'high'] as const satisfies readonly ScrimAttention[];
const SCRIM_DEMO_SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const satisfies readonly ScrimSize[];

const PORTRAIT_IMAGE =
  'https://images.unsplash.com/photo-1780737213141-707e3dbc6c6a?q=80&w=2344&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=400&h=600&fit=crop';

function frameHeightForWidth(width: number, aspectW = 16, aspectH = 9): number {
  return Math.round((width * aspectH) / aspectW);
}

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['5'],
  width: '100%',
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium as '500',
        color: role.content.medium,
      }}
    >
      {children}
    </Text>
  );
}

function ScrimFrame({
  label,
  children,
  height = tokens.spacing['24'],
}: {
  label: string;
  children: React.ReactNode;
  height?: number;
}): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View style={{ gap: tokens.spacing['2'], width: '100%' }}>
      <Label>{label}</Label>
      <View
        style={{
          width: '100%',
          height,
          borderRadius: tokens.shape.s,
          overflow: 'hidden',
          backgroundColor: role.surfaces.subtle,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: tokens.spacing['4'],
          }}
        >
          <Text style={{ fontSize: typography.size.s, color: role.content.high }}>
            Content beneath
          </Text>
        </View>
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          pointerEvents="none"
        >
          {children}
        </View>
      </View>
    </View>
  );
}

export function ScrimDefault(): React.ReactElement {
  return (
    <View style={column}>
      <ScrimFrame label="Default (bottom / XS / medium / gradient)">
        <Scrim />
      </ScrimFrame>
    </View>
  );
}

/** Single size=S demo per edge — quick position reference. */
export function ScrimGradientPositions(): React.ReactElement {
  const edges = [
    { position: 'bottom' as const, label: 'position: bottom' },
    { position: 'start' as const, label: 'position: left' },
    { position: 'top' as const, label: 'position: top' },
    { position: 'end' as const, label: 'position: right' },
  ];
  return (
    <View style={column}>
      {edges.map(({ position, label }) => (
        <GradientDemoSquare
          key={position}
          label={label}
          position={position}
          size="S"
          attention="medium"
        />
      ))}
    </View>
  );
}

export function ScrimPositions(): React.ReactElement {
  return (
    <View style={column}>
      <ScrimFrame label="position=bottom size=L attention=high">
        <Scrim position="bottom" size="L" attention="high" />
      </ScrimFrame>
      <ScrimFrame label="position=top size=S attention=low">
        <Scrim position="top" size="S" attention="low" />
      </ScrimFrame>
      <ScrimFrame label="position=start size=M attention=medium">
        <Scrim position="start" size="M" attention="medium" />
      </ScrimFrame>
      <ScrimFrame label="position=end size=M attention=medium">
        <Scrim position="end" size="M" attention="medium" />
      </ScrimFrame>
    </View>
  );
}

function GradientDemoSquare({
  label,
  position,
  size,
  attention,
}: {
  label: string;
  position: ScrimPosition;
  size: ScrimSize;
  attention: ScrimAttention;
}): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <View style={{ gap: tokens.spacing['2'], width: '100%' }}>
      <Label>{label}</Label>
      <View
        style={{
          width: '100%',
          aspectRatio: 1,
          borderRadius: tokens.shape.s,
          overflow: 'hidden',
          backgroundColor: role.surfaces.default,
        }}
      >
        <Scrim variant="gradient" position={position} size={size} attention={attention} />
      </View>
    </View>
  );
}

function SizePositionShowcase({
  position,
  positionLabel,
  attention = 'medium',
}: {
  position: 'bottom' | 'top' | 'start' | 'end';
  positionLabel: string;
  attention?: ScrimAttention;
}): React.ReactElement {
  return (
    <View style={column}>
      {SCRIM_DEMO_SIZES.map((size) => (
        <GradientDemoSquare
          key={size}
          label={`size=${size} position=${positionLabel} attention=${attention}`}
          position={position}
          size={size}
          attention={attention}
        />
      ))}
    </View>
  );
}

function AttentionPositionShowcase({
  position,
  positionLabel,
  size = 'L',
}: {
  position: 'bottom' | 'top' | 'start' | 'end' | 'center';
  positionLabel: string;
  size?: ScrimSize;
}): React.ReactElement {
  const paintKind =
    size === 'full' || position === 'center' ? 'flat tint' : 'edge gradient';
  return (
    <View style={column}>
      {ATTENTION_LEVELS.map((attention) => (
        <GradientDemoSquare
          key={attention}
          label={`attention=${attention} size=${size} position=${positionLabel} · ${paintKind}`}
          position={position}
          size={size}
          attention={attention}
        />
      ))}
    </View>
  );
}

/** Figma parity — bottom row, XS→XL stacked for mobile. */
export function ScrimSizeBottom(): React.ReactElement {
  return <SizePositionShowcase position="bottom" positionLabel="bottom" />;
}

/** Figma parity — left (start) row, XS→XL stacked for mobile. */
export function ScrimSizeStart(): React.ReactElement {
  return <SizePositionShowcase position="start" positionLabel="left" />;
}

/** Figma parity — top row, XS→XL stacked for mobile. */
export function ScrimSizeTop(): React.ReactElement {
  return <SizePositionShowcase position="top" positionLabel="top" />;
}

/** Figma parity — right (end) row, XS→XL stacked for mobile. */
export function ScrimSizeEnd(): React.ReactElement {
  return <SizePositionShowcase position="end" positionLabel="right" />;
}

export function ScrimSizes(): React.ReactElement {
  return <ScrimSizeBottom />;
}

/** Edge scale (25% / 50% / 95%) — bottom, size L. */
export function ScrimAttentionBottom(): React.ReactElement {
  return <AttentionPositionShowcase position="bottom" positionLabel="bottom" size="L" />;
}

export function ScrimAttentionStart(): React.ReactElement {
  return <AttentionPositionShowcase position="start" positionLabel="left" size="L" />;
}

export function ScrimAttentionTop(): React.ReactElement {
  return <AttentionPositionShowcase position="top" positionLabel="top" size="L" />;
}

export function ScrimAttentionEnd(): React.ReactElement {
  return <AttentionPositionShowcase position="end" positionLabel="right" size="L" />;
}

/** Full-coverage flat tint (17% / 33% / 50%) — size full, all positions. */
export function ScrimSizeFullBottom(): React.ReactElement {
  return <AttentionPositionShowcase position="bottom" positionLabel="bottom" size="full" />;
}

export function ScrimSizeFullStart(): React.ReactElement {
  return <AttentionPositionShowcase position="start" positionLabel="left" size="full" />;
}

export function ScrimSizeFullTop(): React.ReactElement {
  return <AttentionPositionShowcase position="top" positionLabel="top" size="full" />;
}

export function ScrimSizeFullEnd(): React.ReactElement {
  return <AttentionPositionShowcase position="end" positionLabel="right" size="full" />;
}

export function ScrimSizeFullCenter(): React.ReactElement {
  return <AttentionPositionShowcase position="center" positionLabel="center" size="full" />;
}

export function ScrimAttention(): React.ReactElement {
  return (
    <View style={column}>
      {ATTENTION_LEVELS.map((attention) => (
        <ScrimFrame key={attention} label={`attention=${attention} position=bottom size=XL (edge scale)`}>
          <Scrim position="bottom" size="XL" attention={attention} />
        </ScrimFrame>
      ))}
    </View>
  );
}

export function ScrimOverlay(): React.ReactElement {
  return (
    <View style={column}>
      <ScrimFrame
        label="Modal overlay (variant=overlay size=full attention=high)"
        height={tokens.spacing['28']}
      >
        <Scrim variant="overlay" position="center" size="full" attention="high" />
      </ScrimFrame>
      <ScrimFrame label="Medium overlay (attention=medium)" height={tokens.spacing['28']}>
        <Scrim variant="overlay" position="center" size="full" attention="medium" />
      </ScrimFrame>
    </View>
  );
}

function ImageScrimFrame({
  label,
  scrimProps,
  imageSrc = PORTRAIT_IMAGE,
  imageAlt = 'Photo beneath scrim',
  imageWidth = 320,
  aspectRatio = '16:9' as const,
}: {
  label: string;
  scrimProps: ScrimProps;
  imageSrc?: string;
  imageAlt?: string;
  imageWidth?: number;
  aspectRatio?: '16:9' | '3:4' | '1:1';
}): React.ReactElement {
  const [aspectW, aspectH] =
    aspectRatio === '3:4' ? [3, 4] : aspectRatio === '1:1' ? [1, 1] : [16, 9];
  const frameHeight = frameHeightForWidth(imageWidth, aspectW, aspectH);

  return (
    <View style={{ gap: tokens.spacing['2'], width: '100%' }}>
      <Label>{label}</Label>
      <View
        style={{
          width: imageWidth,
          height: frameHeight,
          alignSelf: 'center',
          position: 'relative',
          borderRadius: tokens.shape.s,
          overflow: 'hidden',
        }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={frameHeight}
          objectFit="cover"
          fallbackSrc={PORTRAIT_IMAGE}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Scrim {...scrimProps} />
        </View>
      </View>
    </View>
  );
}

/** Scrim layered over a real {@link Image} — typical carousel / hero / modal backdrop. */
export function ScrimOverImage(): React.ReactElement {
  return (
    <View style={column}>
      <ImageScrimFrame
        label="Bottom fade over image (position=bottom size=L attention=high)"
        scrimProps={{ position: 'bottom', size: 'L', attention: 'high' }}
      />
      <ImageScrimFrame
        label="Top scroll hint (position=top size=L attention=high)"
        scrimProps={{ position: 'top', size: 'L', attention: 'high' }}
      />
      <ImageScrimFrame
        label="Modal dimming (variant=overlay size=full attention=high)"
        imageSrc={PORTRAIT_IMAGE}
        imageAlt="Portrait photo beneath modal scrim"
        aspectRatio="3:4"
        imageWidth={280}
        scrimProps={{
          variant: 'overlay',
          position: 'center',
          size: 'full',
          attention: 'high',
        }}
      />
    </View>
  );
}

export function ScrimSurfaceContext(): React.ReactElement {
  const modes = ['default', 'subtle', 'bold'] as const;
  return (
    <View style={column}>
      {modes.map((mode) => (
        <Surface
          key={mode}
          mode={mode}
          style={{ width: '100%', borderRadius: tokens.shape.s, overflow: 'hidden' }}
        >
          <ScrimFrame label={`Inside Surface mode=${mode}`} height={tokens.spacing['20']}>
            <Scrim position="bottom" size="L" attention="high" />
          </ScrimFrame>
        </Surface>
      ))}
    </View>
  );
}
