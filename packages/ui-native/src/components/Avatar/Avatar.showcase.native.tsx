/**
 * Avatar.showcase.native.tsx
 *
 * RN mirror of `Avatar.showcase.tsx` plus story-aligned sections from
 * `Avatar.stories.tsx` (Appearances, Themes, Surface Context, With Icons).
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { Surface, useSurfaceTokens } from '../../theme';
import { Avatar } from './Avatar.native';
import { Icon } from '../Icon';
import { type AvatarProps } from './interface';

const SAMPLE_IMAGE =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop';

/** Appearances grid — same subset idea as web stories (omit sparkle / brand-bg for typical demo brands). */
const DEFAULT_APPEARANCE_ROLES = COMPONENT_APPEARANCE_ROLES.filter(
  (r) => r !== 'sparkle' && r !== 'brand-bg'
);

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
  flexDirection: 'column',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
};

const rowLabel: StyleProp<ViewStyle> = {
  minWidth: tokens.spacing['8'],
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text
      style={{
        fontSize: typography.size.xs,
        color: role.content.low,
      }}
    >
      {children}
    </Text>
  );
}

/**
 * Inline glyphs rendered inside `Avatar`'s `<AvatarIconSlot>` Surface.
 * Read color from `useSurfaceTokens('neutral')` — the Avatar Surface remaps
 * neutral content tokens to the on-bold / on-subtle variant automatically,
 * so the same hook gives the right colour in every Avatar attention.
 */

function RenderIcon(): React.ReactElement {
  return <Icon icon={'heart'} />;
}

export function AvatarDefault(): React.ReactElement {
  return (
    <View style={column}>
      <Avatar content="image" src={SAMPLE_IMAGE} alt="John Doe" size="m" attention="high" />
    </View>
  );
}

export function AvatarVariants(): React.ReactElement {
  return (
    <View style={row}>
      {(
        [
          { content: 'image' as const, label: 'Image' },
          { content: 'icon' as const, label: 'Icon' },
          { content: 'text' as const, label: 'Text' },
        ] as const
      ).map(({ content, label }) => (
        <View key={content} style={labeledItem}>
          <Avatar
            content={content}
            alt="John Smith"
            size="xl"
            src={content === 'image' ? SAMPLE_IMAGE : undefined}
            icon={content === 'icon' ? <RenderIcon /> : undefined}
          />
          <Label>{label}</Label>
        </View>
      ))}
    </View>
  );
}

