/**
 * Surface.transparent-inspector.stories.tsx
 *
 * Cross-checking inspector for nested Surface combinations under
 * `material="transparent"`. Mirrors Surface.inspector.stories.tsx but
 * every level renders as a transparent material surface, and a top-level
 * `mediaContext` picker (dynamic / dark / light) drives the entire tree.
 *
 * The point of this story is to expose:
 *   - Per-mode fill emission (esp. ghost — bug-prone because the non-
 *     transparent ghost rule falls through to --Surface-Self-Color).
 *   - Per-mode text-token remapping (esp. bold — its contentVariant flips
 *     vs. default in every media context).
 *   - Nesting against a busy gradient background, which is what
 *     transparent material is actually for.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Surface, type SurfaceMode } from './Surface';
import type { MediaContext } from '@oneui/shared/engine';
import type { ComponentAppearance, SemanticIconName } from '@oneui/shared';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import { Button } from '../Button/Button';
import { Badge } from '../Badge/Badge';
import { CounterBadge } from '../CounterBadge/CounterBadge';
import { Avatar } from '../Avatar/Avatar';

const meta: Meta = {
  title: 'Components/Containers/Surface/Transparent Inspector',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Cross-checking inspector for nested Surface combinations under material="transparent". Pick a media context at the root and a mode + appearance per level. Every Surface in the chain renders as transparent material, sitting on a saturated gradient that exposes per-mode opacity differences and content-token contrast.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// ─── Constants ────────────────────────────────────────────────────────────────

const MODES: SurfaceMode[] = [
  'default',
  'ghost',
  'minimal',
  'subtle',
  'moderate',
  'bold',
  'elevated',
  'blend',
];

const MEDIA_CONTEXTS: MediaContext[] = ['dynamic', 'dark', 'light'];

const APPEARANCES_WITH_AUTO: ComponentAppearance[] = ['auto', ...COMPONENT_APPEARANCE_ROLES];
const APPEARANCES_NO_AUTO: ComponentAppearance[] = [...COMPONENT_APPEARANCE_ROLES];

/** Gradient backdrops per media context — chosen to expose per-mode opacity. */
const BACKDROPS: Record<MediaContext, string> = {
  dynamic:
    'linear-gradient(135deg, #0b0d2c 0%, #1d3a8a 35%, #2a8aa8 70%, #6cd0ce 100%)',
  dark: 'linear-gradient(135deg, #0a0a0f 0%, #1a1b2e 50%, #20243a 100%)',
  light: 'linear-gradient(135deg, #fef8ef 0%, #ffe3c2 50%, #ffcfa0 100%)',
};

// ─── Field (label-above-select pair) ──────────────────────────────────────────

