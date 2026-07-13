/**
 * SurfaceInspectorScreen.tsx
 *
 * Native port of the web `Surface.inspector.stories.tsx`. A single-page,
 * 5-level nested-Surface inspector for cross-checking that `@oneui/ui-native`
 * remaps surface / content / state tokens correctly at every nesting depth.
 *
 * Each level paints its own fill via <Surface mode appearance>, shows a
 * mode + appearance picker (tap to cycle), and reports the resolved surface
 * step (read from SurfaceContext by a child node — the native equivalent of
 * web's `data-surface-step` attribute). Sample Buttons / Badges sit on each
 * fill so remapping is visible. The leaf level adds a content-token readout
 * and state-fill pills.
 *
 * Unlike web, native <Surface> takes a concrete appearance string (no `auto`
 * resolution inside the component), so `auto` is resolved here by walking the
 * level chain — exactly what web's inspector does in JS.
 */

import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import {
  Surface,
  useSurfaceTokens,
  useSurfaceContext,
  Button,
  Badge,
  CounterBadge,
  Icon,
  Avatar,
} from '@oneui/ui-native';
import type { SurfaceToken, ContentToken, SemanticIconName } from '@oneui/shared';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';


// ─── Constants ──────────────────────────────────────────────────────────────

const MODES: readonly SurfaceToken[] = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
  'blend',
];

// `auto` is selectable on every level except the root (root has no parent to
// inherit from). Resolution happens in the screen via `resolveChain`.
const APPEARANCES_WITH_AUTO: readonly string[] = ['auto', ...COMPONENT_APPEARANCE_ROLES];
const APPEARANCES_NO_AUTO: readonly string[] = [...COMPONENT_APPEARANCE_ROLES];

const ATTENTIONS = ['high', 'medium', 'low'] as const;

const STATE_PILL_MODES: readonly SurfaceToken[] = [
  'ghost',
  'blend',
  'minimal',
  'subtle',
  'bold',
];

const CONTENT_ROWS: ReadonlyArray<{ label: string; token: ContentToken }> = [
  { label: 'high', token: 'high' },
  { label: 'medium', token: 'medium' },
  { label: 'low', token: 'low' },
  { label: 'tinted', token: 'tinted' },
  { label: 'tintedA11y', token: 'tintedA11y' },
];

const STROKE_ROWS: ReadonlyArray<{ label: string; token: ContentToken }> = [
  { label: 'stroke medium', token: 'strokeMedium' },
  { label: 'stroke low', token: 'strokeLow' },
];

const ATTENTION_BUTTON_ICONS: Record<'high' | 'medium' | 'low', SemanticIconName> = {
  high: 'add',
  medium: 'info',
  low: 'help',
};

interface LevelState {
  mode: SurfaceToken;
  appearance: string;
}

// ─── Cycle-on-tap picker ──────────────────────────────────────────────────────

function CyclePicker(props: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (next: string) => void;
}): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  const next = (): void => {
    const i = props.options.indexOf(props.value);
    props.onChange(props.options[(i + 1) % props.options.length]);
  };
  return (
    <Pressable
      onPress={next}
      accessibilityRole='button'
      accessibilityLabel={`${props.label}: ${props.value}. Tap to cycle.`}
      style={({ pressed }) => [
        styles.picker,
        {
          borderColor: roles.content.strokeMedium,
          backgroundColor: pressed ? roles.states.pressed : 'transparent',
        },
      ]}
    >
      <Text style={[styles.pickerLabel, { color: roles.content.medium }]}>
        {props.label}
      </Text>
      <Text style={[styles.pickerValue, { color: roles.content.high }]}>
        {props.value} ›
      </Text>
    </Pressable>
  );
}

// ─── Step readout (reads its own SurfaceContext) ──────────────────────────────

function StepReadout(): React.ReactElement {
  const ctx = useSurfaceContext();
  const roles = useSurfaceTokens('neutral');
  return (
    <Text style={[styles.step, { color: roles.content.medium }]}>
      step{' '}
      <Text style={{ color: roles.content.high, fontWeight: typography.weight.medium }}>
        {ctx ? ctx.parentStep : '—'}
      </Text>
    </Text>
  );
}

// ─── Per-level toolbar + samples ──────────────────────────────────────────────