export function AvatarAttentionLevels(): React.ReactElement {
  return (
    <View style={column}>
      {(['image', 'icon', 'text'] as const).map((contentMode) => (
        <View
          key={contentMode}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}
        >
          <View style={rowLabel}>
            <Label>{contentMode}</Label>
          </View>
          <View style={row}>
            {(['high', 'medium', 'low'] as const).map((attention) => (
              <Avatar
                key={attention}
                content={contentMode}
                alt="John Smith"
                size="xl"
                attention={attention}
                src={contentMode === 'image' ? SAMPLE_IMAGE : undefined}
                icon={contentMode === 'icon' ? <RenderIcon /> : undefined}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function AvatarSizes(): React.ReactElement {
  return (
    <View style={column}>
      {(['image', 'icon', 'text'] as const).map((contentMode) => (
        <View
          key={contentMode}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['4'] }}
        >
          <View style={rowLabel}>
            <Label>{contentMode}</Label>
          </View>
          <View style={row}>
            {(['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl'] as const).map((size) => (
              <View key={size} style={labeledItem}>
                <Avatar
                  content={contentMode}
                  alt="John Smith"
                  size={size}
                  src={contentMode === 'image' ? SAMPLE_IMAGE : undefined}
                  icon={contentMode === 'icon' ? <RenderIcon /> : undefined}
                />
                <Label>{size.toUpperCase()}</Label>
              </View>
            ))}
            <View style={labeledItem}>
              <Avatar
                content={contentMode}
                alt="John Smith"
                size="custom"
                customSize={tokens.shape['5xl']}
                src={contentMode === 'image' ? SAMPLE_IMAGE : undefined}
                icon={contentMode === 'icon' ? <RenderIcon /> : undefined}
              />
              <Label>Custom</Label>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

export function AvatarStates(): React.ReactElement {
  return (
    <View style={row}>
      <View style={labeledItem}>
        <Avatar content="icon" alt="User" size="2xl" icon={<RenderIcon />} />
        <Label>Default</Label>
      </View>
      <View style={labeledItem}>
        <Avatar content="icon" alt="User" size="2xl" disabled icon={<RenderIcon />} />
        <Label>Disabled</Label>
      </View>
      <View style={labeledItem}>
        <Avatar content="text" alt="JS" size="2xl" />
        <Label>Default</Label>
      </View>
      <View style={labeledItem}>
        <Avatar content="text" alt="JS" size="2xl" disabled />
        <Label>Disabled</Label>
      </View>
      <View style={labeledItem}>
        <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="2xl" />
        <Label>Default</Label>
      </View>
      <View style={labeledItem}>
        <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="2xl" disabled />
        <Label>Disabled</Label>
      </View>
    </View>
  );
}

export function AvatarImageFallback(): React.ReactElement {
  return (
    <View style={row}>
      <View style={labeledItem}>
        <Avatar content="image" src={SAMPLE_IMAGE} alt="John Doe" size="xl" />
        <Label>Valid Image</Label>
      </View>
      <View style={labeledItem}>
        <Avatar
          content="image"
          src="https://invalid.example/broken.jpg"
          alt="Jane Smith"
          size="xl"
        />
        <Label>Broken → Icon</Label>
      </View>
      <View style={labeledItem}>
        <Avatar
          content="image"
          src="https://invalid.example/broken.jpg"
          alt="User"
          size="xl"
          fallback={<RenderIcon />}
        />
        <Label>Custom Fallback</Label>
      </View>
    </View>
  );
}

export function AvatarAppearances(): React.ReactElement {
  return (
    <View style={column}>
      {DEFAULT_APPEARANCE_ROLES.map((role) => (
        <View
          key={role}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
            flexWrap: 'wrap',
          }}
        >
          <View style={{ minWidth: tokens.spacing['8'] }}>
            <Label>{role}</Label>
          </View>
          <View style={row}>
            <Avatar
              content="icon"
              alt="User"
              size="xl"
              appearance={role}
              attention="high"
              icon={<RenderIcon />}
            />
            <Avatar
              content="icon"
              alt="User"
              size="xl"
              appearance={role}
              attention="medium"
              icon={<RenderIcon />}
            />
            <Avatar
              content="icon"
              alt="User"
              size="xl"
              appearance={role}
              attention="low"
              icon={<RenderIcon />}
            />
            <Avatar content="text" alt="JS" size="xl" appearance={role} attention="high" />
            <Avatar content="text" alt="JS" size="xl" appearance={role} attention="medium" />
            <Avatar content="text" alt="JS" size="xl" appearance={role} attention="low" />
          </View>
        </View>
      ))}
      <Label>
        Sparkle and brand-bg omitted in most demo brands (unconfigured roles fall back).
      </Label>
    </View>
  );
}

const themeCell: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: tokens.spacing['3-5'],
  padding: tokens.spacing['4-5'],
  borderRadius: tokens.shape.m,
};

export function AvatarThemes(): React.ReactElement {
  const bgModes = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'elevated' as const, label: 'elevated' },
  ];

  return (
    <View style={column}>
      {bgModes.map(({ mode, label }) => (
        <View
          key={mode}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: tokens.spacing['4'],
            flexWrap: 'wrap',
          }}
        >
          <View style={{ width: tokens.spacing['8'] }}>
            <Label>{label}</Label>
          </View>
          <Surface mode={mode} style={themeCell}>
            <Avatar content="icon" alt="User" size="xl" attention="high" icon={<RenderIcon />} />
            <Avatar content="icon" alt="User" size="xl" attention="medium" icon={<RenderIcon />} />
            <Avatar content="icon" alt="User" size="xl" attention="low" icon={<RenderIcon />} />
            <Avatar content="text" alt="JS" size="xl" attention="high" />
            <Avatar content="text" alt="JS" size="xl" attention="medium" />
            <Avatar content="text" alt="JS" size="xl" attention="low" />
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function AvatarSurfaceContext(): React.ReactElement {
  const surfaceModes = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'moderate' as const, label: 'moderate' },
    { mode: 'bold' as const, label: 'bold' },
    { mode: 'elevated' as const, label: 'elevated' },
  ];

  const avatarRow = (
    <>
      <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size="xl" attention="high" />
      <Avatar content="icon" alt="User" size="xl" attention="high" icon={<RenderIcon />} />
      <Avatar content="icon" alt="User" size="xl" attention="medium" icon={<RenderIcon />} />
      <Avatar content="icon" alt="User" size="xl" attention="low" icon={<RenderIcon />} />
      <Avatar content="text" alt="JS" size="xl" attention="high" />
      <Avatar content="text" alt="JS" size="xl" attention="medium" />
      <Avatar content="text" alt="JS" size="xl" attention="low" />
    </>
  );

  return (
    <View style={column}>
      {surfaceModes.map(({ mode, label }) => (
        <View key={mode} style={{ flexDirection: 'column', gap: tokens.spacing['3-5'] }}>
          <Label>{label}</Label>
          <Surface mode={mode} style={themeCell}>
            {avatarRow}
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function AvatarWithIcons(): React.ReactElement {
  return (
    <View style={row}>
      <Avatar content="icon" alt="User" size="xl" icon={<RenderIcon />} />
      <Avatar content="icon" alt="Star" size="xl" icon={<Icon icon={'star'} />} />
      <Avatar content="icon" alt="Check" size="xl" icon={<Icon icon={'check'} />} />
    </View>
  );
}

/* ============================================================================
 * Responsive — image / icon / text across S / M / L sizes.
 * Mirrors web `Responsive` story.
 * ========================================================================= */
export function AvatarResponsive(): React.ReactElement {
  return (
    <View style={column}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <View
          key={size}
          style={{ flexDirection: 'row', alignItems: 'center', gap: tokens.spacing['3-5'] }}
        >
          <Avatar content="image" src={SAMPLE_IMAGE} alt="User" size={size} />
          <Avatar content="icon" alt="User" size={size} icon={<RenderIcon />} />
          <Avatar content="text" alt="JS" size={size} />
        </View>
      ))}
    </View>
  );
}

export function AvatarPlayground(): React.ReactElement {
  const layoutProps: Pick<AvatarProps, 'appearance' | 'size'> = {
    appearance: 'primary',
    size: 'l',
  };

  return (
    <View style={column}>
      <Avatar content="image" src={SAMPLE_IMAGE} alt="User" {...layoutProps} />
      <Avatar
        content="icon"
        alt="Icon"
        icon={<Icon icon={'heart'} />}
        {...layoutProps}
        attention="high"
      />
      <Avatar
        content="icon"
        alt="Icon"
        icon={<Icon icon={'heart'} />}
        {...layoutProps}
        attention="medium"
      />
      <Avatar
        content="icon"
        alt="Icon"
        icon={<Icon icon={'heart'} />}
        {...layoutProps}
        attention="low"
      />
      <Avatar content="text" alt="J S" {...layoutProps} attention="high" />
      <Avatar content="text" alt="J S" {...layoutProps} attention="medium" />
      <Avatar content="text" alt="J S" {...layoutProps} attention="low" />
    </View>
  );
}

/**
 * AvatarMetallicMaterial — high-attention (bold) avatars render a metallic
 * gradient fill when the active brand assigns a metal to the primary role.
 * Use the Tira brand in the sample app to see the gold gradient.
 */
export function AvatarMetallicMaterial(): React.ReactElement {
  return (
    <View style={{ flexDirection: 'column', gap: tokens.spacing['4'] }}>
      <Text style={{ fontSize: typography.size.xs, color: 'gray' }}>
        High (primary) — gold gradient on Tira, solid on other brands
      </Text>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['4'], flexWrap: 'wrap' }}>
        <Avatar content="icon" alt="Icon" attention="high" appearance="primary" size="2xs" />
        <Avatar content="icon" alt="Icon" attention="high" appearance="primary" size="xs" />
        <Avatar content="icon" alt="Icon" attention="high" appearance="primary" size="s" />
        <Avatar content="icon" alt="Icon" attention="high" appearance="primary" size="m" />
        <Avatar content="icon" alt="Icon" attention="high" appearance="primary" size="l" />
        <Avatar content="icon" alt="Icon" attention="high" appearance="primary" size="xl" />
      </View>
      <Text style={{ fontSize: typography.size.xs, color: 'gray' }}>
        Text initials on gold
      </Text>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['4'], flexWrap: 'wrap' }}>
        <Avatar content="text" alt="J S" attention="high" appearance="primary" size="s" />
        <Avatar content="text" alt="J S" attention="high" appearance="primary" size="m" />
        <Avatar content="text" alt="J S" attention="high" appearance="primary" size="l" />
      </View>
      <Text style={{ fontSize: typography.size.xs, color: 'gray' }}>
        Medium + Low — never metallic
      </Text>
      <View style={{ flexDirection: 'row', gap: tokens.spacing['4'] }}>
        <Avatar content="icon" alt="Icon" attention="medium" appearance="primary" size="m" />
        <Avatar content="icon" alt="Icon" attention="low" appearance="primary" size="m" />
      </View>
    </View>
  );
}