function Field<T extends string>(props: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-0)',
        fontFamily: 'var(--Typography-Font-Primary)',
        fontSize: 'var(--Label-XS-FontSize)',
        lineHeight: 'var(--Label-XS-LineHeight)',
        fontWeight: 'var(--Label-FontWeight-Medium)',
        color: 'var(--Text-Medium)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      <span>{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as T)}
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Medium)',
          color: 'var(--Text-High)',
          background: 'transparent',
          border: 'var(--Stroke-M) solid var(--Border-Subtle)',
          borderRadius: 'var(--Shape-3XS)',
          padding: 'var(--Spacing-0-5) var(--Spacing-1)',
          minWidth: '11ch',
          textTransform: 'none',
          letterSpacing: 'normal',
        }}
      >
        {props.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

const ATTENTION_BUTTON_ICONS: Record<'high' | 'medium' | 'low', SemanticIconName> = {
  high: 'checkCircle',
  medium: 'info',
  low: 'help',
};

// ─── Level toolbar ────────────────────────────────────────────────────────────

function LevelToolbar(props: {
  level: number;
  isRoot?: boolean;
  mode: SurfaceMode;
  appearance: ComponentAppearance;
  step: string | null;
  onMode: (m: SurfaceMode) => void;
  onAppearance: (a: ComponentAppearance) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: 'var(--Spacing-1-5)',
        rowGap: 'var(--Spacing-1)',
        marginBottom: 'var(--Spacing-1-5)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Medium)',
          color: 'var(--Text-High)',
          paddingBottom: 'var(--Spacing-0)',
          marginRight: 'var(--Spacing-1)',
        }}
      >
        L{props.level}
      </span>
      <Field label="Surface" value={props.mode} options={MODES} onChange={props.onMode} />
      <Field
        label="Appearance"
        value={props.appearance}
        options={props.isRoot ? APPEARANCES_NO_AUTO : APPEARANCES_WITH_AUTO}
        onChange={props.onAppearance}
      />
      <div
        role="group"
        aria-label="Attention level buttons and badges"
        style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          gap: 'var(--Spacing-1)',
          paddingBottom: 'var(--Spacing-0)',
        }}
      >
        {(['high', 'medium', 'low'] as const).map((attention) => (
          <Button
            key={`btn-${attention}`}
            type="button"
            attention={attention}
            size="s"
            condensed
            appearance={props.appearance}
            start={ATTENTION_BUTTON_ICONS[attention]}
          >
            {attention === 'high' ? 'High' : attention === 'medium' ? 'Medium' : 'Low'}
          </Button>
        ))}
        {(['high', 'medium', 'low'] as const).map((attention, index) => (
          <Badge
            key={`badge-${attention}`}
            attention={attention}
            size="s"
            appearance={props.appearance}
            start={
              <CounterBadge
                value={index + 1}
                size="xs"
                appearance={props.appearance}
                aria-label={`${index + 1} notifications`}
              />
            }
            end={<Avatar content="icon" appearance={props.appearance} alt="Member" />}
            aria-label={`${attention} attention badge sample`}
          >
            {attention === 'high' ? 'High' : attention === 'medium' ? 'Medium' : 'Low'}
          </Badge>
        ))}
      </div>
      <span
        style={{
          marginLeft: 'auto',
          alignSelf: 'flex-end',
          paddingBottom: 'var(--Spacing-0)',
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-XS-FontSize)',
          lineHeight: 'var(--Label-XS-LineHeight)',
          fontWeight: 'var(--Label-FontWeight-Low)',
          color: 'var(--Text-Medium)',
        }}
      >
        <span style={{ opacity: 0.7 }}>step </span>
        <span style={{ color: 'var(--Text-High)', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
          {props.step ?? '—'}
        </span>
      </span>
    </div>
  );
}

// ─── Content readout (leaf only) ──────────────────────────────────────────────

function tokenForRole(role: ComponentAppearance, suffix: string): string {
  if (role === 'auto' || role === 'primary') return `--Primary-${suffix}`;
  const label = role
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('-');
  return `--${label}-${suffix}`;
}

