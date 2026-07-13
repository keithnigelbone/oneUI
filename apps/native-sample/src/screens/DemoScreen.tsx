/**
 * DemoScreen.tsx
 *
 * Native equivalent of v4-sample's DemoPage — five nested `<Surface>`
 * containers with a per-level surface-mode picker. The nested `Surface`
 * component handles the cascade automatically (`resolveSurface` ←
 * `resolveNativeContextRoles`), so each child reads its own resolved
 * roles via `useSurfaceTokens`.
 *
 * The leaf container exposes interactive Pressables for hover / pressed
 * preview. Hover is rendered statically (RN has no hover); pressed is
 * driven by the Pressable render-prop.
 */

import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import {
  Surface,
  useSurfaceContext,
  useSurfaceTokens,
  type SurfaceToken,
} from '@oneui/ui-native';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Section } from '../shared/Section';
import { SURFACE_TOKENS } from '../tokens';
import { usePageContext } from '../PageContext';

const LEVELS = 5;
const DEFAULT_MODES: SurfaceToken[] = ['default', 'minimal', 'minimal', 'bold', 'subtle'];

export function DemoScreen(): React.ReactElement {
  const [modes, setModes] = useState<SurfaceToken[]>(DEFAULT_MODES);
  const { appearance } = usePageContext();

  const setMode = (level: number, mode: SurfaceToken) => {
    setModes((prev) => {
      const next = [...prev];
      next[level] = mode;
      return next;
    });
  };

  return (
    <ScreenScaffold
      title='Demo'
      description={`Five nested Surface boundaries (appearance: ${appearance}). Each picker remaps that level's mode; descendants re-resolve automatically.`}
    >
      <Section
        title='Nested cascade'
        description='Watch the resolved step in each level update as you change a mode — surfaces parent off their parent, not the page.'
      >
        <NestedLevels
          modes={modes}
          appearance={appearance}
          onChange={setMode}
          level={0}
        />
      </Section>
    </ScreenScaffold>
  );
}

interface NestedLevelsProps {
  modes: SurfaceToken[];
  appearance: string;
  onChange: (level: number, mode: SurfaceToken) => void;
  level: number;
}

function NestedLevels({
  modes,
  appearance,
  onChange,
  level,
}: NestedLevelsProps): React.ReactElement | null {
  if (level >= LEVELS) {
    return <LeafContent />;
  }
  const mode = modes[level];
  return (
    <Surface mode={mode} appearance={appearance} style={styles.surface}>
      <LevelHeader level={level} mode={mode} onChange={(m) => onChange(level, m)} />
      <NestedLevels modes={modes} appearance={appearance} onChange={onChange} level={level + 1} />
    </Surface>
  );
}

interface LevelHeaderProps {
  level: number;
  mode: SurfaceToken;
  onChange: (mode: SurfaceToken) => void;
}

function LevelHeader({ level, mode, onChange }: LevelHeaderProps): React.ReactElement {
  const ctx = useSurfaceContext();
  const roles = useSurfaceTokens('neutral');
  return (
    <View style={styles.levelHeader}>
      <View style={styles.levelLabelRow}>
        <Text
          style={{
            color: roles.content.high,
            fontSize: typography.size.s,
            fontWeight: typography.weight.high,
          }}
        >
          Level {level + 1}
        </Text>
        <Text
          style={{
            color: roles.content.medium,
            fontSize: typography.size['2xs'],
          }}
        >
          step {ctx.parentStep}
        </Text>
      </View>
      <View style={styles.modeRow}>
        {SURFACE_TOKENS.map((option) => {
          const active = option === mode;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole='button'
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Set level ${level + 1} mode to ${option}`}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: active
                    ? roles.surfaces.bold
                    : pressed
                    ? roles.states.pressed
                    : 'transparent',
                  borderColor: active ? roles.surfaces.bold : roles.content.strokeMedium,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? roles.onBoldContent.high : roles.content.high,
                  fontSize: typography.size['2xs'],
                  fontWeight: typography.weight.medium,
                }}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LeafContent(): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  return (
    <View style={styles.leaf}>
      <Text
        style={{
          color: roles.content.high,
          fontSize: typography.size.l,
          fontWeight: typography.weight.high,
        }}
      >
        Leaf content
      </Text>
      <Text
        style={{
          color: roles.content.medium,
          fontSize: typography.size.s,
        }}
      >
        Content tokens read against this leaf's resolved surface — content/high, content/medium, content/low all adapt to the cascade.
      </Text>
      <View style={styles.statesRow}>
        <Pressable
          accessibilityRole='button'
          accessibilityLabel='Live press preview'
          style={({ pressed }) => [
            styles.stateButton,
            {
              backgroundColor: pressed ? primary.states.pressed : primary.surfaces.bold,
            },
          ]}
        >
          {({ pressed }) => (
            <Text
              style={{
                color: primary.onBoldContent.high,
                fontSize: typography.size.s,
                fontWeight: typography.weight.medium,
              }}
            >
              {pressed ? 'pressed' : 'tap me'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    padding: tokens.spacing['3-5'],
    borderRadius: tokens.shape.m,
    gap: tokens.spacing['3-5'],
  },
  levelHeader: {
    gap: tokens.spacing['2-5'],
  },
  levelLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  modeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['2'],
  },
  chip: {
    paddingHorizontal: tokens.spacing['2-5'],
    paddingVertical: tokens.spacing['1-5'],
    borderRadius: tokens.shape.pill,
    borderWidth: tokens.borderWidth.hairline,
  },
  leaf: {
    gap: tokens.spacing['2-5'],
    padding: tokens.spacing['3-5'],
  },
  statesRow: {
    flexDirection: 'row',
    gap: tokens.spacing['3-5'],
  },
  stateButton: {
    paddingHorizontal: tokens.spacing['4'],
    paddingVertical: tokens.spacing['2-5'],
    borderRadius: tokens.shape.s,
  },
});