function LevelToolbar(props: {
  level: number;
  isRoot?: boolean;
  state: LevelState;
  resolvedAppearance: string;
  onMode: (m: SurfaceToken) => void;
  onAppearance: (a: string) => void;
}): React.ReactElement {
  const roles = useSurfaceTokens('neutral');
  return (
    <View style={styles.toolbar}>
      <View style={styles.toolbarRow}>
        <Text style={[styles.levelTag, { color: roles.content.high }]}>
          L{props.level}
        </Text>
        <CyclePicker
          label='Surface'
          value={props.state.mode}
          options={MODES}
          onChange={(v) => props.onMode(v as SurfaceToken)}
        />
        <CyclePicker
          label='Appearance'
          value={props.state.appearance}
          options={props.isRoot ? APPEARANCES_NO_AUTO : APPEARANCES_WITH_AUTO}
          onChange={props.onAppearance}
        />
        <StepReadout />
      </View>

      <View style={styles.samples}>
        {ATTENTIONS.map((attention) => (
          <Button
            key={`btn-${attention}`}
            attention={attention}
            size='s'
            appearance={props.resolvedAppearance as never}
            start={<Icon icon={ATTENTION_BUTTON_ICONS[attention]} />}
          >
            {attention === 'high' ? 'High' : attention === 'medium' ? 'Medium' : 'Low'}
          </Button>
        ))}
        {ATTENTIONS.map((attention, index) => (
          <Badge
            key={`badge-${attention}`}
            attention={attention}
            size='s'
            appearance={props.resolvedAppearance as never}
            start={
              <CounterBadge
                value={index + 1}
                size='xs'
                appearance={props.resolvedAppearance as never}
              />
            }
            end={<Avatar content="icon" appearance={props.resolvedAppearance} alt="Member" />}
          >
            {attention === 'high' ? 'High' : attention === 'medium' ? 'Medium' : 'Low'}
          </Badge>
        ))}
      </View>
    </View>
  );
}

// ─── Leaf: state pills + content readout ──────────────────────────────────────

function StatePills(props: { appearance: string }): React.ReactElement {
  return (
    <View style={styles.pills}>
      {STATE_PILL_MODES.map((m) => (
        <Surface key={m} mode={m} appearance={props.appearance} style={styles.pill}>
          <PillLabel mode={m} />
        </Surface>
      ))}
    </View>
  );
}

function PillLabel({ mode }: { mode: SurfaceToken }): React.ReactElement {
  // Inside the pill's own Surface context, `content.high` already contrasts
  // against the pill fill — the same token gives dark text on light pills and
  // light text on bold, automatically (the whole point of the checker).
  const roles = useSurfaceTokens('neutral');
  return (
    <Text style={[styles.pillText, { color: roles.content.high }]}>{mode}</Text>
  );
}