function ContentReadout(props: { contentAppearance: ComponentAppearance }) {
  const { contentAppearance } = props;
  const textRows = [
    { label: 'high', cssVar: '--Text-High' },
    { label: 'medium', cssVar: '--Text-Medium' },
    { label: 'low', cssVar: '--Text-Low' },
    { label: 'tinted', cssVar: tokenForRole(contentAppearance, 'Tinted') },
    { label: 'tintedA11y', cssVar: tokenForRole(contentAppearance, 'TintedA11y') },
  ];
  const strokeRows = [
    { label: 'stroke medium', cssVar: '--Text-Medium-Stroke' },
    { label: 'stroke low', cssVar: '--Text-Low-Stroke' },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-1)',
        marginTop: 'var(--Spacing-1-5)',
      }}
    >
      {textRows.map((t) => (
        <div
          key={t.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--Spacing-1-5)',
            color: `var(${t.cssVar})`,
          }}
        >
          <span
            style={{
              flex: '0 0 6.5rem',
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-XS-FontSize)',
              lineHeight: 'var(--Label-XS-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Low)',
              color: 'var(--Text-Medium)',
            }}
          >
            {t.label}
          </span>
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            style={{ flex: '0 0 auto' }}
          >
            <circle cx="8" cy="8" r="6" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Body-M-FontSize)',
              lineHeight: 'var(--Body-M-LineHeight)',
              fontWeight: 'var(--Body-FontWeight-Medium)',
            }}
          >
            The quick brown fox jumps over the lazy dog
          </span>
        </div>
      ))}
      {strokeRows.map((s) => (
        <div
          key={s.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--Spacing-1-5)',
          }}
        >
          <span
            style={{
              flex: '0 0 6.5rem',
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-XS-FontSize)',
              lineHeight: 'var(--Label-XS-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Low)',
              color: 'var(--Text-Medium)',
            }}
          >
            {s.label}
          </span>
          <span
            aria-hidden
            style={{
              flex: 1,
              height: 0,
              borderTop: `var(--Stroke-M) solid var(${s.cssVar})`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── State pills (leaf only) ──────────────────────────────────────────────────

const STATE_PILL_MODES: SurfaceMode[] = ['ghost', 'blend', 'minimal', 'subtle', 'bold'];

function StatePills(props: { contentAppearance: ComponentAppearance; mediaContext: MediaContext }) {
  return (
    <div
      role="group"
      aria-label="Surface state previews"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--Spacing-1)',
        marginTop: 'var(--Spacing-1-5)',
      }}
    >
      {STATE_PILL_MODES.map((m) => (
        <Surface
          key={m}
          as="button"
          mode={m}
          material="transparent"
          mediaContext={props.mediaContext}
          appearance={props.contentAppearance}
          style={{
            font: 'inherit',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-S-FontSize)',
            lineHeight: 'var(--Label-S-LineHeight)',
            fontWeight: 'var(--Label-FontWeight-Medium)',
            color: 'var(--Text-High)',
            padding: 'var(--Spacing-0-5) var(--Spacing-2)',
            borderRadius: 'var(--Shape-Pill)',
            border:
              m === 'ghost'
                ? 'var(--Stroke-M) solid var(--Border-Subtle)'
                : 'var(--Stroke-M) solid transparent',
            cursor: 'pointer',
          }}
        >
          {m}
        </Surface>
      ))}
    </div>
  );
}

// ─── Per-level chrome ─────────────────────────────────────────────────────────

function bandStyle(): React.CSSProperties {
  return {
    padding: 'var(--Spacing-5)',
    borderRadius: 'var(--Shape-M)',
    boxShadow: '0 0 0 var(--Stroke-M) var(--Text-Low-Stroke)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-2)',
  };
}

// ─── Main inspector ───────────────────────────────────────────────────────────

interface LevelState {
  mode: SurfaceMode;
  appearance: ComponentAppearance;
}