function ContentReadout(props: { appearance: string }): React.ReactElement {
  const roles = useSurfaceTokens(props.appearance);
  return (
    <View style={styles.readout}>
      {CONTENT_ROWS.map((row) => (
        <View key={row.label} style={styles.readoutRow}>
          <Text style={[styles.readoutLabel, { color: roles.content.medium }]}>
            {row.label}
          </Text>
          <View style={[styles.dot, { backgroundColor: roles.content[row.token] }]} />
          <Text
            style={[styles.readoutSample, { color: roles.content[row.token] }]}
            numberOfLines={1}
          >
            The quick brown fox
          </Text>
        </View>
      ))}
      {STROKE_ROWS.map((row) => (
        <View key={row.label} style={styles.readoutRow}>
          <Text style={[styles.readoutLabel, { color: roles.content.medium }]}>
            {row.label}
          </Text>
          <View
            style={[
              styles.strokeLine,
              { borderTopColor: roles.content[row.token] },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export function SurfaceInspectorScreen(): React.ReactElement {
  const page = useSurfaceTokens('neutral');

  // Defaults mirror the web inspector's stepped ladder.
  const [l1, setL1] = useState<LevelState>({ mode: 'minimal', appearance: 'primary' });
  const [l2, setL2] = useState<LevelState>({ mode: 'moderate', appearance: 'auto' });
  const [l3, setL3] = useState<LevelState>({ mode: 'subtle', appearance: 'auto' });
  const [l4, setL4] = useState<LevelState>({ mode: 'ghost', appearance: 'secondary' });
  const [l5, setL5] = useState<LevelState>({ mode: 'minimal', appearance: 'auto' });

  // Resolve `auto` by inheriting the parent's effective appearance, exactly
  // like web's inspector and <Surface> itself.
  const chain = [l1, l2, l3, l4, l5];
  let inherited = 'primary';
  const resolved = chain.map((lv) => {
    const eff = lv.appearance === 'auto' ? inherited : lv.appearance;
    inherited = eff;
    return eff;
  });

  return (
    <ScrollView
      style={{ backgroundColor: page.surfaces.default }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: page.content.high }]}>
          Nested Surface Inspector
        </Text>
        <Text style={[styles.subtitle, { color: page.content.medium }]}>
          Tap a Surface / Appearance value to cycle it. `auto` inherits the
          parent's effective appearance. The leaf adds a content readout and
          state pills.
        </Text>
      </View>

      <Surface mode={l1.mode} appearance={resolved[0]} style={styles.band}>
        <LevelToolbar
          level={1}
          isRoot
          state={l1}
          resolvedAppearance={resolved[0]}
          onMode={(mode) => setL1((p) => ({ ...p, mode }))}
          onAppearance={(appearance) => setL1((p) => ({ ...p, appearance }))}
        />
        <Surface mode={l2.mode} appearance={resolved[1]} style={styles.band}>
          <LevelToolbar
            level={2}
            state={l2}
            resolvedAppearance={resolved[1]}
            onMode={(mode) => setL2((p) => ({ ...p, mode }))}
            onAppearance={(appearance) => setL2((p) => ({ ...p, appearance }))}
          />
          <Surface mode={l3.mode} appearance={resolved[2]} style={styles.band}>
            <LevelToolbar
              level={3}
              state={l3}
              resolvedAppearance={resolved[2]}
              onMode={(mode) => setL3((p) => ({ ...p, mode }))}
              onAppearance={(appearance) => setL3((p) => ({ ...p, appearance }))}
            />
            <Surface mode={l4.mode} appearance={resolved[3]} style={styles.band}>
              <LevelToolbar
                level={4}
                state={l4}
                resolvedAppearance={resolved[3]}
                onMode={(mode) => setL4((p) => ({ ...p, mode }))}
                onAppearance={(appearance) => setL4((p) => ({ ...p, appearance }))}
              />
              <Surface mode={l5.mode} appearance={resolved[4]} style={styles.band}>
                <LevelToolbar
                  level={5}
                  state={l5}
                  resolvedAppearance={resolved[4]}
                  onMode={(mode) => setL5((p) => ({ ...p, mode }))}
                  onAppearance={(appearance) => setL5((p) => ({ ...p, appearance }))}
                />
                <StatePills appearance={resolved[4]} />
                <ContentReadout appearance={resolved[4]} />
              </Surface>
            </Surface>
          </Surface>
        </Surface>
      </Surface>
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  content: {
    padding: tokens.spacing['2'],
    gap: tokens.spacing['2'],
  },
  header: {
    gap: tokens.spacing['1'],
    marginBottom: tokens.spacing['1'],
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.high,
  },
  subtitle: {
    fontSize: typography.size.s,
  },
  band: {
    padding: tokens.spacing['4'],
    borderRadius: tokens.shape.m,
    gap: tokens.spacing['2'],
  },
  toolbar: {
    gap: tokens.spacing['2'],
  },
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacing['2'],
  },
  levelTag: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.high,
  },
  picker: {
    borderWidth: tokens.borderWidth.hairline,
    borderRadius: tokens.shape.xs,
    paddingHorizontal: tokens.spacing['2'],
    paddingVertical: tokens.spacing['1'],
    gap: 2,
  },
  pickerLabel: {
    fontSize: typography.size['2xs'],
    fontWeight: typography.weight.medium,
    textTransform: 'uppercase',
  },
  pickerValue: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  step: {
    fontSize: typography.size.xs,
    marginLeft: 'auto',
  },
  samples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens.spacing['1-5'],
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: tokens.spacing['1'],
    marginTop: tokens.spacing['1-5'],
  },
  pill: {
    paddingHorizontal: tokens.spacing['2'],
    paddingVertical: tokens.spacing['1'],
    borderRadius: tokens.shape.pill,
  },
  pillText: {
    fontSize: typography.size.s,
    fontWeight: typography.weight.medium,
  },
  readout: {
    gap: tokens.spacing['1'],
    marginTop: tokens.spacing['1-5'],
  },
  readoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing['1-5'],
  },
  readoutLabel: {
    width: 96,
    fontSize: typography.size.xs,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: tokens.shape.pill,
  },
  readoutSample: {
    flexShrink: 1,
    fontSize: typography.size.m,
    fontWeight: typography.weight.medium,
  },
  strokeLine: {
    flex: 1,
    height: 0,
    borderTopWidth: tokens.borderWidth.hairline,
  },
});