function Inspector() {
  const [media, setMedia] = useState<MediaContext>('dynamic');
  // Defaults span all four interesting modes so the user sees per-mode
  // remapping working out of the box.
  const [l1, setL1] = useState<LevelState>({ mode: 'default', appearance: 'primary' });
  const [l2, setL2] = useState<LevelState>({ mode: 'subtle', appearance: 'auto' });
  const [l3, setL3] = useState<LevelState>({ mode: 'moderate', appearance: 'auto' });
  const [l4, setL4] = useState<LevelState>({ mode: 'ghost', appearance: 'secondary' });
  const [l5, setL5] = useState<LevelState>({ mode: 'bold', appearance: 'auto' });

  const chain = [l1, l2, l3, l4, l5];
  let inherited: ComponentAppearance = 'primary';
  const resolvedAppearances: ComponentAppearance[] = chain.map((lv) => {
    const eff = lv.appearance === 'auto' ? inherited : lv.appearance;
    inherited = eff;
    return eff;
  });
  const leafAppearance = resolvedAppearances[4];

  const [steps, setSteps] = useState<Record<string, string | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const next: Record<string, string | null> = {};
    for (const id of ['l1', 'l2', 'l3', 'l4', 'l5']) {
      const el = containerRef.current.querySelector<HTMLElement>(`[data-level="${id}"]`);
      next[id] = el?.getAttribute('data-surface-step') ?? null;
    }
    setSteps(next);
  }, [l1, l2, l3, l4, l5, media]);

  return (
    <div
      ref={containerRef}
      style={{
        padding: 'var(--Spacing-2)',
        minHeight: '100vh',
        boxSizing: 'border-box',
        // Saturated gradient under every level — the whole point of
        // transparent material is to let this show through differently
        // at each opacity step.
        background: BACKDROPS[media],
      }}
    >
      <div style={{ marginBottom: 'var(--Spacing-2)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 'var(--Spacing-2)',
            marginBottom: 'var(--Spacing-0-5)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Title-M-FontSize)',
              lineHeight: 'var(--Title-M-LineHeight)',
              fontWeight: 'var(--Title-M-FontWeight)',
              color: 'var(--Text-High)',
            }}
          >
            Nested Transparent Surface Inspector
          </div>
          <Field
            label="Media"
            value={media}
            options={MEDIA_CONTEXTS}
            onChange={(m) => setMedia(m as MediaContext)}
          />
        </div>
        <div
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
            color: 'var(--Text-High)',
          }}
        >
          Every level uses <code>material="transparent"</code> with the chosen media context.
          Watch for the bold mode flipping its content variant (dark text on a white fill in
          dynamic/dark, light text on a dark fill in light) and ghost staying truly transparent
          rather than collapsing to a solid neutral.
        </div>
      </div>

      <Surface
        mode={l1.mode}
        material="transparent"
        mediaContext={media}
        appearance={l1.appearance}
        data-level="l1"
        style={bandStyle()}
      >
        <LevelToolbar
          level={1}
          isRoot
          mode={l1.mode}
          appearance={l1.appearance}
          step={steps['l1'] ?? null}
          onMode={(mode) => setL1((p) => ({ ...p, mode }))}
          onAppearance={(appearance) => setL1((p) => ({ ...p, appearance }))}
        />
        <Surface
          mode={l2.mode}
          material="transparent"
          mediaContext={media}
          appearance={l2.appearance}
          data-level="l2"
          style={bandStyle()}
        >
          <LevelToolbar
            level={2}
            mode={l2.mode}
            appearance={l2.appearance}
            step={steps['l2'] ?? null}
            onMode={(mode) => setL2((p) => ({ ...p, mode }))}
            onAppearance={(appearance) => setL2((p) => ({ ...p, appearance }))}
          />
          <Surface
            mode={l3.mode}
            material="transparent"
            mediaContext={media}
            appearance={l3.appearance}
            data-level="l3"
            style={bandStyle()}
          >
            <LevelToolbar
              level={3}
              mode={l3.mode}
              appearance={l3.appearance}
              step={steps['l3'] ?? null}
              onMode={(mode) => setL3((p) => ({ ...p, mode }))}
              onAppearance={(appearance) => setL3((p) => ({ ...p, appearance }))}
            />
            <Surface
              mode={l4.mode}
              material="transparent"
              mediaContext={media}
              appearance={l4.appearance}
              data-level="l4"
              style={bandStyle()}
            >
              <LevelToolbar
                level={4}
                mode={l4.mode}
                appearance={l4.appearance}
                step={steps['l4'] ?? null}
                onMode={(mode) => setL4((p) => ({ ...p, mode }))}
                onAppearance={(appearance) => setL4((p) => ({ ...p, appearance }))}
              />
              <Surface
                mode={l5.mode}
                material="transparent"
                mediaContext={media}
                appearance={l5.appearance}
                data-level="l5"
                style={bandStyle()}
              >
                <LevelToolbar
                  level={5}
                  mode={l5.mode}
                  appearance={l5.appearance}
                  step={steps['l5'] ?? null}
                  onMode={(mode) => setL5((p) => ({ ...p, mode }))}
                  onAppearance={(appearance) => setL5((p) => ({ ...p, appearance }))}
                />
                <StatePills contentAppearance={leafAppearance} mediaContext={media} />
                <ContentReadout contentAppearance={leafAppearance} />
              </Surface>
            </Surface>
          </Surface>
        </Surface>
      </Surface>
    </div>
  );
}

export const NestedTransparentInspector: Story = {
  render: () => <Inspector />,
};
